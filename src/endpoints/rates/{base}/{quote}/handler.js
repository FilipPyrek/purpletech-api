import Joi from 'joi';
import fetch from 'node-fetch';

export default function handler({ addStats }) {
  return (request, reply) => {
    const base = request.params.base.toUpperCase();
    const quote = request.params.quote.toUpperCase();
    const { amount } = request.query;

    fetch(`https://api.fixer.io/latest?base=${base}&symbols=USD,${quote}`)
      .then((data) => data.json())
      .then((data) => {
        const valid = Joi.validate(data, {
          base: Joi.any().valid(base).required(),
          date: Joi.date().required(),
          rates: Joi.object({
            USD: base === 'USD'
                  ? Joi.any().forbidden() : Joi.number().required(),
            [quote]: base === quote
                  ? Joi.any().forbidden() : Joi.number().required(),
          }).required(),
        });

        if (valid.error) throw valid.error;
        return valid.value;
      })
      .then((data) => {
        const { rates = {} } = data;
        const quoteRate = base === quote ? 1 : rates[quote];
        addStats({
          usdAmount: base === 'USD' ? amount : rates.USD * amount,
          quote,
        });
        reply({
          base,
          quote,
          unit: quoteRate,
          total: quoteRate * amount,
        });
      })
      .catch((error) => console.log(error));
  };
}
