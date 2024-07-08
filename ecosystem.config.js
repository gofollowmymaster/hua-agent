module.exports = {
  apps: [
    {
      name: 'dev_sql',
      script: './dist/main.js',
      env_prod: {
        DATABASE_URL:
          'mysql://front_user:front123@mysql.dev.elnkpro.com:3306/frontend',
      },
      env_dev: {
        DATABASE_URL:
          'mysql://front_user:front123@mysql.dev.elnkpro.com:3306/test',
        SHADOW_DATABASE_URL:
          'mysql://front_user:front123@mysql.dev.elnkpro.com:3306/test_shadow',
      },
    },
  ],
};
