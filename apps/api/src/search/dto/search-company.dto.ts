import { IsString, IsNotEmpty, IsInt, IsOptional, Min, Max } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class SearchCompanyDto {
  @ApiProperty({ description: 'Country', example: 'singapore' })
  @IsString()
  @IsNotEmpty()
  country: string

  @ApiProperty({ description: 'Search keywords' })
  @IsString()
  @IsNotEmpty()
  keywords: string

  @ApiPropertyOptional({ description: 'Number of results', default: 10 })
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number
}

