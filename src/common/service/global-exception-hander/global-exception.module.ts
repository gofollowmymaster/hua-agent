import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';

@Module({})
export class GlobalExceptionHandlerModule implements OnApplicationBootstrap {
  onApplicationBootstrap() {
    console.log(
      '[ process.listeners>',
      process.listeners('unhandledRejection').length,
    );
    console.log(
      '[ process.uncaughtException>',
      process.listeners('uncaughtException').length,
    );
    if (process.listeners('unhandledRejection').length < 2) {
      process.on('unhandledRejection', (reason, promise) => {
        console.error('-------Unhandled Rejection at:', reason);
        promise.catch((error: Error) => {
          sendExceptionToFeishu(error);
        });
      });
    }

    if (process.listeners('uncaughtException').length < 2) {
      process.on('uncaughtException', (error: Error) => {
        sendExceptionToFeishu(error);
        // 可能需要优雅地关闭应用
        process.exit(1);
      });
    }
  }
}
