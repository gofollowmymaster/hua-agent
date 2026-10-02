import { ApiProperty } from '@nestjs/swagger';
import { TenantCode } from '@src/config/tenant';

export class AplusResponse<T = Record<string, any>> {
  @ApiProperty({
    type: Number,
    description: '返回码',
  })
  code: number;
  @ApiProperty({
    type: String,
    description: '返回信息',
  })
  message: string;
  @ApiProperty({
    type: Object,
    description: '返回数据',
  })
  body: T;
}
export class BitTableList<T = any[]> {
  @ApiProperty({
    type: Number,
    description: '总计',
  })
  total: number;
  @ApiProperty({
    type: Boolean,
    description: '是否还有数据',
  })
  hasMore: boolean;
  @ApiProperty({
    type: Array<T>,
    description: '列表数据',
  })
  list: T;
}

export type UserContext = {
  supplierName?: string;
  loginId?: string;
  tenantCode?: string;
  appCode?: 'APLUS' | 'ADMIN' | 'QUICK' | 'GLOBAL';
  supplierCode?: string;
  userId?: number;
  userCode?: string;
  loginTime?: number;
  tenantName?: string;
  scope?: 'WEB' | 'APP';
  tenantId?: number;
  username?: string;
  isSystemAdmin?: boolean;
};

export type ProcessorBody = {
  tenantCode: TenantCode;
  [key: string]: any;
};
