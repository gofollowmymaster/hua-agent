import { INestApplication } from '@nestjs/common';

let appInstance: INestApplication<any>;

/**
 * 在其他地方使用app实例
 * @returns
 */
export function getGlobalAppInstance(className: any) {
  return appInstance.get(className);
}
