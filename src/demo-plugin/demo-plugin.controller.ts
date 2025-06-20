import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { DemoPluginService } from './demo-plugin.service';

import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GenerateMidDto, VerifyMidDto } from './dto/generate-mid.dto';
import { AuthGuard } from '@src/common/guard/auth';

@ApiTags('演示插件')
@Controller('demo-plugin')
export class DemoPluginController {
  constructor(private readonly demoPluginService: DemoPluginService) {}

  @ApiOperation({
    summary: '生成认证密钥',
    description: '生成一条认证密钥',
  })
  @ApiBody({ type: GenerateMidDto })
  @ApiOkResponse({
    description: 'success',
    type: String,
  })
  @Post('generate-mid')
  async generateMid(
    @Body()
    body: GenerateMidDto,
  ) {
    return await this.demoPluginService.generateMid(body);
  }

  @ApiOperation({
    summary: '验证密钥有效性',
    description: '验证密钥是否有效、过期',
  })
  @ApiBody({ type: VerifyMidDto })
  @ApiOkResponse({
    description: 'success',
    type: String,
  })
  @Post('verify')
  @UseGuards(AuthGuard)
  async verifyMid(
    @Body()
    params: VerifyMidDto,
    // @Res() response,
  ) {
    // 查找是否存在 MId
    const isValid = await this.demoPluginService.verify(params);

    return {
      isValid,
    };
  }
}
