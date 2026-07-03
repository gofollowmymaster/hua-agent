import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { WikiService } from './wiki.service';
import { AuthGuard } from '@src/common/guard/auth';
import {
  WikiBlackListDto,
  WikiFeedbackDto,
  WikiSearchDto,
  WikiTreeDto,
  AplusResponseWikiFeedback,
  AplusResponseWikiBlackListList,
} from './dto/wiki.dto';
import { SecretAuthGuard } from '@src/common/guard/secret-auth';
import { CompositeAuthOrSecretGuard } from '@src/common/guard/composite-auth';
import { NodeConfigService } from '@src/config/node-config.service';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { FileInterceptor } from '@nestjs/platform-express';

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
  @UseGuards(AuthGuard)
  @Post('/search')
  @ApiBody({ type: WikiSearchDto })
  async search(@Body() params: WikiSearchDto) {
    return await this.wikiService.search(params);
  }

  @ApiOperation({
    summary: '批量按关键词搜索知识空间',
    description: '一次性在指定知识空间中搜索所有黑名单关键词',
  })
  @UseGuards(SecretAuthGuard)
  @Post('/batchSearch')
  async batchSearch() {
    return await this.wikiService.batchSearch();
  }

  @ApiOperation({
    summary: '获取链接黑名单列表',
    description: '获取链接黑名单列表',
  })
  @UseGuards(CompositeAuthOrSecretGuard)
  @Post('/blacklist')
  @ApiBody({ type: WikiBlackListDto })
  @ApiOkResponse({
    type: AplusResponseWikiBlackListList,
  })
  async blacklist(@Body() params: WikiBlackListDto) {
    if (!params.supplierCode) {
      params.supplierCode = this.tenantContext.tenant;
    }
    return await this.wikiService.blacklist(params);
  }

  @ApiOperation({
    summary: '反馈知识库文档问题',
    description: '反馈知识库文档问题',
  })
  @UseGuards(AuthGuard)
  @Post('/feedback')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: WikiFeedbackDto })
  @ApiOkResponse({
    type: AplusResponseWikiFeedback,
  })
  async feedback(
    @UploadedFile() image: Express.Multer.File,
    @Body() params: WikiFeedbackDto,
  ) {
    return await this.wikiService.feedback({ ...params, image });
  }
}
