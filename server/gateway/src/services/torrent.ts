import * as tMeta from 'torrent-metadata';
import {LoggerFactory} from '../logger';
import * as data from '../data/torrent';
import * as discovery from './discovery';
import axios from 'axios';
import {TorrentState} from '../enums/TorrentState';
import {ApiError} from '@torrent-downloader/common';
import {v4} from 'uuid';

const logger = LoggerFactory.getLogger(__filename);

export interface Torrent {
  _id: string,
  name?: string,
  infoHash: string,
  comment?: string,
  length: number,
  files?: {
    count?: number
  },
  stats: {
    state: TorrentState
    progress: number,
    speed: number,
    peers?: number
  },
  instance?: string
}

export interface TorrentDTO {
  _id: string,
  name?: string,
  infoHash: string,
  comment?: string,
  length: number,
  files?: {
    count?: number
  },
  stats: {
    state: TorrentState
    progress: number,
    speed: number,
    peers?: number
  },
}

const toDto = (torrent: Torrent) : TorrentDTO => {
  return {
    _id: torrent._id,
    name: torrent.name,
    comment: torrent.comment,
    stats: torrent.stats,
    length: torrent.length,
    files: torrent.files,
    infoHash: torrent.infoHash
  }
};

const validate = (body: Buffer | string) => {
  if (body instanceof Buffer) {
    if (body.length === 0) throw new ApiError(400, 'INVALID_TORRENT_FILE');
  } else {
    const regex = new RegExp(/magnet:\?xt=urn:btih:[a-zA-Z0-9]*/g);
    // @ts-ignore
    if (!regex.test(body)) {
      throw new ApiError(400, 'INCORRECT_MAGNET_LINK');
    }
  }
};

export const create = async (input: Buffer | string): Promise<TorrentDTO> => {
  validate(input);

  let meta: tMeta.Metadata;
  let instance: discovery.ServiceInfo;

  try {
    meta = await tMeta.getMetadata(input);
  } catch (err) {
    throw new ApiError(400, 'FAILED_TO_FETCH_METADATA');
  }

  try {
    instance = discovery.findAppropriateInstance(meta);
  } catch (err) {
    throw new ApiError(400, 'SERVER_OVERLOADED');
  }

  const id: string = v4();
  await axios.post(`${instance.address}/api/torrent/${meta.infoHash}`, input, {
    headers: {
      'Content-Type': input instanceof Buffer ? 'application/octet-stream' : 'text/plain'
    }
  });

  const torrent: TorrentDTO = {
    _id: id,
    name: meta.name,
    infoHash: meta.infoHash,
    comment: meta.comment || '',
    files: {
      count: meta.files?.length
    },
    length: meta.length,
    stats: {
      state: TorrentState.DOWNLOADING,
      progress: 0,
      speed: 0,
      peers: 0
    }
  };

  await data.create({...torrent, instance: instance.address});

  logger.debug(`Create new torrent ${id}`);

  return torrent;
};

export const getAll = async (): Promise<Array<TorrentDTO>> => {
  return (await data.getAll()).map(el => {
    return toDto(el);
  });
};

export const get = async (id: string): Promise<TorrentDTO> => {
  const torrent = await data.get(id);

  if (!torrent) throw new ApiError(404);

  return toDto(torrent);
};

export const patch = () => {
};

export const update = () => {
};

export const remove = async (id: string) => {
  await data.remove(id);
};
