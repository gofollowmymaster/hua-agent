module.exports = {
  apps: [
    {
      name: 'aplus_prod_sql',
      script: './dist/main.js',
      env_test: {
        PORT: 3002,
        DATABASE_URL:
          'mysql://front_user:Di8fdYVc5xMPr@rm-bp10m699hk3sxeb8i.mysql.rds.aliyuncs.com:3306/frontend',
      },
      env_test: {
        name: 'aplus_test_sql',
        PORT: 3001,
        DATABASE_URL:
          'mysql://front_user:front123@mysql.dev.elnkpro.com:3306/frontend',
      },
      env_dev: {
        PORT: 3000,
        name: 'aplus_dev_sql',
        DATABASE_URL:
          'mysql://front_user:front123@mysql.dev.elnkpro.com:3306/test',
        SHADOW_DATABASE_URL:
          'mysql://front_user:front123@mysql.dev.elnkpro.com:3306/test_shadow',
      },
    },
  ],
};
