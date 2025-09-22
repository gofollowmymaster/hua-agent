import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WikiService } from './wiki.service';
import { AuthGuard } from '@src/common/guard/auth';
import { WikiTreeDto } from './dto/wiki.dto';

@ApiTags('wiki相关接口')
@Controller('wiki')
export class WikiController {
  constructor(private readonly wikiService: WikiService) {}

  @ApiOperation({
    summary: '获取飞书知识库空间节点',
    description: '通过传入知识库id获取树形知识库节点列表',
  })
  @ApiOkResponse({
    description: 'success',
    type: String,
  })
  @UseGuards(AuthGuard)
  @Post('/tree')
  @ApiBody({ type: WikiTreeDto })
  async tree(@Body() params: WikiTreeDto) {
    //发送消息
    return await this.wikiService.tree(params.spaceId);
  }
}
