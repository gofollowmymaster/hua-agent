import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { FeishuTokenDto, UserLoginDto } from './dto/user-login';
import { AplusResponse } from '@src/type/global';
import { FeishuAuthType } from '@src/common/schedule-task/load-fixed-token';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({
    summary: '登录',
    description: '目前处于调试阶段，暂时不支持登录',
  })
  @ApiBody({ type: UserLoginDto })
  @ApiOkResponse({
    description: 'success',
    type: String,
  })
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }
  @Post('getToken')
  @ApiOperation({
    summary: '获取飞书accessToken',
    description: '获取飞书accessToken',
  })
  @ApiOkResponse({ type: AplusResponse<FeishuAuthType> })
  async getToken() {
    // console.log('getToken params', params);
    return this.authService.getToken();
  }
  @Post('getTokenByCpde')
  @ApiOperation({
    summary: '手动更新token',
    description: '通过授权code获取飞书accessToken，用于定期手动更新token',
  })
  @ApiBody({ type: FeishuTokenDto })
  @ApiOkResponse({ type: AplusResponse<FeishuAuthType> })
  @ApiOkResponse({ type: AplusResponse<FeishuAuthType> })
  async getTokenByCpde(@Body() params: FeishuTokenDto) {
    // console.log('getToken params', params);
    return this.authService.getTokenByCpde(params.code);
  }
}
