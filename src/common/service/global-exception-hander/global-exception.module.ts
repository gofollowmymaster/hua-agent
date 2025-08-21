import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';

@Module({})
export class GlobalExceptionHandlerModule implements OnApplicationBootstrap {
  onApplicationBootstrap() {
    if (!process.listeners('unhandledRejection').length) {
      process.on('unhandledRejection', (reason, promise) => {
        console.error('-------Unhandled Rejection at:', reason);
        promise.catch((error: Error) => {
          sendExceptionToFeishu(error);
        });
      });
    }

    if (!process.listeners('uncaughtException').length) {
      process.on('uncaughtException', (error: Error) => {
        sendExceptionToFeishu(error);
        // 可能需要优雅地关闭应用
        process.exit(1);
      });
    }
  }
}
