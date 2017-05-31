import Hapi from 'hapi';
import vision from 'vision';
import inert from 'inert';
import lout from 'lout';
import { add } from './db';

import rates from './endpoints/rates/{base}/{quote}/index';

const server = new Hapi.Server();
server.connection({
  port: 3001,
  host: 'localhost',
  routes: {
    cors: true,
  },
});

server.register([
  vision,
  inert,
  { register: lout },
], (err) => err ? console.error(err) : null);

const dependencies = {
  addStats: add('db.json'),
};
server.route(
  [
    rates,
  ].map((f) => typeof f === 'function' ? rates(dependencies) : rates)
);

server.start((err) => {
  if (err) throw err;
  console.log(`Server running at: ${server.info.uri}`);
});
