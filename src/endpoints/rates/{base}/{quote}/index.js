import Joi from 'joi';
import handler from './handler';

export default function createEndpoint({ addStats }) {
  return {
    method: 'GET',
    path: '/rates/{base}/{quote}',
    config: {
      handler: handler({ addStats }),
      validate: {
        query: {
          amount: Joi.number().positive().default(1),
        },
        params: {
          base: Joi.string().regex(/^[a-zA-Z]{3}$/).required(),
          quote: Joi.string().regex(/^[a-zA-Z]{3}$/).required(),
        },
      },
      response: {
        status: {
          200: Joi.object({
            base: Joi.string().regex(/^[a-zA-Z]{3}$/),
            quote: Joi.string().regex(/^[a-zA-Z]{3}$/),
            unit: Joi.number().positive(),
            total: Joi.number().positive(),
          }),
        },
      },
    },
  };
}
