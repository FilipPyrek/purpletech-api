import Joi from 'joi';
import handler from './handler';
import { statsSchema } from '../../../../db';

export default function createEndpoint({ addStats }) {
  return {
    method: 'GET',
    path: '/rates/{base}/{quote}',
    config: {
      handler: handler({ addStats }),
      description: 'Endpoint for converting currencies.',
      validate: {
        failAction(request, reply, source, error) {
          const { message } = error.output.payload;
          const { keys } = error.output.payload.validation;
          const invalidKeyName = keys[0];
          if (['base', 'quote', 'amount'].includes(invalidKeyName)) {
            reply({
              error: `Invalid ${invalidKeyName}`,
              message,
            }).code(400);
            return;
          }
          reply({
            error: 'Unknown error',
          }).code(500);
        },
        query: {
          amount: Joi.number()
                      .positive()
                      .default(1)
                      .example(15)
                      .description('Amount to be converted.'),
        },
        params: {
          base: Joi.string().regex(/^[a-zA-Z]{3}$/).example('USD').required(),
          quote: Joi.string().regex(/^[a-zA-Z]{3}$/).example('CZK').required(),
        },
      },
      response: {
        status: {
          200: Joi.object({
            base: Joi.string().regex(/^[a-zA-Z]{3}$/).example('USD'),
            quote: Joi.string().regex(/^[a-zA-Z]{3}$/).example('CZK'),
            unit: Joi.number().positive().example(23.547),
            total: Joi.number().positive().example(353.205),
            stats: Joi.object(statsSchema),
          }),
          400: Joi.object({
            error: Joi.string().example('Invalid base'),
            message: Joi.string()
                         .example('child "base" fails because ["base" with ' +
                                  'value "abcd" fails to match the required ' +
                                  'pattern: /^[a-zA-Z]{3}$/]'),
          }),
          422: Joi.object({
            error: Joi.string().example('Invalid quote'),
          }),
          500: Joi.object({
            error: Joi.string().example('Unknown error'),
          }),
        },
      },
    },
  };
}
