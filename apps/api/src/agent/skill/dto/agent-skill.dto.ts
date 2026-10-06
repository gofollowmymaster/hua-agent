import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/** 查询系统 Skill 的可选关键词。 */
export class QuerySystemSkillDto {
  @ApiPropertyOptional({ maxLength: 64 })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(64)
  keyword?: string;
}

/** 分页查询当前用户 Skill。 */
export class QueryUserSkillDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({ maxLength: 64 })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(64)
  keyword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

/** 创建当前用户的个人 Skill。 */
export class CreateUserSkillDto {
  @ApiProperty({ minLength: 1, maxLength: 64 })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  name: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ minLength: 1, maxLength: 12000 })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(12000)
  instruction: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

/** 修改当前用户的个人 Skill。 */
export class UpdateUserSkillDto extends PartialType(CreateUserSkillDto) {}
