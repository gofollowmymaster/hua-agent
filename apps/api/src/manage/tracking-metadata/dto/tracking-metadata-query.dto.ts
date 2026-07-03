import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TrackingMetadataQueryDto {
  @ApiProperty({ description: '业务线' })
  @IsString()
  businessLine?: string;

  @ApiProperty({ description: '事件类型' })
  @IsString()
  eventType?: string;
}
