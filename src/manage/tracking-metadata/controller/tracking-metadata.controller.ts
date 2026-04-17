import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { TrackingMetadataService } from '../service/tracking-metadata.service';
import { TrackingMetadataQueryDto } from '../dto/tracking-metadata-query.dto';
import { TrackingMetadataListDto } from '../dto/tracking-metadata.dto';

@ApiTags('埋点元数据')
@Controller('manage/tracking-metadata')
export class TrackingMetadataController {
  constructor(private readonly service: TrackingMetadataService) {}

  @Get()
  @ApiOperation({ summary: '获取按业务线事件类型获取元数据，单次最多500条' })
  @ApiOkResponse({ type: TrackingMetadataListDto })
  async findAll(@Query() query: TrackingMetadataQueryDto) {
    return this.service.search(query.businessLine, query.eventType);
  }
}
