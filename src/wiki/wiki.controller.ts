import { Body, Controller, Post } from '@nestjs/common';

import { WikiDto } from './dto/wiki.dto';

import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WikiService } from './wiki.service';
// import SentryAdapter from './adapter/sentry-apialert-adapter';

@ApiTags('wiki相关接口')
@Controller('wiki')
export class WikiController {
  constructor(private readonly wikiService: WikiService) {}

  @ApiOperation({
    summary: '获取飞书知识库空间节点',
    description: '通过传入知识库id获取树形知识库节点列表',
  })
  @ApiBody({ type: WikiDto })
  @ApiOkResponse({
    description: 'success',
    type: String,
  })
  // @UseGuards(AuthGuard)
  @Post('/tree')
  async tree(@Body() params: WikiDto) {
    //发送消息
    return await this.wikiService.tree(params);
  }
}
