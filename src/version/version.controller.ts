import { Controller, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { VersionService } from './version.service';
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
    const { versionName, versionEntry, subapp, headerTags } = postData;

    return this.prismaService.$transaction(async () => {
      const version = await this.versionService.createVersion({
        versionName,
        versionEntry,
        subapp: {
          connect: { id: Number(subapp) },
        },
        headerTags: {
          create: headerTags,
        },
      });
      return version;
    });
  }

  // 更新版本
  @Put(':versionId/subapp/:subappId')
  async update(
    @Param('subappId') subappId: string,
    @Param('versionId') versionId: string,
    @Body()
    updateVersionData,
  ) {
    return this.prismaService.$transaction(async () => {
      console.log('id', subappId, versionId);
      const version = await this.versionService.updateVersion({
        where: {
          id: Number(versionId),
        },
        data: {
          subapp: {
            connect: { id: Number(subappId) },
          },
          versionEntry: updateVersionData.versionEntry,
          versionName: updateVersionData.versionName,
          headerTags: {
            deleteMany: {},
            create: updateVersionData.headerTags,
          },
        },
      });

      return version;
    });
  }

  // 删除版本
  @Delete(':versionId')
  remove(@Param('versionId') versionId: string) {
    return this.prismaService.$transaction(async () => {
      // 先删除和version关联的headerTags数据，再删除verison
      await this.headerTagsService.delHeaderTags({
        where: {
          versionId: Number(versionId),
        },
      });
      await this.versionService.delVersion({
        where: { id: Number(versionId) },
        include: {
          headerTags: true,
        },
      });
    });
  }
}
