import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { tenantCodeMap } from '@src/config/tenant';

export class WikiTreeDto {
  @ApiProperty({
    type: String,
    description: '飞书知识库ID',
  })
  spaceId: string;
  @ApiProperty({
    type: String,
    description: '是否强制刷新数据（不使用缓存）',
  })
  force: boolean;
}

export class WikiSearchDto {
  @ApiProperty({
    type: String,
    description: '飞书知识空间ID',
  })
  spaceId: string;
  @ApiProperty({
    type: String,
    description: '搜索关键词',
  })
  query: string;
  @ApiProperty({
    type: String,
    description: '子节点Id',
  })
  nodeId?: string;
}

export enum BlackListType {
  text = '文本',
  link = '链接',
}
export class WikiBlackListDto {
  @ApiProperty({
    type: Array<BlackListType>,

    description: '类型,枚举值：文本，链接',
  })
  type: Array<BlackListType>;
  @ApiPropertyOptional({
    enum: tenantCodeMap,
    description: '服务商',
  })
  supplierCode: tenantCodeMap;
}
export class WikiBlackListResponseDto {
  @ApiProperty({ example: 1, description: 'ID' })
  id: string;
  @ApiProperty({
    type: Array<BlackListType>,
    description: '类型,枚举值：文本，链接',
  })
  type: Array<BlackListType>;
  @ApiProperty({
    enum: tenantCodeMap,
    description: '服务商',
  })
  supplierCode: tenantCodeMap;
  @ApiProperty({
    type: String,
    description: '关键字',
  })
  keyword: string;
  @ApiProperty({
    type: Boolean,
    description: '是否需要严格比对',
  })
  rawSearch: boolean;
}
