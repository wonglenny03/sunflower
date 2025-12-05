import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateSearchHistoryDto {
  @ApiProperty({ description: 'Search keywords' })
  @IsString()
  @IsNotEmpty()
  keywords: string

  @ApiProperty({ description: 'Country', example: 'singapore' })
  @IsString()
  @IsNotEmpty()
  country: string

  @ApiProperty({ description: 'Number of results found', default: 0 })
  @IsInt()
  @Min(0)
  resultCount: number

  @ApiPropertyOptional({ description: 'Additional search parameters' })
  @IsOptional()
  searchParams?: Record<string, any>
}

