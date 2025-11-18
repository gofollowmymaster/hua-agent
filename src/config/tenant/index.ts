import aplus from './aplus';
import boat from './boat';
// import yurex from './yurex';

export const tenantCodeMap = {
  B0004: 'aplus',
  B0005: 'boat',
  B0006: 'yurex',
} as const;
//定义一个类型，为tenantCodeMap的值的集合
export type TenantCode = (typeof tenantCodeMap)[keyof typeof tenantCodeMap];
export default {
  aplus,
  boat,
  // yurex,
};
