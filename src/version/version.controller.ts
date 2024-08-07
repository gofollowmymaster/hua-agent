import { Controller, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { VersionService } from './version.service';
import { HeaderTagsService } from '../header-tags/header-tags.service';
import { Version as VersionModel } from '@prisma/client';
import { CreateVersionDto } from './dto/version.dto';
import { PrismaService } from '../prisma.service';

@Controller('version')
export class VersionController {
  constructor(
    private readonly versionService: VersionService,
    private readonly headerTagsService: HeaderTagsService,
    private readonly prismaService: PrismaService,
  ) {}

  // 创建版本
  @Post()
  async create(
    @Body()
    postData: CreateVersionDto,
  ): Promise<VersionModel> {
    const { versionName, versionEntry, subappId, headerTags } = postData;
    console.log('aaa', postData);
    // 创建版本时，如果传了headerTags，那么先创建版本，再创建headerTags
    // 如果没有headerTags，直接创建headerTags
    return this.prismaService.$transaction(async () => {
      const version = await this.versionService.createVersion({
        versionName,
        versionEntry,
        subapp: {
          connect: { id: Number(subappId) },
        },
      });
      console.log('version', version);
      if (headerTags && headerTags.length) {
        const args = headerTags.map((i) => ({
          versionId: version.id,
          reqKey: i.reqKey,
          reqValue: i.reqValue,
        }));
        console.log('args', args);
        await this.headerTagsService.createHeaderTags(args);
      }

      return version;
    });
  }

  // 更新版本
  @Put(':id/subapp/:subappId')
  async update(
    @Param('subappId') subappId: string,
    @Param('id') id: string,
    @Body()
    updateVersionDto: {
      versionName: string;
      versionEntry: string;
      reqVal: string;
      reqKey: string;
    },
  ) {
    return this.versionService.updateVersion({
      where: { subappId: Number(subappId), id: Number(id) },
      data: updateVersionDto,
    });
  }

  // 删除版本
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.versionService.delVersion({ id: Number(id) });
  }
}
