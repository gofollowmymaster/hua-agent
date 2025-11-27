import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AliService } from './ali.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AliDevopsControllerDto } from './dto/ali';
import { SecretAuthGuard } from '@src/common/guard/secret-auth';

@Controller('sync')
@ApiTags('阿里云效自动化')
export class AliController {
  constructor(private aliService: AliService) {}

  @Post('publish')
  @ApiOperation({
    summary: '应用交付',
    description: '应用交付',
  })
  @ApiBody({ type: AliDevopsControllerDto })
  @UseGuards(SecretAuthGuard)
  async publish(@Body() params: AliDevopsControllerDto) {
    if (params.appsStr && params.apps?.length < 1) {
      params.apps = params.appsStr.split(',');
    }
    if (params.testUserStr && params.testUser?.length < 1) {
      params.testUser = params.testUserStr.split(',');
    }
    const res = await this.aliService.publish(params);
    return res.map((item) => {});
  }
}
