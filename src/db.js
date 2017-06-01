import fs from 'fs-extra';
import Joi from 'joi';

const statsSchema = {
  totalUsdConverted: Joi.number().min(0).default(0),
  counter: Joi.number().min(0).default(0),
  popularity: Joi.object().default({}),
};

const load = (filename) =>
  fs.pathExists(filename)
     .then((exists) =>
        !exists
          ? fs.writeJson(filename, Joi.validate({}, statsSchema).value)
          : null
     )
     .then(() => fs.readJson(filename))
     .then((stats) => {
       const valid = Joi.validate(stats, statsSchema, { allowUnknown: true });
       if (valid.error) throw valid.error;
       return valid.value;
     });

const save = (filename) => (stats) =>
                fs.writeJson(filename, stats).then(() => stats);

export function add(filename) {
  return ({ usdAmount, quote }) =>
    load(filename)
      .then((data) => ({
        counter: data.counter + 1,
        totalUsdConverted: data.totalUsdConverted + usdAmount,
        popularity: {
          ...data.popularity,
          [quote]:
            (typeof data.popularity[quote] === 'undefined'
              ? 0
              : data.popularity[quote]
            ) + 1,
        },
      }))
      .then(save(filename));
}
