import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  DsOrderCarrierType,
  DsOrderStatus,
  DsOrderTransportMode,
} from '../type/ds-order.type';

export class DsOrderSortDto {
  @IsString()
  column!: string;

  @IsOptional()
  @IsBoolean()
  asc?: boolean;
}

export class DsOrderProductIdDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  key?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  value?: string[];
}

export class DsOrderPageDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @IsOptional()
  @IsBoolean()
  queryEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  queryDeleted?: boolean;

  @IsOptional()
  @IsBoolean()
  searchCount?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DsOrderSortDto)
  orders?: DsOrderSortDto[];

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  idList?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dsOrderNoList?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  externalCodeList?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tenantCodeList?: string[];

  @IsOptional()
  @IsEnum(DsOrderStatus)
  statusList?: DsOrderStatus;

  @IsOptional()
  @IsEnum(DsOrderTransportMode)
  transportMode?: DsOrderTransportMode;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  salePlatformList?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => DsOrderProductIdDto)
  productIdParam?: DsOrderProductIdDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productNameList?: string[];

  @IsOptional()
  @IsBoolean()
  mainResponsiblePersonFlag?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  operationsManagerCodeList?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  createdAtStart?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  createdAtEnd?: number;

  @IsOptional()
  @IsEnum(DsOrderCarrierType)
  carrierType?: DsOrderCarrierType;
}

export class DsOrderInfoDto {
  @IsString()
  @IsNotEmpty()
  dsOrderNo!: string;

  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1])
  queryAvailableQuantity?: number;
}

export class DsOrderLogPageDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @IsString()
  @IsNotEmpty()
  dsOrderNo!: string;
}

export class DsOrderAuditDto {
  @IsString()
  @IsNotEmpty()
  dsOrderNo!: string;

  @Type(() => Number)
  @IsIn([0, 1])
  passed!: number;

  @ValidateIf((value: DsOrderAuditDto) => value.passed === 0)
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  msg?: string;
}

export class DsOrderCancelDto {
  @IsString()
  @IsNotEmpty()
  dsOrderNo!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  cancelMsg!: string;
}
