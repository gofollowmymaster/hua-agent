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
        DATABASE_URL:
          'mysql://front_user:front123@mysql.dev.elnkpro.com:3306/test',
      },
    },
  ],
};
