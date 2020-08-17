/**
 * Module responsible for downloading torrents
 * @packageDocumentation
 */
import WebTorrent, {Torrent} from 'webtorrent';
import {storagePath} from 'config';
import {LoggerFactory} from '../../logger';
import * as torrentStatusNotifier from './torrentStatusNotifier';

const logger = LoggerFactory.getLogger(__filename);

/**
 * Instance of {@link https://github.com/webtorrent/webtorrent} lib
 */
const client = new WebTorrent();
/**
 * correlation between generated torrent id and webtorrent torrent id
 */
const idMap: Map<string, string | Buffer> = new Map();

/**
 * @param input torrent file {@link Buffer} or magnet link {@link String}
 */
export async function add(input: string | Buffer, infoHash: string) : Promise<{}> {
  logger.debug('Add torrent');
  // Add new
  const torrent: Torrent = await new Promise((resolve, reject) => {
    const torrent = client.add(input, {
      path: `${storagePath}/${infoHash}`
    });

    torrent.on('ready', () => {
      resolve(torrent);
    });

    torrent.on('error', (err) => {
      logger.error(err);
      reject(err);
    });
  });

  idMap.set(infoHash, input);

  torrent.on('error', (err) => {
    logger.error(err);
  });

  torrent.on('download', () => {
    torrentStatusNotifier.sendStatus({infoHash, progress: torrent.progress, speed: torrent.downloadSpeed, peers: torrent.numPeers});
  });

  torrent.on('done', () => {
    // TODO: send done request to gateway
  });

  return {};
}

export const getAll = () => {
  const res: any = [];
  idMap.forEach((element, key) => {
    const t = get(key);
    if (t) {
      res.push(t);
    }
  });
  return res;
};

export const get = (id: string) => {
  const tId = idMap.get(id);

  if (tId) {
    const torrent = client.get(tId);
    if (torrent) {
      return {id, name: torrent.name};
    }
  }
};

export const remove = (id) => {
  const tId = idMap.get(id);
  if (tId) {
    const torrent = client.get(tId);
    if (torrent) {
      torrent.destroy();
    }
  }
};
