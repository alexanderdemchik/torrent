import Wire from 'bittorrent-protocol';
import {Torrent} from './torrent';
import net from 'net';
import {timeout} from './utils';
const ut_metadata = require('ut_metadata');
import utPex from 'ut_pex';

const debug = require('debug')('node-torrent');

const CONNECT_TIMEOUT = 10000;
const HANDSHAKE_TIMEOUT = 10000;
const PIECE_TIMEOUT = 10000;

class Peer {
  id?: string;
  torrent?: Torrent;
  addr?: string;
  wire?: Wire.Wire;
  connection?: net.Socket;

  constructor(id: string) {
    this.id = id;
  }

  static createTCPOutgoingPeer(addr, torrent): Peer {
    const peer = new Peer(addr);
    peer.addr = addr;
    peer.torrent = torrent;

    return peer;
  }

  async connect() {
    if (!this.addr) return;
    const [host, port] = this.addr.split(':');
    this.connection = net.connect({host, port: Number(port)});

    await new Promise((resolve, reject) => {
      //@ts-ignore
      this.connection.once('connect', () => {
        resolve();
      });

      //@ts-ignore
      this.connection.once('error', (err) => {
        reject(err);
      });

      //@ts-ignore
      this.connection.once('close', () => {
        reject(new Error('Connection closed'));
      });
    });

    this.handleConnect();
    
    const [infoHash, peerId] = await this.sendHandshake();
    this.handleHandshake(infoHash, peerId);
  }

  handleConnect() {
    const conn = this.connection;

    const wire = this.wire = new Wire();

    conn.pipe(wire).pipe(conn);

    conn.once('end', () => {
      this.destroy()
    });

    conn.once('close', () => {
      this.destroy()
    });
    
    conn.once('finish', () => {
      this.destroy();
    });

    conn.once('error', err => {
      this.destroy();
    });

    wire.once('error', (err) => {
      this.destroy();
    });
  }

  async sendHandshake() {
    const wire = this.wire;

    debug(`${this.addr} send handshake`);
    
    wire.use(ut_metadata(this.torrent.metadata));
    // When peer sends PORT message, add that DHT node to routing table
    //@ts-ignore
    if (this.torrent.client.dht && this.torrent.client.dht.listening) {
      this.handleDhtPort();
    }

    // use ut_pex extension if the torrent is not flagged as private
    if (typeof utPex === 'function' && !this.torrent?.private) {
     this.handleUtPex();
    }

    return new Promise<any>((resolve, reject) => {
        wire.once('handshake', (infoHash, peerId) => {
          resolve([infoHash, peerId]);
        });

        wire.once('error', (err) => {
          reject(err);
        });

        wire.handshake(this.torrent.infoHash, this.torrent.client.peerId);
      });
  } 

  handleHandshake(infoHash, peerId) {
    const wire = this.wire;

    debug(`handle handshake from ${this.addr}`)
    //@ts-ignore
    if (infoHash !== this.torrent.infoHash) {
      throw new Error('Inconsistient info hash');
    }

    //@ts-ignore
    if (peerId === this.torrent.client.peerId) {
      throw new Error('Refuse connection to ourselves');
    }
  
    wire.setTimeout(PIECE_TIMEOUT, true);
    wire.setKeepAlive(true);

    wire.on('timeout', () => {
      this.destroy();
    });

    // @ts-ignore
    if (!this.torrent.metadata) {
      debug(`fetch metadata from ${this.addr}`)

      wire.ut_metadata.on('warning', err => {
        debug('ut_metadata warning: %s', err.message)
      });

      wire.ut_metadata.on('metadata', metadata => {
        debug(`got metadata from ${this.addr}`)
        this.torrent.handleMetadata(metadata);
      });

      wire.ut_metadata.fetch();
    }


    this.torrent.wired.push(this.id);
  }

  handleUtPex() {
    const wire = this.wire;
    wire.use(utPex())

    wire.ut_pex.on('peer', peer => {
      // Only add potential new peers when we're not seeding
      // if (this.done) return
      // this._debug('ut_pex: got peer: %s (from %s)', peer, addr)
      // this.addPeer(peer)
    })

    wire.ut_pex.on('dropped', peer => {
      // the remote peer believes a given peer has been dropped from the torrent swarm.
      // if we're not currently connected to it, then remove it from the queue.
      // const peerObj = this._peers[peer]
      // if (peerObj && !peerObj.connected) {
        // this.removePeer(peer)
      // }
    });

    wire.once('close', () => {
      // Stop sending updates to remote peer
      // this.ut_pex.reset()
    });
  }

  handleDhtPort() {
    const wire = this.wire;
    wire.on('port', port => {
      if (!wire.remoteAddress) {
        return;
        // return this._debug('ignoring PORT from peer with no address')
      }
      if (port === 0 || port > 65536) {
        return;
        // return this._debug('ignoring invalid PORT from peer')
      }

      // this._debug('port: %s (from %s)', port, addr)
      this.torrent.client.dht.addNode({ host: wire.remoteAddress, port })
    });
  }

  setMetadata(metadata) {
    const wire = this.wire;

    if (wire && wire.ut_metadata) {
      wire.ut_metadata.setMetadata(metadata);
    }
  }

  destroy() {
    debug(`destroy ${this.addr}`)
    this.wire?.destroy();
    this.connection?.destroy();
  }
}

export default Peer;