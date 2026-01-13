import { Body, Controller, Post, UseGuards } from '@nestjs/common';
// import { Controller, Get, Use } from '@nestjs/common';
import { AilyService } from './aily.service';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import {
  BindSessionCodeDto,
  FeishuGenerateTokenDto,
  FeishuTokenDto,
} from './dto/aily';
import { AplusResponse } from '@src/type/global';
import { SignAuthGuard } from '@src/common/guard/sign-auth';
import { AuthGuard } from '@src/common/guard/auth';
import { SecretAuthGuard } from '@src/common/guard/secret-auth';
import { FeishuAuthType } from '@src/common/feishu/type/auth';
import WikiFixedTokenService from '@src/common/service/fixed-user-token/wiki-fixed-user-token';

@Controller('aily')
export class AilyController {
  constructor(
    private ailyService: AilyService,
    private fixedTokenService: WikiFixedTokenService,
  ) {}

  @Post('getToken')
  @ApiOperation({
    summary: '获取飞书accessToken',
    description: '获取飞书accessToken',
  })
  @ApiBody({ type: FeishuTokenDto })
  @ApiOkResponse({ type: AplusResponse<FeishuAuthType> })
  @UseGuards(SignAuthGuard)
  async getToken() {
    const feishuUser = await this.ailyService.getToken();
    if (!feishuUser) {
      throw new Error('获取飞书用户信息失败');
    }
    return feishuUser;
  }

  @Post('getTokenByCode')
  @ApiOperation({
    summary: '生成新的token',
    description: '通过授权code获取飞书accessToken',
  })
  @ApiBody({ type: FeishuGenerateTokenDto })
  @ApiOkResponse({ type: AplusResponse<FeishuAuthType> })
  @UseGuards(SecretAuthGuard)
  async getTokenByCode(@Body() params: FeishuGenerateTokenDto) {
    return this.ailyService.getTokenByCode(params.code);
  }

  @Post('useTokenByCode')
  @ApiOperation({
    summary: '启用新的token',
    description: '通过授权code启用已经生成的accessToken',
  })
  @ApiBody({ type: FeishuGenerateTokenDto })
  @ApiOkResponse({ type: AplusResponse<FeishuAuthType> })
  @UseGuards(SecretAuthGuard)
  async useTokenByCode(@Body() params: FeishuGenerateTokenDto) {
    return this.ailyService.useTokenByCode(params.code);
  }

  @Post('bindSession')
  @ApiOperation({
    summary: '注册session',
    description: '将会话sessionId绑定一个随机Code',
  })
  @ApiBody({ type: BindSessionCodeDto })
  @ApiOkResponse({ type: AplusResponse<FeishuAuthType> })
  @UseGuards(AuthGuard)
  async bindSession(@Body() params: BindSessionCodeDto) {
    return this.ailyService.bindSession(params);
  }

  @Post('verifySession')
  @ApiOperation({
    summary: '校验session',
    description: '校验session是否合法',
  })
  @ApiBody({ type: BindSessionCodeDto })
  @ApiOkResponse({ type: AplusResponse<FeishuAuthType> })
  @UseGuards(SignAuthGuard)
  async verifySession(@Body() params: BindSessionCodeDto) {
    return this.ailyService.verifySession(params);
  }

  @Post('triggerRefreshToken')
  @ApiOperation({
    summary: '手动触发刷新token',
    description: '手动触发刷新token定时任务',
  })
  @UseGuards(SecretAuthGuard)
  async triggerRefreshToken() {
    return this.fixedTokenService.handleCron(true);
  }
}
