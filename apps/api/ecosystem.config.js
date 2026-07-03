// require('dotenv').config({ path: ['.env', '.env.prod'], override: true });
module.exports = {
  apps: [
    {
      script: './dist/main.js',
      env_prod: {
        name: 'aplus_prod_sql',
      },
      env_test: {
        name: 'aplus_test_sql',
      },
      env_dev: {
        name: 'aplus_dev_sql',
      },
    },
  ],
};
