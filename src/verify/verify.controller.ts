import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { VerifyService } from './verify.service';
import { Prisma, VerifyMCodeAndDCode as VerifyModel } from '@prisma/client';

@Controller('aplus-frontend-verify')
export class SubappController {
  constructor(private readonly verifyService: VerifyService) {}

  @Post()
  async create(
    @Body() createSubappDto: Prisma.VerifyMCodeAndDCodeCreateInput,
  ): Promise<VerifyModel> {
    return this.verifyService.createVerify(createSubappDto);
  }

  @Post('search-verify')
  async findVerifyById(
    @Body()
    body: {
      MId: string;
      DId: string;
      CompanyName: string;
    },
    @Res() response,
  ): Promise<VerifyModel> {
    const { MId, DId, CompanyName } = body;
    console.log('existingVerify-body', body);

    // 查找是否存在 MId
    const existingVerify = await this.verifyService.findVerifyById({
      MId,
    });
    const resData: VerifyModel = null;

    if (!existingVerify) {
      console.log('！existingVerify', existingVerify);
      // MId 不存在，返回错误
      throw new HttpException('MId 不存在', HttpStatus.BAD_REQUEST);
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
      return response.status(200).json({
        message: 'MId不存在，已创建MId',
        data: resData,
      });
    } else if (existingVerify && existingVerify.DId) {
      // 如果mid和did都存在，先根据mid从verify表中查找该mid数据，如果查询数据res中的did能与传入的did匹配，那么继续走，校验/创建companyName
      if (DId !== existingVerify.DId) {
        throw new HttpException(
          'MId与DId不匹配，请确认MId与DId是否输入正确',
          HttpStatus.BAD_REQUEST,
        );
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
        return response.status(200).json({
          message: 'Mid,Did存在且匹配',
          data: findRes,
          code: 200,
        });
      }
    }
    return resData;
  }
  // 返回查询结果或其他处理逻辑
}
