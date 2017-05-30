import Hapi from 'hapi';
import vision from 'vision';
import inert from 'inert';
import lout from 'lout';
import { add } from './db';

import rates from './endpoints/rates/{base}/{quote}/index';

const server = new Hapi.Server();
server.connection({ port: 3001, host: 'localhost' });

server.register([vision, inert, { register: lout }], (err) => console.log(err));

const dependencies = {
  addStats: add('db.json'),
};

server.route(
  [rates].map((f) => typeof f === 'function' ? rates(dependencies) : rates)
);

server.start((err) => {
  if (err) throw err;
  console.log(`Server running at: ${server.info.uri}`);
});
