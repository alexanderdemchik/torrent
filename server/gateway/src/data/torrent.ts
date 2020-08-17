import {Torrent} from './models/Torrent';
import {Torrent as ITorrent} from '../services/torrent';

export const create = async (torrent: ITorrent): Promise<ITorrent> => {
  return Torrent.create(torrent);
};

export const update = async (id: string, torrent: any) => {
  await Torrent.updateOne({_id: id}, {$set: torrent});
};

export const updateStats = async (infoHash: string, stats: any) => {
  await Torrent.updateOne({infoHash}, {
    $set: {
      'stats.speed': stats.speed,
      'stats.progress': stats.progress,
      'stats.peers': stats.peers
    }
  });
};

export const getAll = async (): Promise<Array<ITorrent>> => {
  return Torrent.find();
};

export const get = async (id: string): Promise<ITorrent | null> => {
  return Torrent.findOne({_id: id});
};

export const remove = async (id: string) => {
  await Torrent.deleteOne({_id: id});
};
