import { Controller, Post, Body } from '@nestjs/common';
import { HeaderTagsService } from './header-tags.service';
import { HeaderTags as HeaderTagsModel, Prisma } from '@prisma/client';
import { CreateHeaderTagsDto } from './dto/header-tags.dto';

@Controller('header-tags')
export class HeaderTagsController {
  constructor(private readonly headerTagsService: HeaderTagsService) {}

  // 创建headerTags,需要传入versionId与之关联
  @Post()
  async create(
    @Body()
    postData: CreateHeaderTagsDto,
  ): Promise<HeaderTagsModel> {
    const { reqKey, reqValue, versionId } = postData;
    return this.headerTagsService.createHeaderTag({
      reqKey,
      reqValue,
      version: {
        connect: { id: Number(versionId) },
      },
    });
  }

  @Post('createMany')
  async createMany(
    @Body()
    postData: Prisma.HeaderTagsCreateManyInput[],
  ) {
    return this.headerTagsService.createHeaderTags(postData);
  }
}
