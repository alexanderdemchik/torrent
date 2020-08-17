import {gateway, hostname, port} from 'config';
import axios from 'axios';
import {LoggerFactory} from '../logger';
import {DiscoveryRegisterInfo} from '@torrent-downloader/common';

const logger = LoggerFactory.getLogger(__filename);

const RECONNECT_TIMEOUT = 10000;

export const register = async () => {
  const info: DiscoveryRegisterInfo = {hostname, port};
  try {
    await axios.post(`${gateway.address}/api/discovery`, info);
    logger.info(`Connected to gateway: ${gateway.address}`);
  } catch (e) {
    logger.error(`Error occurred while connecting to gateway. Reconnection attempt after ${RECONNECT_TIMEOUT}`);
    setTimeout(() => register(), RECONNECT_TIMEOUT);
  }
};
