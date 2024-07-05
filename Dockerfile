FROM registry.cn-hangzhou.aliyuncs.com/app-backend/node:20.15.0
RUN npm install pnpm -g && pnpm i pm2 && pnpm i -g @nestjs/cli
WORKDIR /opt
COPY dist ./dist

EXPOSE 3000 
ENTRYPOINT ["sh","-c","pnpm start:pm2"]