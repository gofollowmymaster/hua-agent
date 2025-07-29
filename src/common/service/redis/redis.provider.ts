import { Provider } from '@nestjs/common';
import Redis from 'ioredis';
import configuration from '../../../config';

export const RedisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    return new Redis(
      configuration['DB_REDIS_PORT'],
      configuration['DB_REDIS_HOST'],
      {
        password: configuration['DB_REDIS_PASSWORD'],
        db: configuration['DB_REDIS_DB'],
        retryStrategy: (times) => {
          // 重连策略
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      },
    );
  },
};
