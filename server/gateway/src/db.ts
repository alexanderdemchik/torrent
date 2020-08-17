import mongoose from 'mongoose';
import {db} from 'config';
import {LoggerFactory} from './logger';

const logger = LoggerFactory.getLogger(__filename);
const REC_TIME = 10000;

export const connect = async () => {
  try {
    await mongoose.connect(db.url, {useUnifiedTopology: true, useNewUrlParser: true});
  } catch (e) {
    logger.error(`[Mongo DB] connection error. Reconnection attempt after ${REC_TIME}`);
    setTimeout(() => connect(), REC_TIME);
  }
};
