export default {
  DB_REDIS_HOST: process.env.REDIS_HOST,
  DB_REDIS_PORT: parseInt(process.env.REDIS_PORT),
  DB_REDIS_DB: parseInt(process.env.REDIS_DB),
  DB_REDIS_PASSWORD: process.env.REDIS_PASSWORD,
};
