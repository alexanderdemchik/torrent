import * as client from './torrentClient';

export const create = async (body, id) => {
  return client.add(body, id);
};

export const getAll = () => {
  return client.getAll();
};

export const remove = (id) => {
  client.remove(id);
};
