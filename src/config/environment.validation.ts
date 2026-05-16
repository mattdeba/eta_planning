import Joi from 'joi';

const devAccessSecret = 'dev-access-secret-change-me';
const devRefreshSecret = 'dev-refresh-secret-change-me';

const productionSecret = (unsafeDefault: string) =>
  Joi.when('NODE_ENV', {
    is: 'production',
    then: Joi.string().min(32).invalid(unsafeDefault).required(),
    otherwise: Joi.string().min(16).default(unsafeDefault),
  });

const productionRequiredString = (fallback: string) =>
  Joi.when('NODE_ENV', {
    is: 'production',
    then: Joi.string().required(),
    otherwise: Joi.string().default(fallback),
  });

export const environmentValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  APP_NAME: Joi.string().default('my_eta_planning_backend'),
  APP_PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().allow('').default('api'),
  DATABASE_HOST: productionRequiredString('localhost'),
  DATABASE_PORT: Joi.number().port().default(5433),
  DATABASE_USER: productionRequiredString('eta'),
  DATABASE_PASSWORD: Joi.when('NODE_ENV', {
    is: 'production',
    then: Joi.string().required(),
    otherwise: Joi.string().allow('').default('eta'),
  }),
  DATABASE_NAME: productionRequiredString('eta_planning'),
  DATABASE_SSL: Joi.boolean().truthy('true').falsy('false').default(false),
  TYPEORM_LOGGING: Joi.boolean().truthy('true').falsy('false').default(false),
  JWT_ACCESS_SECRET: productionSecret(devAccessSecret),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: productionSecret(devRefreshSecret),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
  BCRYPT_SALT_ROUNDS: Joi.number().integer().min(8).max(15).default(10),
  SEED_ADMIN_EMAIL: Joi.string().email().default('admin@eta.local'),
  SEED_ADMIN_PASSWORD: Joi.string().min(8).default('ChangeMe123!'),
}).unknown(true);
