import { IsArray, IsString, ArrayMinSize, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class BatchSendEmailDto {
  @ApiProperty({ description: 'Array of company IDs', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  companyIds: string[]

  @ApiPropertyOptional({ description: 'Email template ID' })
  @IsString()
  @IsOptional()
  templateId?: string
}

