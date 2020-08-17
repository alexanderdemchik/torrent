import {Service} from './models/Service';
import {ServiceInfo} from '../services/discovery';

export const save = async (service: ServiceInfo) : Promise<ServiceInfo> => {
  return Service.create(service);
};

export const getAll = async () : Promise<Array<ServiceInfo>> => {
  return Service.find();
};

export const deleteOne = async (address: string) => {
  await Service.deleteOne({address});
};

export const deleteMany = async (addresses: Array<string>) => {
  await Service.deleteMany({address: {$in: addresses}});
};
