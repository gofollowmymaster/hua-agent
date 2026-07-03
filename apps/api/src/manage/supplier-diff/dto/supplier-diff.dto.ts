import { ApiProperty } from '@nestjs/swagger';

enum AppCode {
  User = 'User',
  Admin = 'Admin',
  MiniPro = 'MiniPro',
}
enum BusinessLine {
  商家运营 = '商家运营',
  仓储物流 = '仓储物流',
  业财一体 = '业财一体',
  基础架构 = '基础架构',
}

export class SupplierDiffDto {
  @ApiProperty({
    enum: BusinessLine,
    description: '业务线',
  })
  businessLine: BusinessLine;
  @ApiProperty({
    enum: AppCode,
    description: '应用端',
  })
  appCode: AppCode;
}
