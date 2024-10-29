import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, VerifyMCodeAndDCode, CompanyNames } from '@prisma/client';

@Injectable()
export class VerifyService {
  constructor(private prisma: PrismaService) {}

  async createVerify(
    data: Prisma.VerifyMCodeAndDCodeCreateInput,
  ): Promise<VerifyMCodeAndDCode> {
    return this.prisma.verifyMCodeAndDCode.create({
      data,
    });
  }

  async createMIds(
    postData: Prisma.VerifyMCodeAndDCodeCreateManyArgs,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.verifyMCodeAndDCode.createMany(postData);
  }

  // 根据Mid查询verify值
  async findVerifyById(
    VerifyWhereUniqueInput: Prisma.VerifyMCodeAndDCodeWhereUniqueInput,
  ): Promise<VerifyMCodeAndDCode | null> {
    console.log('findVerifyById-params', VerifyWhereUniqueInput);
    return this.prisma.verifyMCodeAndDCode.findUnique({
      where: VerifyWhereUniqueInput,
    });
  }

  // 根据mid更新数据
  async updateVerifyByMId(
    data: Prisma.VerifyMCodeAndDCodeUpdateArgs,
  ): Promise<VerifyMCodeAndDCode> {
    console.log('updateVerifyByMId-params', data);
    return this.prisma.verifyMCodeAndDCode.update(data);
  }

  // 根据mid，将componyName存入表中
  async updateComponyNameByMid(
    data: Prisma.CompanyNamesCreateArgs,
  ): Promise<CompanyNames> {
    return this.prisma.companyNames.create(data);
  }
  // 根据mid，将componyName存入表中
  async findCompanyNamesByMid(
    data: Prisma.CompanyNamesFindManyArgs,
  ): Promise<CompanyNames[]> {
    return this.prisma.companyNames.findMany(data);
  }
}
