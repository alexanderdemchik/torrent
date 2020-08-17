import Discovery from 'torrent-discovery';
import parseTorrent from 'parse-torrent';
import net from 'net';
import Protocol from 'bittorrent-protocol';
import ut_metadata from 'ut_metadata';
import crypto from 'crypto';
import bencode from 'bencode';

export interface TorrentInfo {
  'name.utf-8'?: string;
  name?: string;
  files?: File[];
  'piece length'?: number;
  pieces?: number;
  private?: boolean;
}

export interface ParsedFile {
  path: string;
  name: string;
  length: number;
  offset: number;
}

export interface Metadata {
  info?: TorrentInfo;
  infoBuffer?: Buffer;
  infoHash: string;
  comment?: string;
  infoHashBuffer?: Buffer;
  name?: string;
  private?: boolean;
  created?: Date;
  createdBy?: string;
  announce?: string[];
  urlList?: string[];
  pieceLength?: number;
  lastPieceLength?: number;
  pieces?: string[];
  length: number;
  files?: ParsedFile[];
}

export interface Options {
  selfId?: Buffer,
  selfPort?: number,
  timeout?: number,
  socketTimeout?: number,
  maxConns?: number
}

export interface DefaultOptions {
  selfId: Buffer,
  selfPort: number,
  timeout: number,
  socketTimeout: number,
  maxConns: number
}

const defaultOptions: DefaultOptions = {
  selfId: crypto.randomBytes(20),
  selfPort: 49000,
  timeout: 10000,
  socketTimeout: 5000,
  maxConns: 50
}

/**
 * Extracts torrent metadata
 * @param torrent .torrent file | infohash | magnet link
 */
export const getMetadata = async (torrent: string | Buffer, options: Options = {}): Promise<Metadata> => {
  const opts: DefaultOptions = {...defaultOptions, ...options};
  const peerQueue: Array<string> = [];
  const parsed: Metadata = parseTorrent(torrent);
  
  // in case of .torrent file - just return parsed file
  if (torrent instanceof Buffer && parsed.length && parsed.name) {
    return parsed;
  }

  const infoHash = parsed.infoHash;

  const pool = new SocketPool();
  const discovery = new Discovery({
    infoHash, 
    peerId: opts.selfId, 
    port: opts.selfPort,
    announce: parsed.announce || []
  });

  const meta = await new Promise<Metadata>((resolve, reject) => {
    const handlePeer = async (peer: string) => {
      if (pool.size >= opts.maxConns) {
        peerQueue.push(peer);
      }

      const {id, socket} = pool.createSocket();    
      try {
        const meta = await getMetadataFromPeer(infoHash, peer, {socket, selfId: opts.selfId, timeout: opts.socketTimeout});
        resolve(meta);
      } catch (err) {
        pool.destroySocket(id);
        if (peerQueue.length > 0) {
          // @ts-ignore
          handlePeer(peerQueue.shift());
        }
      }
    } 
   
    discovery.on('peer', peer => {
      handlePeer(peer);
    });

    discovery.on('error', (err) => {
      reject(err)
    });

    setTimeout(() => {
      reject(new Error('Timeout error'));
    }, opts.timeout);
  });

  discovery.removeAllListeners().destroy();
  pool.destroyAllSockets();
  
  return meta;
}

/**
 * Obtain torrent metadata from peer
 * @param infoHash infoHash of torrent
 * @param peer peer - string in format "ip:port"
 * @param socket {@link net.Socket}
 */
const getMetadataFromPeer = async (infoHash: string, peer: string, opts: {
  socket?: net.Socket,
  timeout?: number,
  selfId?: Buffer
} = {}): Promise<Metadata> => {
  const timeout = opts.timeout || defaultOptions.socketTimeout;
  const socket = opts.socket || new net.Socket();
  const selfId = opts.selfId || defaultOptions.selfId;  
 
  const [address, port] = peer.split(':');

  return new Promise((resolve, reject) => {
    socket.setTimeout(timeout, () => {
      socket.destroy();
      const err = new Error(`socket timeout after ${timeout}ms`);
      reject(err);
    });

    socket.connect(Number(port), address, () => {
      const wire = new Protocol();
      socket.pipe(wire).pipe(socket);
      wire.use(ut_metadata());

      wire.handshake(infoHash, selfId, { dht:true });
      wire.on('handshake', () => {
        wire.ut_metadata.fetch();
      });

      wire.ut_metadata.on('metadata', (rawMetadata: Buffer) => {
        let metadata: any = null;
        let parsedMetadata: any = null;

        try {
          metadata = bencode.decode(rawMetadata);
          const infohashOfRawMetadata = crypto.createHash('sha1').update(bencode.encode(metadata.info)).digest('hex');
          // Verify the infohash of received metadata.
          if (infohashOfRawMetadata.toString() !== infoHash) {
            metadata = null;
          }
        } catch (err) {
          metadata = null
        };
        
        socket.destroy();

        if (metadata === null) { return socket.emit('error', new Error('fail to fetch metadata')); }

        parsedMetadata = parseTorrent(rawMetadata);

        resolve(parsedMetadata);
      })
    });

    socket.on('error', err => {
      !socket.destroyed && socket.destroy();
      reject(err);
    });
  });
}

/**
 * Helper class to controll sockets
 */
class SocketPool {
  private pool: Map<number, net.Socket>;
  private idsSequence: number;

  constructor() {
    this.pool = new Map<number, net.Socket>();
    this.idsSequence = 0;
  }

  get size() {
    return this.pool.size;
  }

  createSocket() {
    const socket = new net.Socket();
    this.pool.set(++this.idsSequence, socket);
    return { socket, id: this.idsSequence };
  }

  destroySocket(socketId: number) {
    if (!this.pool.has(socketId)) return;
    const socket = this.pool.get(socketId);
    if (socket && !socket.destroyed) { socket.destroy(); }
    this.pool.delete(socketId);
  }

  destroyAllSockets() {
    for (let socket of this.pool.values()) {
      !socket.destroyed && socket.destroy();
    }
    this.pool.clear();
  }
}

export default {getMetadata};
