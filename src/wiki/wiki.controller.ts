import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { WikiDto } from './dto/wiki.dto';

import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WikiService } from './wiki.service';
// import SentryAdapter from './adapter/sentry-apialert-adapter';

@ApiTags('ai问答日志操作器')
@Controller('wiki')
export class WikiController {
  constructor(private readonly wikiService: WikiService) {}

  @ApiOperation({
    summary: '记录日志操作人',
    description: '添加一条日志操作人记录，用于后期同步到日志表格',
  })
  @ApiBody({ type: WikiDto })
  @ApiOkResponse({
    description: 'success',
    type: String,
  })
  // @UseGuards(AuthGuard)
  @Post('tree')
  async add(@Body() params: WikiDto) {
    //发送消息
    return await this.wikiService.tree(params);
  }
}
