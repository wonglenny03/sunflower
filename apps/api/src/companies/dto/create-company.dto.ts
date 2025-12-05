import { IsString, IsOptional, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateCompanyDto {
  @ApiProperty({ description: 'Company name' })
  @IsString()
  @IsNotEmpty()
  companyName: string

  @ApiProperty({ description: 'Phone number', required: false })
  @IsString()
  @IsOptional()
  phone?: string

  @ApiProperty({ description: 'Email address', required: false })
  @IsString()
  @IsOptional()
  email?: string

  @ApiProperty({ description: 'Website URL', required: false })
  @IsString()
  @IsOptional()
  website?: string

  @ApiProperty({ description: 'Country', example: 'singapore' })
  @IsString()
  @IsNotEmpty()
  country: string

  @ApiProperty({ description: 'Search keywords' })
  @IsString()
  @IsNotEmpty()
  keywords: string

  @ApiProperty({ description: 'Search history ID', required: false })
  @IsString()
  @IsOptional()
  searchHistoryId?: string
}

