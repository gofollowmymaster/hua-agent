import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AliService } from './ali.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AliDevopsDto } from './dto/ali';
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
  @ApiBody({ type: AliDevopsDto })
  @UseGuards(SecretAuthGuard)
  async publish(@Body() params: AliDevopsDto) {
    return this.aliService.publish(params);
  }
}
