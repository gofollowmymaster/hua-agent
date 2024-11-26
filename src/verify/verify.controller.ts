import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  // Res,
} from '@nestjs/common';
import { VerifyService } from './verify.service';
import {
  MIdStatusEnum,
  Prisma,
  VerifyMCodeAndDCode as VerifyModel,
} from '@prisma/client';
import { buildUUID } from 'src/utils/uuid';

@Controller('aplus-frontend-verify')
export class SubappController {
  constructor(private readonly verifyService: VerifyService) {}

  @Post()
  async create(
    @Body() createSubappDto: Prisma.VerifyMCodeAndDCodeCreateInput,
  ): Promise<VerifyModel> {
    return this.verifyService.createVerify(createSubappDto);
  }

  @Post('create')
  async createMids(
    @Body()
    body: {
      count: number;
    },
  ): Promise<VerifyModel> {
    const data = [];
    for (let i = 0; i < body.count; i++) {
      data.push({ MId: buildUUID(), DId: '' });
    }
    console.log('data--create', data);
    await this.verifyService.createMIds({
      data: data as Prisma.VerifyMCodeAndDCodeCreateManyInput[],
    });
    throw new HttpException('true', HttpStatus.OK);
  }

  @Post('search-verify')
  async findVerifyById(
    @Body()
    body: {
      MId: string;
      DId: string;
      CompanyName: string;
    },
    // @Res() response,
  ): Promise<VerifyModel> {
    const { MId, DId, CompanyName } = body;

    // 查找是否存在 MId
    const existingVerify = await this.verifyService.findVerifyById({
      MId,
    });
    console.log('findVerifyById===', existingVerify);
    if (existingVerify && existingVerify.MIdStatus === MIdStatusEnum.Disable) {
      throw new HttpException('false', HttpStatus.OK);
    }
    const resData: VerifyModel = null;

    if (!existingVerify) {
      console.log('！existingVerify', existingVerify);
      // MId 不存在，返回错误
      throw new HttpException('false', HttpStatus.OK);
    } else if (existingVerify && !existingVerify.DId) {
      // 如果mid存在但是did不存在，说明该mid还没被使用过，将mid与did关联，并根据mid创建companyName
      const verifyRes = await this.verifyService.updateVerifyByMId({
        where: { MId },
        data: { DId },
      });

      const companyRes = await this.verifyService.updateComponyNameByMid({
        select: {
          MId: true,
        },
        data: {
          CompanyName,
          MId,
        },
      });
      console.log('Mid存在，Did不存在', verifyRes, companyRes);
      // return response.status(200).json({
      //   message: 'MId不存在，已创建MId',
      //   data: resData,
      // });
      throw new HttpException('true', HttpStatus.OK);
    } else if (existingVerify && existingVerify.DId) {
      // 如果mid和did都存在，先根据mid从verify表中查找该mid数据，如果查询数据res中的did能与传入的did匹配，那么继续走，校验/创建companyName
      if (DId !== existingVerify.DId) {
        throw new HttpException('false', HttpStatus.OK);
      } else {
        console.log('mid和did都存在且匹配');
        await this.verifyService.updateComponyNameByMid({
          select: {
            MId: true,
          },
          data: {
            CompanyName,
            MId,
          },
        });
        const findRes = await this.verifyService.findCompanyNamesByMid({
          where: { MId },
        });
        console.log('Mid,Did存在且匹配', findRes);
        // return response.status(200).json({
        //   message: 'Mid,Did存在且匹配',
        //   data: findRes,
        //   code: 200,
        // });
        throw new HttpException('true', HttpStatus.OK);
      }
    }
    return resData;
  }

  @Post('changeStatus')
  async changeStatus(
    @Body()
    body: {
      MIds: string[];
      MIdStatus: MIdStatusEnum;
    },
  ): Promise<VerifyModel> {
    const { MIds, MIdStatus } = body;
    console.log('changeStatus-body-typeof', typeof MIds);
    const wherePrams =
      typeof MIds === 'string'
        ? { MId: { in: [MIds as unknown as string] } }
        : { MId: { in: MIds } };
    // 先查找传入的MIds数组，如果没找到，那么报错
    const findRes = await this.verifyService.findVerifyByIds(wherePrams);
    if (findRes.length !== 0) {
      const _where = { MId: { in: findRes.map((item) => item.MId) } };
      const existingVerify = await this.verifyService.updateMIdStatusByMIds({
        where: _where,
        data: { MIdStatus },
      });

      console.log('changeStatus-body-existingVerify', existingVerify);
      if (!existingVerify) {
        // MId 不存在，返回错误
        throw new HttpException('设置状态失败', HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          `${findRes.map((i) => i.MId)} 设置状态成功`,
          HttpStatus.OK,
        );
      }
    } else {
      throw new HttpException('未查询到MId数据', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('del-verifys')
  async deleteVerifyById(
    @Body()
    body: {
      MIds: string[];
    },
  ): Promise<VerifyModel> {
    const { MIds } = body;
    console.log('delete-body', body);
    await this.verifyService.updateComponyNameByMids({
      where: { MId: { in: MIds } },
      data: { MId: '-' },
    });
    // 查找是否存在 MId
    const existingVerify = await this.verifyService.deleteVerifyByMIds({
      where: { MId: { in: MIds } },
    });

    if (!existingVerify) {
      // MId 不存在，返回错误
      throw new HttpException('删除失败，该MId不存在', HttpStatus.BAD_REQUEST);
    } else {
      throw new HttpException('删除成功', HttpStatus.OK);
    }
  }
  // 返回查询结果或其他处理逻辑
}
