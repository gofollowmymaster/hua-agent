import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, HeaderTags } from '@prisma/client';

@Injectable()
export class HeaderTagsService {
  constructor(private prisma: PrismaService) {}

  // 单个创建
  async createHeaderTag(
    data: Prisma.HeaderTagsCreateInput,
  ): Promise<HeaderTags> {
    return this.prisma.headerTags.create({
      data,
    });
  }

  // 创建多个
  async createHeaderTags(data: Prisma.HeaderTagsCreateManyInput[]) {
    return this.prisma.headerTags.createMany({
      data,
    });
  }
}
