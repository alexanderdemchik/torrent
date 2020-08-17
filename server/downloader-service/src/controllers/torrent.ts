import {ParameterizedContext} from 'koa';
import * as torrent from '../services/torrent';

export const create = async (ctx: ParameterizedContext) => {
  const buffer = await getReqBody(ctx.req);
  let input: Buffer | string;
  if (ctx.request.header['content-type'] && ctx.request.header['content-type'].includes('text/plain')) {
    input = buffer.toString();
  } else {
    input = buffer;
  }

  ctx.body = await torrent.create(input, ctx.params.id);
  ctx.status = 200;
};

export const remove = async (ctx: ParameterizedContext) => {
  await torrent.remove(ctx.params.id);
};

// export const get = (ctx: ParameterizedContext) => {

// };

export const getAll = async (ctx: ParameterizedContext) => {
  ctx.body = await torrent.getAll();
};

const getReqBody = async (req) : Promise<Buffer> => {
  const body: Array<any> = [];

  return new Promise((resolve, reject) => {
    req.on('error', (err) => {
      reject(err);
    }).on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      resolve(Buffer.concat(body));
    });
  });
};
