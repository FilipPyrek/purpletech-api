import Joi from 'joi';
import fetch from 'node-fetch';

export default function handler({ addStats }) {
  return (request, reply) => {
    const base = request.params.base.toUpperCase();
    const quote = request.params.quote.toUpperCase();
    const { amount } = request.query;

    const isBaseUsd = base === 'USD';
    const isBaseQuoteSame = base === quote;

    fetch(`https://api.fixer.io/latest?base=${base}&symbols=USD,${quote}`)
      .then((data) => data.json())
      .then((data) => {
        if (data.error === 'Invalid base') {
          reply({
            error: 'Invalid base',
          }).code(422);
          return;
        }

        const { error, value } = Joi.validate(data, {
          base: Joi.any().valid(base).required(),
          date: Joi.date().required(),
          rates: Joi.object({
            USD: isBaseUsd
                  ? Joi.any().forbidden() : Joi.number().required(),
            [quote]: isBaseQuoteSame
                  ? Joi.any().forbidden() : Joi.number().required(),
          }).required(),
        });

        if (error) {
          if (error.details[0].path === `rates.${quote}`) {
            reply({
              error: 'Invalid quote',
            }).code(422);
            return;
          }

          reply({
            error: error.message,
          }).code(502);
          return;
        }

        const { rates = {} } = value;
        const quoteRate = isBaseQuoteSame ? 1 : rates[quote];
        addStats({
          usdAmount: isBaseUsd ? amount : rates.USD * amount,
          quote,
        });
        reply({
          base,
          quote,
          unit: quoteRate,
          total: quoteRate * amount,
        }).code(200);
      })
      .catch(console.error);
  };
}
