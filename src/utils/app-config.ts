import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

let globalConfig: ConfigService;

export function setGlobalConfig(app: INestApplication) {
  console.log('Setting global config');
  globalConfig = app.get(ConfigService);
}

/**
 * 在其他地方使用全局配置
 * 使用时机：应用启动后，不能在模块加载时使用
 * @param key
 * @returns
 */
export function getGlobalConfig(key: string) {
  return globalConfig.get(key);
}
/**
 * 在其他地方使用全局配置
 * 使用时机：应用启动后，不能在模块加载时使用
 * @param key
 * @returns
 */
export function getGlobalConfigInstance() {
  return globalConfig;
}
