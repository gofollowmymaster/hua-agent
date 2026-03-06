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
}

export enum FeedbackType {
  Typo = '错别字、拼写错误',
  Inconsistent = '文档与系统实操不一致',
  LinkBroken = '链接跳转有问题',
  DifficultToUnderstand = '文档难以理解',
  Other = '建议或其他',
}
export class WikiFeedbackDto {
  @ApiProperty({
    type: String,
    description:
      '类型,枚举值： 错别字、拼写错误，文档与系统实操不一致，链接跳转有问题，文档难以理解，建议或其他 ',
  })
  type: string;
  @ApiProperty({
    type: String,
    description: '问题描述',
  })
  description: string;
  //images 需要定义为一个文件
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: '截图',
  })
  image: Express.Multer.File; // 类型可以是 any 或

  @ApiProperty({
    type: String,
    description: '节点ID',
  })
  node: string;
  @ApiProperty({
    type: String,
    description: '飞书链接',
  })
  feishuUrl: string;
}
