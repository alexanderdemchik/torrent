/**
 * Module responsible for sending torrent status to gateway
 * Uses udp protocol for message delivery
 * @packageDocumentation
 */
import dgram from 'dgram';
import {gateway} from 'config';
import {LoggerFactory} from '../../logger';
import {TorrentStatus} from '@torrent-downloader/common';
import {Batcher} from '../../utils/Batcher';

const logger = LoggerFactory.getLogger(__filename);
const options = gateway.torrentStatsReceiver;

const client = dgram.createSocket('udp4');

const batcher = new Batcher();

/**
 * func to send current torrents status to gateway
 * @param status torrent status
 */
export const sendStatus = (status: TorrentStatus) => {
  batcher.batch(status, 5000, (elements: Array<TorrentStatus>) => {
    const str = JSON.stringify(filterElements(elements));
    client.send(str, options.port, options.host, (err) => {
      if (err) {
        logger.error(err);
      } else {
        logger.debug(`Send status ${str} to ${options.host}:${options.port}`);
      }
    });
  });
};

/**
 * Filter elements with same id and leaves only last added
 * @param elements
 */
const filterElements = (elements: Array<TorrentStatus>) => {
  const map = {};

  elements.map((el) => {
    map[el.infoHash] = el;
  });

  return Object.keys(map).map((id) => map[id]);
};
