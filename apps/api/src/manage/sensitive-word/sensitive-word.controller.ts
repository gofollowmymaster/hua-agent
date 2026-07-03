import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SensitiveWordService } from './sensitive-word.service';
import { SensitiveWordDto } from './dto/sensitive-word.dto';
import { SecretAuthGuard } from '@src/common/guard/secret-auth';

@ApiTags('敏感词管理')
@Controller('sensitive-word')
export class SensitiveWordController {
  constructor(private readonly sensitiveWordService: SensitiveWordService) {}

  @ApiOperation({
    summary: '敏感词警报',
    description: '敏感词警报',
  })
  @ApiOkResponse({
    description: 'success',
    type: String,
  })
  @UseGuards(SecretAuthGuard)
  @Post('/alert')
  @ApiBody({ type: SensitiveWordDto })
  async alert(@Body() params: SensitiveWordDto) {
    return await this.sensitiveWordService.alert(params);
  }
  @ApiOperation({
    summary: '敏感词预设数据',
    description: '敏感词预设数据',
  })
  @UseGuards(SecretAuthGuard)
  @Post('/preset')
  async preset() {
    return await this.sensitiveWordService.preset();
  }
}
