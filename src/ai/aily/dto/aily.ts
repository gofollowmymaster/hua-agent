import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FeishuTokenDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '客户端ID',
  })
  clientId: string;
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '签名，生成方式见：',
  })
  signature: string;
}

export class FeishuGenerateTokenDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description:
      '飞书授权code，获取方式：https://accounts.feishu.cn/open-apis/authen/v1/authorize?app_id=cli_a8c53168e1b2100c&redirect_uri=https://auth.aplnk.com/admin.html&scope=aily:session:read%20aily:session:write%20aily:message:read%20aily:message:write%20aily:run:read%20aily:run:write%20aily:file:read%20aily:file:write%20aily:skill:read%20aily:skill:write',
  })
  code: string;
}
