FROM registry.cn-hangzhou.aliyuncs.com/app-backend/node-pnpm-pi:20.15.0

WORKDIR /opt
COPY dist ./dist
RUN ls /opt/dist

EXPOSE 3000 
ENTRYPOINT ["sh","-c","pnpm start:pm2"]