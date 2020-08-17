import {port} from 'config';
import Koa from 'koa';
import bodyparser from 'koa-bodyparser';
import {LoggerFactory} from './logger';
import * as db from './db';
import * as discovery from './services/discovery';
import * as statsReceiver from './services/statsReceiver';
import router from './router';
import cors from '@koa/cors';
import {Duplex} from 'stream';

// const logger = LoggerFactory.getLogger(__filename);

// const app = new Koa();

// /*
//  * CORS MIDDLEWARE
//  */
// app.use(cors());

// /*
//  * ERROR HANDLING MIDDLEWARE
//  */
// app.use(async (ctx, next) => {
//   try {
//     await next();
//   } catch (err) {
//     logger.error(err.message);
//     ctx.status = err.status || 500;
//     ctx.body = {
//       timestamp: new Date(),
//       status: ctx.status,
//       message: err.message
//     };
//   }
// });

// /*
//  * AUTH MIDDLEWARE
//  */
// // app.use(async (ctx, next) => {
// //   // TODO: create auth
// //   ctx.user = {_id: 'aba3baa3gbaa3423d'};
// //   next();
// // });

// app.use(bodyparser({enableTypes: ['json', 'form', 'text']}));

// app.use(router.routes());

// app.listen(port, () => {
//   logger.info(`Started app on port ${port}`);
//   discovery.init();
//   statsReceiver.init();
//   db.connect();
// });

class DStream extends Duplex {
  name: string;
  constructor(name) {
    super();
    this.name = name;
  }

  _write(chunk) {
    // console.log(this.name);
    // console.log(chunk.toString());
    if (this.name === 'i2') {
      this.push(chunk.toString() + 's', 'utf-8');
    } else {
      this.push(chunk.toString())
    }
  }

  _read() {
  }
}

const i1 = new DStream("i1");
const i2 = new DStream('i2');

i1.pipe(i2).pipe(i1);

i2.write('sd');

i2.on('data', (chunk) => {
  console.log('i2')
  console.log(chunk);
});
