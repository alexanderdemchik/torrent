import {LoggerFactory} from '../logger';
import {DiscoveryRegisterInfo, SystemInfo} from '@torrent-downloader/common';
import axios from 'axios';
import * as data from '../data/discovery';
import {Metadata} from 'torrent-metadata';

export interface ServiceInfo {
  address: string
}

const logger = LoggerFactory.getLogger(__filename);

let services: Array<ServiceInfo> = [];
const health: Record<string, SystemInfo> = {};

/**
 * Registers new service instance
 * @param info Info of service to be registred
 */
export const register = async (info: DiscoveryRegisterInfo) => {
  const address = `http://${info.hostname}:${info.port}`;
  if (!services.find(service => service.address === address)) {
    logger.info(`Register service. Address: ${address}`);
    await data.save({address});
    services.push({address});
  }
};

/**
 * Checks health of service
 * @param service '
 */
export const checkServiceHealth = async (service: ServiceInfo): Promise<SystemInfo> => {
  const res = await axios.get(`${service.address}/api/health`);
  return res.data;
};

/**
 * Checks health of all services by sending http requests to their health endpoint
 */
export const checkHealth = async () => {
  for (const service of services) {
    try {
      const info = await checkServiceHealth(service);
      health[service.address] = info;
    } catch (e) {
      data.deleteOne(service.address);
      services = services.filter(el => el.address !== service.address);
    }
  }
  logger.debug(`Health: ${JSON.stringify(health)}`);
  logger.debug(`Services: ${JSON.stringify(services)}`);
};

export const init = async () => {
  services = await data.getAll(); // load all servers saved to db

  // check health of services
  await checkHealth();
  setInterval(async () => await checkHealth(), 10000);
};

/**
 * find appropriate torrent-downloader instance taking into account (free space, ...to be more)
 * @param torrent torrent metadata
 */
export const findAppropriateInstance = (torrent: Metadata): ServiceInfo => {
  const length = torrent.length;

  for (const service of services) {
    if (health[service.address]) {
      if (health[service.address].drive.free > length) {
        return service;
      }
    }
  }

  // TODO: implement queue for torrent requests
  throw new Error();
};
