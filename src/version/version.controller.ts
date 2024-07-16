import { Controller, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { VersionService } from './version.service';
import { Version as VersionModel } from '@prisma/client';

@Controller('version')
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  // 创建版本
  @Post()
  async create(
    @Body()
    postData: {
      versionName: string;
      versionEntry?: string;
      reqKey?: string;
      reqVal?: string;
      subappId: string;
    },
  ): Promise<VersionModel> {
    const { versionName, versionEntry, subappId, reqKey, reqVal } = postData;
    return this.versionService.createVersion({
      versionName,
      versionEntry,
      reqKey,
      reqVal,
      subapp: {
        connect: { id: Number(subappId) },
      },
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
