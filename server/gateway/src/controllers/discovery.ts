import {ParameterizedContext} from 'koa';
import * as discovery from '../services/discovery';

export const register = (ctx: ParameterizedContext) => {
  const body = ctx.request.body;
  discovery.register({port: body.port, hostname: body.hostname});
  ctx.body = '';
  ctx.status = 200;
};
