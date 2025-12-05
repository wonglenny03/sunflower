import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class GetCompaniesDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number

  @ApiPropertyOptional({ description: 'Filter by country' })
  @IsString()
  @IsOptional()
  country?: string

  @ApiPropertyOptional({ description: 'Filter by keywords' })
  @IsString()
  @IsOptional()
  keywords?: string

  @ApiPropertyOptional({
    description: 'Filter by email status',
    enum: ['not_sent', 'sent', 'failed'],
  })
  @IsString()
  @IsOptional()
  emailStatus?: 'not_sent' | 'sent' | 'failed'
}

