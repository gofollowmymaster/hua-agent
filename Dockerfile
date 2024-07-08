FROM registry.cn-hangzhou.aliyuncs.com/app-backend/node-pnpm-pi:20.15.0

WORKDIR /opt
COPY dist ./dist
COPY prisma ./prisma
COPY .env ./
COPY ecosystem.config.js ./
COPY package.json ./
RUN ls /opt/dist

EXPOSE 3000 
ENTRYPOINT ["sh","-c","pnpm deploy:dev"]