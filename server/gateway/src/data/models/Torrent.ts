import {Schema, model, Document} from 'mongoose';
import {TorrentState} from '../../enums/TorrentState';
import {Torrent as ITorrent} from '../../services/torrent';

export const schema = new Schema({
  _id: String,
  name: String,
  infoHash: String,
  user: String,
  stats: {
    state: {
      type: String,
      enum: [TorrentState.DOWNLOADING, TorrentState.FINISHED]
    },
    progress: Number,
    peers: Number,
    speed: Number
  },
  instance: String
});

export const Torrent = model<ITorrent & Document>('Torrent', schema);
