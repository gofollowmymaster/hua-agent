import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WikiService } from './wiki.service';
import { AuthGuard } from '@src/common/guard/auth';
import { WikiSearchDto, WikiTreeDto } from './dto/wiki.dto';
import { SecretAuthGuard } from '@src/common/guard/secret-auth';
import { NodeConfigService } from '@src/config/node-config.service';
import { TenantContext } from '@src/common/service/context/tenant.context';

@ApiTags('wiki相关接口')
@Controller('wiki')
export class WikiController {
  constructor(
    private readonly wikiService: WikiService,

    private readonly tenantContext: TenantContext,
  ) {}

  @ApiOperation({
    summary: '获取飞书知识库空间节点',
    description: '通过传入知识库id获取树形知识库节点列表，进行Token认证',
  })
  @ApiOkResponse({
    description: 'success',
    type: String,
  })
  @UseGuards(AuthGuard)
  @Post('/tree')
  @ApiBody({ type: WikiTreeDto })
  async tree(@Body() params: WikiTreeDto) {
    const tenant = this.tenantContext.tenant;
    if (!params.spaceId) {
      params.spaceId = NodeConfigService.getTenantConfigItem(
        tenant,
        'FeishuWikiSpaceIds',
      )?.[0];
    }

    return await this.wikiService.tree(params);
  }
  @ApiOperation({
    summary: '获取飞书知识库空间节点',
    description:
      '通过传入知识库id获取树形知识库节点列表,进行Secret认证，支持强制刷新缓存',
  })
  @UseGuards(SecretAuthGuard)
  @Post('/tree2')
  @ApiBody({ type: WikiTreeDto })
  async tree2(@Body() params: WikiTreeDto) {
    const tenant = this.tenantContext.tenant;
    if (!params.spaceId) {
      params.spaceId = NodeConfigService.getTenantConfigItem(
        tenant,
        'FeishuWikiSpaceIds',
      )?.[0];
    }
    return await this.wikiService.tree(params);
  }
  @ApiOperation({
    summary: '按关键词搜索知识空间',
    description: '按关键词搜索知识空间',
  })
  @UseGuards(SecretAuthGuard)
  @Post('/search')
  @ApiBody({ type: WikiSearchDto })
  async search(@Body() params: WikiSearchDto) {
    return await this.wikiService.search(params);
  }
}
