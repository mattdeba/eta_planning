import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

type ConfigReader = Pick<ConfigService, 'get' | 'getOrThrow'>;

function readBoolean(value: unknown): boolean {
  return value === true || value === 'true' || value === '1';
}

export function buildDataSourceOptions(
  config: ConfigReader,
): DataSourceOptions {
  const sslEnabled = readBoolean(config.get('DATABASE_SSL', false));
  const loggingEnabled = readBoolean(config.get('TYPEORM_LOGGING', false));

  return {
    type: 'postgres',
    host: String(config.getOrThrow<string>('DATABASE_HOST')),
    port: Number(config.getOrThrow<number | string>('DATABASE_PORT')),
    username: String(config.getOrThrow<string>('DATABASE_USER')),
    password: String(config.getOrThrow<string>('DATABASE_PASSWORD')),
    database: String(config.getOrThrow<string>('DATABASE_NAME')),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: loggingEnabled ? ['query', 'error', 'schema', 'warn'] : ['error'],
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  };
}

export function buildTypeOrmModuleOptions(
  config: ConfigService,
): TypeOrmModuleOptions {
  return {
    ...buildDataSourceOptions(config),
    autoLoadEntities: true,
  };
}
