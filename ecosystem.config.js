module.exports = {
  apps: [
    {
      name: 'dev_sql',
      script: './dist/main.js',
      env_prod: {
        PORT: 3001,
        DATABASE_URL:
          'mysql://front_user:front123@mysql.dev.elnkpro.com:3306/frontend',
      },
      env_dev: {
        PORT: 3000,
        DATABASE_URL:
          'mysql://front_user:Di8fdYVc5xMPr@rm-bp10m699hk3sxeb8i.mysql.rds.aliyuncs.com:3306/frontend',
        SHADOW_DATABASE_URL:
          'mysql://front_user:Di8fdYVc5xMPr@rm-bp10m699hk3sxeb8i.mysql.rds.aliyuncs.com:3306/frontend',
      },
    },
  ],
};
