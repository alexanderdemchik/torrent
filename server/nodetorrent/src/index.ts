import { EventEmitter } from 'events';
import randombytes from 'randombytes';
import DHT from 'bittorrent-dht/client';
import {Torrent} from './torrent';
import * as tMeta from 'torrent-metadata';

const debug = require('debug')('node-torrent');

export class TorrentClient extends EventEmitter {
  peerId: Buffer;
  nodeId: Buffer;
  dht: DHT | boolean;
  dhtPort: number;
  torrentPort: number
  
  constructor() {
    super();
    this.peerId = randombytes(20);
    this.nodeId = randombytes(20);
    this.dhtPort = 13453;
    this.torrentPort = 13435;

    /*
     * DHT INITIALIZATION START
     */
    this.dht = new DHT({
      nodeId: this.nodeId
    });

    this.dht.once('listening', () => {
      const address = this.dht.address();
      if (address) this.dhtPort = address.port;
    });

    this.dht.listen(this.dhtPort);
    /*
     * DHT INITIALIZATION END
     */


  }

  add = (magnet: string) => {
    const torrent = new Torrent(magnet, this);

    return torrent;
  }
}

const magnet = 'magnet:?xt=urn:btih:fdaed420b58ed942a5d7606e21274fbaa0ddcbd2';
const m2 = 'magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fbig-buck-bunny.torrent';
// new TorrentClient();
new TorrentClient().add(m2);

// (async () => {
//   console.log(await tMeta.getMetadata(m2))
//   console.log('=-=-----------------------------')
// })()
