import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, Subapp } from '@prisma/client';

@Injectable()
export class SubappService {
  constructor(private prisma: PrismaService) {}

  async createSubapp(data: Prisma.SubappCreateInput): Promise<Subapp> {
    return this.prisma.subapp.create({
      data,
    });
  }

  async findSubapp(
    SubappWhereUniqueInput: Prisma.SubappWhereUniqueInput,
  ): Promise<Subapp | null> {
    return this.prisma.subapp.findUnique({
      where: SubappWhereUniqueInput,
      include: {
        versions: true,
      },
    });
  }

  async updateSubapp(params: {
    where: { id: number };
    data: Prisma.SubappUpdateInput;
  }): Promise<Subapp> {
    const { data, where } = params;
    return this.prisma.subapp.update({
      where,
      data,
    });
  }

  async delSubapp(where: { id: number }): Promise<Subapp> {
    return this.prisma.subapp.delete({
      where,
    });
  }
}
