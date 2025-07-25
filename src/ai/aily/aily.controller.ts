import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AilyService } from './aily.service';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { FeishuGenerateTokenDto, FeishuTokenDto } from './dto/aily';
import { AplusResponse } from '@src/type/global';
import { FeishuAuthType } from '@src/common/schedule-task/load-fixed-token';
import { SecretAuthGuard } from '@src/common/guard/sign-auth';

@Controller('aily')
export class AilyController {
  constructor(private authService: AilyService) {}

  @Post('getToken')
  @ApiOperation({
    summary: '获取飞书accessToken',
    description: '获取飞书accessToken',
  })
  @ApiBody({ type: FeishuTokenDto })
  @ApiOkResponse({ type: AplusResponse<FeishuAuthType> })
  @UseGuards(SecretAuthGuard)
  async getToken() {
    const feishuUser = await this.authService.getToken();
    if (!feishuUser) {
      throw new Error('获取飞书用户信息失败');
    }
    console.log('[ feishuUser ] >', feishuUser);
    return feishuUser;
  }
  @Post('getTokenByCode')
  @ApiOperation({
    summary: '生成新的token',
    description: '通过授权code获取飞书accessToken，用于定期手动更新token',
  })
  @ApiBody({ type: FeishuGenerateTokenDto })
  @ApiOkResponse({ type: AplusResponse<FeishuAuthType> })
  @UseGuards(SecretAuthGuard)
  async getTokenByCode(@Body() params: FeishuGenerateTokenDto) {
    return this.authService.getTokenByCode(params.code);
  }
}
