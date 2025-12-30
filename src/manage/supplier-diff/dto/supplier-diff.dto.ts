import { ApiProperty } from '@nestjs/swagger';

enum AppCode {
  User = 'User',
  Admin = 'Admin',
  MiniPro = 'MiniPro',
}

export class SupplierDiffDto {
  @ApiProperty({
    type: String,
    description: '业务线',
  })
  businessLine: string;
  @ApiProperty({
    enum: AppCode,
    description: '应用端',
  })
  appCode: AppCode;
}
