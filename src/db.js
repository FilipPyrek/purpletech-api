import fs from 'fs-extra';
import Joi from 'joi';

const statsSchema = {
  usdAmount: Joi.number().min(0).default(0),
  scoore: Joi.object().default({}),
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

const save = (filename) => (stats) => fs.writeJson(filename, stats);

export function add(filename) {
  return ({ usdAmount, quote }) =>
    load(filename)
      .then((data) => ({
        usdAmount: data.usdAmount + usdAmount,
        scoore: {
          ...data.scoore,
          [quote]:
            (typeof data.scoore[quote] === 'undefined'
              ? 0
              : data.scoore[quote]
            ) + 1,
        },
      }))
      .then(save(filename));
}
