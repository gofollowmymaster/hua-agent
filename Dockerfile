FROM registry.cn-hangzhou.aliyuncs.com/app-backend/node_pnpm:20.15.0

RUN pnpm i -g @nestjs/cli

WORKDIR /opt
COPY dist ./dist

EXPOSE 3000 
ENTRYPOINT ["sh","-c","pnpm start:pm2"]