import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EnvironmentVariables } from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const config = plainToInstance(EnvironmentVariables, process.env, {
  enableImplicitConversion: true,
});

const errors = validateSync(config, { skipMissingProperties: false });

if (errors.length > 0) {
  const errorMessages = errors
    .map((error) => Object.values(error.constraints || {}).join(', '))
    .join('; ');

  throw new Error(`Configuration validation failed: ${errorMessages}`);
}

export default () => ({
  port: config.PORT,
  environment: config.NODE_ENV,

  database: {
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
  },

  redis: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
  },

  throttler: {
    ttl: config.THROTTLER_TTL,
    limit: config.THROTTLER_LIMIT,
  },

  batch: {
    threshold: config.BATCH_THRESHOLD,
    timeThreshold: config.BATCH_TIME_THRESHOLD,
  },
});
