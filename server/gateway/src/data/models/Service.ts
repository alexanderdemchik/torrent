import {Schema, model, Document} from 'mongoose';
import {ServiceInfo} from '../../services/discovery';

const schema = new Schema({address: String});

export const Service = model<ServiceInfo & Document>('Service', schema);
