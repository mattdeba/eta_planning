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
  JWT_ACCESS_SECRET: Joi.string()
    .min(16)
    .default('dev-access-secret-change-me'),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string()
    .min(16)
    .default('dev-refresh-secret-change-me'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
  BCRYPT_SALT_ROUNDS: Joi.number().integer().min(8).max(15).default(10),
});
