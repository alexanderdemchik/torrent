import * as health from '../services/health';

export const get = async (ctx) => {
  ctx.body = await health.get();
};
