import {EventEmitter} from 'events';
import Discovery from 'torrent-discovery';
import parseTorrent from 'parse-torrent';
import {TorrentClient} from './index';
import {Wire} from 'bittorrent-protocol';
import BitField from 'bitfield';
import Peer from './peer';

const debug = require('debug')('node-torrent');

export class Torrent extends EventEmitter {
  discovery: Discovery;
  client: TorrentClient;
  peers: Record<string, Peer> = {};
  queue: Array<any> = [];
  wired: Array<string> = []; // id of peers that handshaked
  metadata?: Buffer; 
  destroyed: boolean = false;
  hashes: Array<any> = [];
  infoHash?: string;
  private?: boolean;

  constructor(magnet: string, client: TorrentClient) {
    super();
    this.client = client;

    const parsedTorrent = parseTorrent(magnet);

    this.infoHash = parsedTorrent.infoHash;

    this.discovery = new Discovery({
      infoHash: parsedTorrent.infoHash,
      peerId: client.peerId,
      dht: client.dht,
      port: client.torrentPort
    });

    this.discovery.on('error', (err) => {
      // this._destroy(err)
    })

    this.discovery.on('peer', (peer) => {
      this.addPeer(peer)
    })

    this.discovery.on('trackerAnnounce', () => {
      this.emit('trackerAnnounce')
    })

    this.discovery.on('dhtAnnounce', () => {
      this.emit('dhtAnnounce')
    })

    this.discovery.on('warning', (err) => {
      this.emit('warning', err)
    })
  }

  async addPeer(peer: string) {
    const id = peer;
    
    if (this.peers[id]) {
      return null;
    }


    const newPeer = Peer.createTCPOutgoingPeer(peer, this);

    if (Object.keys(this.peers).length > 50) {
      this.queue.push(newPeer);
    }
   
    debug(`Add peer ${peer}`);

    this.peers[newPeer.id] = newPeer;

    try {
      await newPeer.connect();
    } catch (e) {
     
    }

    return newPeer;
  }

  deletePeer(peer) {
    const id = (peer && peer.id) || peer;

    delete this.peers[id];

    peer.destroy();
    //
  }

  handleMetadata(metadata: Buffer) {
    if (this.metadata) return;

    if (metadata instanceof Buffer) {
      this.metadata = metadata;

      const parsed = parseTorrent(metadata);

    } else {
      return;
    }

    for (let peerId of Object.keys(this.peers)) {
      // this.peers[peerId]
    }
    // //@ts-ignore
    // debug(parseTorrent.toTorrentFile(parsed).toString());
    // this.hashes = this.metadata.pieces;
  }
}