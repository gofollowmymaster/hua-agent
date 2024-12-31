FROM registry.cn-hangzhou.aliyuncs.com/app-backend/node-pnpm-pi:20.15.V2
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

WORKDIR /opt
COPY . ./

EXPOSE 3000 

# Use pm2-runtime to start the application
CMD ["pm2-runtime", "ecosystem.config.js", "--env", "prod"]