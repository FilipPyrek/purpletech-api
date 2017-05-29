import Hapi from 'hapi';
import vision from 'vision';
import inert from 'inert';
import lout from 'lout';
import Joi from 'joi';

const server = new Hapi.Server();
server.connection({ port: 3001, host: 'localhost' });


server.register([vision, inert, { register: lout }], (err) => console.log(err));

server.route({
  method: 'GET',
  path: '/convert/{from}/{to}',
  config: {
    handler(request, reply) {
      reply({ a: 'b' });
    },
    validate: {
      params: {
        from: Joi.string().required(),
        to: Joi.string().required(),
      },
    },
    response: {
      status: {
        200: Joi.object({
          a: Joi.string().required().example('abc'),
        }),
      },
    },
  },
});

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log(`Server running at: ${server.info.uri}`);
});
