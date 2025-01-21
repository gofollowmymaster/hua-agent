module.exports = {
  apps: [
    {
      script: './dist/main.js',
      env_prod: {
        name: 'aplus_prod_sql',

        NODE_ENV: 'prod',
      },
      env_test: {
        name: 'aplus_test_sql',

        NODE_ENV: 'test',
      },
      env_dev: {
        name: 'aplus_dev_sql',

        NODE_ENV: 'dev',
      },
    },
  ],
};
