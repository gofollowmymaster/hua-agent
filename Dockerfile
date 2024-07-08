FROM registry.cn-hangzhou.aliyuncs.com/app-backend/node-pnpm-pi:20.15.0

WORKDIR /opt
COPY . ./

EXPOSE 3000 
#ENTRYPOINT ["sh","-c","pnpm deploy:dev"]