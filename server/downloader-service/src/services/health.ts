/**
 * Module responsible for sending system status to gateway
 * Uses udp protocol for message delivery
 * @packageDocumentation
 */
import sys from 'systeminformation';
import {SystemInfo, DriveInfo, CPUInfo, MemoryInfo} from '@torrent-downloader/common';
import {checkFreeSpace} from '../utils/drive/checkFreeSpace';
import {storagePath} from 'config';
import {LoggerFactory} from '../logger';

const logger = LoggerFactory.getLogger(__filename);

/**
 * Collects system info
 */
export const collect = async () : Promise<SystemInfo> => {
  const driveRes = await checkFreeSpace(storagePath);
  const drive: DriveInfo = {size: driveRes.size, free: driveRes.free};

  const cpuRes = await sys.currentLoad();
  const cpu: CPUInfo = {currentLoad: cpuRes.currentload};

  const memoryRes = await sys.mem();
  const memory: MemoryInfo = {free: memoryRes.free, total: memoryRes.total, used: memoryRes.used};

  return {drive, memory, cpu};
};

export const get = async (): Promise<SystemInfo> => {
  const data = await collect();

  // TODO: handle object logging without JSON.stringify
  logger.debug(`get health: ${JSON.stringify(data)}`);
  return data;
};
