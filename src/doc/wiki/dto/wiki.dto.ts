import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { tenantCodeMap } from '@src/config/tenant';
import { JsonTypeValidator } from '@src/doc/common/validator/json-type';
import {
  IsString,
  IsNotEmpty,
  IsUrl,
  ValidateIf,
  IsJSON,
  Validate,
} from 'class-validator';
import { AplusResponse, BitTableList } from '@src/type/global';

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
  @ApiPropertyOptional({
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
    example: ['错别字、拼写错误', '文档难以理解'],
    pattern: '^\\[.*\\]$',
  })
  @IsJSON({ message: 'type必须是有效的JSON字符串' })
  @Validate(JsonTypeValidator, {
    message: 'type必须是包含有效反馈类型的JSON数组',
  })
  type: string;
  @ApiProperty({
    type: String,
    description: '问题描述',
  })
  @IsNotEmpty({ message: '问题描述不能为空' })
  description: string;
  //image 需要定义为一个文件
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: '截图',
  })
  @ValidateIf((o) => o.image !== undefined)
  image: Express.Multer.File; // 类型可以是 any 或

  @ApiProperty({
    type: String,
    description: '节点ID',
  })
  @IsNotEmpty({ message: '节点ID不能为空' })
  node: string;
  @ApiProperty({
    type: String,
    description: '飞书链接',
  })
  @IsString({ message: '飞书链接必须是字符串' })
  @IsNotEmpty({ message: '飞书链接不能为空' })
  @IsUrl(
    {
      protocols: ['https'],
      require_protocol: true,
    },
    { message: '请输入有效的飞书链接' },
  )
  feishuUrl: string;
}

/**
 * 响应 DTO 类
 * 使用具体的响应类而不是泛型，以便 Swagger/Apifox 能够完整解析响应结构
 */

export class AplusResponseWikiFeedback extends AplusResponse<boolean> {
  @ApiProperty({
    type: Number,
    example: 200,
    description: '返回码',
  })
  code: number;

  @ApiProperty({
    type: String,
    example: 'success',
    description: '返回信息',
  })
  message: string;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: '返回数据',
  })
  body: boolean;
}

export class WikiBlackListResponseListDto extends BitTableList {
  @ApiProperty({
    type: [WikiBlackListResponseDto],
    description: '列表',
  })
  list: WikiBlackListResponseDto[];
}
export class AplusResponseWikiBlackListList extends AplusResponse {
  @ApiProperty({
    type: WikiBlackListResponseListDto,
    description: '数据',
  })
  body: WikiBlackListResponseListDto;
}
