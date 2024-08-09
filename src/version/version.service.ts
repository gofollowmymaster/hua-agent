import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, Version } from '@prisma/client';

@Injectable()
export class VersionService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建版本记录
   * 此函数接受一个 VersionCreateInput 类型的对象，通过 Prisma Client 在数据库中创建一个新的 Version 记录
   *
   * @param data - 一个符合 VersionCreateInput 类型的对象，包含创建版本记录所需的数据
   * @returns Promise<Version> - 一个 Promise，解析为成功创建的 Version 记录
   */
  async createVersion(data: Prisma.VersionCreateInput): Promise<Version> {
    return this.prisma.version.create({
      data,
      include: {
        headerTags: true,
      },
    });
  }

  /**
   * 更新版本记录
   * @param params - 更新版本所需的参数
   * @param params.where - 用于指定要更新的记录的唯一标识条件
   * @param params.data - 包含要更新的字段数据的对象
   * @returns Promise<Version> - 一个 Promise，解析为更新后的版本记录
   */
  async updateVersion(params: Prisma.VersionUpdateArgs) {
    const { data, where } = params;
    return this.prisma.version.update({
      data,
      where,
    });
  }

  /**
   * 删除指定 ID 的版本记录
   * 此函数接受一个对象作为参数，该对象包含一个名为 `id` 的属性，其值为要删除的版本记录的标识符。函数使用 Prisma Client 的 `delete` 方法来执行删除操作，并根据提供的条件 `where` 来指定要删除的记录。
   *
   * @param where - 一个对象，包含要删除的版本记录的唯一标识符（ID）
   * @returns Promise<void> - 一个 Promise，当删除操作成功完成时解析
   */
  async delVersion(params: Prisma.VersionDeleteArgs) {
    return this.prisma.version.delete(params);
  }
}
