import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  // Res,
} from '@nestjs/common';
import { DemoPluginService } from './demo-plugin.service';
import {
  MIdStatusEnum,
  VerifyMCodeAndDCode as VerifyModel,
} from '@prisma/client';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GenerateMidDto } from './dto/generate-mid.dto';

@ApiTags('ai问答日志操作器')
@Controller('demo-plugin')
export class DemoPluginController {
  constructor(private readonly demoPluginService: DemoPluginService) {}

  @ApiOperation({
    summary: '记录日志操作人',
    description: '添加一条日志操作人记录，用于后期同步到日志表格',
  })
  @ApiBody({ type: GenerateMidDto })
  @ApiOkResponse({
    description: 'success',
    type: String,
  })
  @Post('generate-mid')
  async generateMid(
    @Body()
    body: GenerateMidDto,
  ) {
    return await this.demoPluginService.generateMid(body);
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
}
