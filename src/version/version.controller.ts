import { Controller, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { VersionService } from './version.service';
import { Version as VersionModel } from '@prisma/client';

@Controller('version')
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @Post()
  async create(
    @Body()
    postData: {
      versionName: string;
      versionEntry?: string;
      subappId: string;
    },
  ): Promise<VersionModel> {
    const { versionName, versionEntry, subappId } = postData;
    return this.versionService.createVersion({
      versionName,
      versionEntry,
      subapp: {
        connect: { id: Number(subappId) },
      },
    });
  }

  @Put(':id/subapp/:subappId')
  async update(
    @Param('subappId') subappId: string,
    @Param('id') id: string,
    @Body()
    updateVersionDto: {
      versionName: string;
      versionEntry: string;
    },
  ) {
    return this.versionService.updateVersion({
      where: { subappId: Number(subappId), id: Number(id) },
      data: updateVersionDto,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.versionService.delVersion({ id: Number(id) });
  }
}
