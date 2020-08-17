import Router from 'koa-router';
import * as discoveryController from './controllers/discovery';
import * as torrentController from './controllers/torrent';
import koaSwagger from 'koa2-swagger-ui';
import spec from './spec';

const router = new Router({prefix: '/api'});

/*
 * SWAGGER-UI
 */
router.use(koaSwagger());
router.get('/docs', koaSwagger({routePrefix: false, swaggerOptions: {spec}}));

router.post('/discovery', discoveryController.register);
router.post('/torrent', torrentController.create);
router.get('/torrent', torrentController.getAll);
// router.put('/torrent', torrentController.create);

router.get('/(.*)', (ctx) => {
  ctx.body = 'not found';
});

export default router;
