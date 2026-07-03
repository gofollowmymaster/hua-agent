import { ApiProperty } from '@nestjs/swagger';
import { AplusResponse } from '@src/type/global';

export class TrackingMetadataDto {
  @ApiProperty({ description: '事件名称' })
  事件名称: string;

  @ApiProperty({ description: '事件ID' })
  事件: string;

  @ApiProperty({ description: '事件类型' })
  事件类型: string;
}

export class TrackingMetadataListDto extends AplusResponse {
  @ApiProperty({
    type: [TrackingMetadataDto],
    description: '跟踪元数据列表',
  })
  body: TrackingMetadataDto[];
}
