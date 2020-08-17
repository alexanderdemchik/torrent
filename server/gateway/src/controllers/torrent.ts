import * as torrent from '../services/torrent';
import {ParameterizedContext} from 'koa';

export const create = async (ctx: ParameterizedContext) => {
  let data: Buffer | string;
  if (ctx.request.is('text/plain')) {
    data = ctx.request.body;
  } else {
    data = await new Promise((resolve, reject) => {
      const body: Array<any> = [];
      ctx.req.on('error', (err) => {
        reject(err);
      }).on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        resolve(Buffer.concat(body));
      });
    });
  }

  ctx.body = await torrent.create(data);
  ctx.status = 200;
};

export const get = async (ctx: ParameterizedContext) => {
  ctx.body = await torrent.get(ctx.params.id);
  ctx.status = 200;
};

export const getAll = async (ctx: ParameterizedContext) => {
  ctx.body = await torrent.getAll();
  ctx.status = 200;
};

export const update = async (ctx: ParameterizedContext) => {
  // ctx.body = await torrent.update(ctx.body);
  ctx.status = 200;
};

export const patch = async (ctx: ParameterizedContext) => {
  // ctx.body = await torrent.patch(ctx.body);
  ctx.status = 200;
};

export const remove = async (ctx: ParameterizedContext) => {
  await torrent.remove(ctx.body);
  ctx.status = 200;
};
