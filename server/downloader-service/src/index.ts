import {port} from 'config';
import Koa from 'koa';
import Router from 'koa-router';
import bodyparser from 'koa-bodyparser';
import {LoggerFactory} from './logger';
import koaSwagger from 'koa2-swagger-ui';
import spec from './spec';
import * as torrentController from './controllers/torrent';
import * as healthController from './controllers/health';
import {register} from './services/registrar';

const logger = LoggerFactory.getLogger(__filename);

const app = new Koa();
const router = new Router({prefix: '/api'});

app.use(bodyparser());

router.post('/torrent/:id', torrentController.create);
router.get('/torrent', torrentController.getAll);
router.delete('/torrent/:id', torrentController.remove);

router.get('/health', healthController.get);

router.get('/docs', koaSwagger({routePrefix: false, swaggerOptions: {spec}})); // swagger-ui

router.get('/(.*)', (ctx) => {
  ctx.body = 'not found';
});

app.use(router.routes());

app.listen(port, () => {
  logger.info(`Started app on port ${port}`);

  // Register service in gateway
  register();
});
