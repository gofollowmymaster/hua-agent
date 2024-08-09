import { Controller, Post, Body, Param, Put } from '@nestjs/common';
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
    const { tagKey, tagValue, versionId } = postData;
    return this.headerTagsService.createHeaderTag({
      tagKey,
      tagValue,
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

  // 更新HeaderTags
  @Put('version/:versionId')
  async update(
    @Param('versionId') versionId: string,
    @Body()
    updateHeaderTagsDto: Prisma.HeaderTagsUpdateInput,
  ) {
    return this.headerTagsService.updateHeaderTags({
      where: {
        versionId: Number(versionId),
      } as Prisma.HeaderTagsWhereUniqueInput,
      data: updateHeaderTagsDto,
    });
  }

  // 删除版本
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.headerTagsService.delHeaderTags({ id: Number(id) });
  // }
}
