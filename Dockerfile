FROM registry.cn-hangzhou.aliyuncs.com/app-backend/node:20.15.0
# 设置 PNPM_HOME 环境变量，并添加到 PATH
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN npm install pnpm -g && pnpm i pm2 && pnpm i -g @nestjs/cli
WORKDIR /opt
COPY dist ./dist

EXPOSE 3000 
ENTRYPOINT ["sh","-c","pnpm start:pm2"]