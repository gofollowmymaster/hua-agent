import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, Version } from '@prisma/client';

@Injectable()
export class VersionService {
  constructor(private prisma: PrismaService) {}

  async createVersion(data: Prisma.VersionCreateInput): Promise<Version> {
    return this.prisma.version.create({
      data,
    });
  }

  async updateVersion(params: {
    where: Prisma.VersionWhereUniqueInput;
    data: Prisma.VersionUpdateInput;
  }): Promise<Version> {
    const { data, where } = params;
    return this.prisma.version.update({
      data,
      where,
    });
  }

  async delVersion(where: { id: number }) {
    return this.prisma.version.delete({
      where,
    });
  }
}
