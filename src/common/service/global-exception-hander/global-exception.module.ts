import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';

@Module({})
export class GlobalExceptionHandlerModule implements OnApplicationBootstrap {
  onApplicationBootstrap() {
    process.on('unhandledRejection', this.unhandledRejection);
    process.on('uncaughtException', this.uncaughtException);
  }
  uncaughtException(error: Error) {
    // console.log('[ uncaughtExceptionWarning: ] >', error);

    sendExceptionToFeishu(error);
    // 需要优雅地关闭应用
    process.exit(1);
  }
  unhandledRejection(reason, promise) {
    promise.catch((error: Error) => {
      // console.log('[ PromiseRejectionHandledWarning: ] >', reason);
      sendExceptionToFeishu(error);
    });
  }
}
