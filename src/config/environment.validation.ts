import Joi from 'joi';

export const environmentValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  APP_NAME: Joi.string().default('my_eta_planning_backend'),
  APP_PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().allow('').default('api'),
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().port().default(5433),
  DATABASE_USER: Joi.string().default('eta'),
  DATABASE_PASSWORD: Joi.string().allow('').default('eta'),
  DATABASE_NAME: Joi.string().default('eta_planning'),
  DATABASE_SSL: Joi.boolean().truthy('true').falsy('false').default(false),
  TYPEORM_LOGGING: Joi.boolean().truthy('true').falsy('false').default(false),
});
