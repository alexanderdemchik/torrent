import dgram from 'dgram';
import * as data from '../data/torrent';
import {torrent} from 'config';
import {LoggerFactory} from '../logger';

const logger = LoggerFactory.getLogger(__filename);

export const stats: Record<string, {
  progress: number,
  speed: number,
  peers?: number
}> = {};

export const init = () => {
  const server = dgram.createSocket('udp4');

  server.on('error', (err) => {
    logger.error(`[STATS_RECEIVER] error:\n${err.stack}. Re-init after 10 sec`);
    server.close();
    setTimeout(() => init(), 10000);
  });

  server.on('message', async (msg) => {
    logger.debug(`[STATS_RECEIVER] got: ${msg}`);
    const parsed = JSON.parse(msg.toString());

    for (const stat of parsed) {
      await data.updateStats(stat.infoHash, stat);
    }
  });

  server.on('listening', () => {
    const address = server.address();
    logger.info(`[STATS_RECEIVER] listening ${address.address}:${address.port}`);
  });

  server.bind(torrent.statsReceiver.port);
};
