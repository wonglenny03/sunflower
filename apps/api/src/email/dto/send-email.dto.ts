import { IsString, IsNotEmpty, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class SendEmailDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  @IsNotEmpty()
  companyId: string

  @ApiPropertyOptional({ description: 'Email template ID' })
  @IsString()
  @IsOptional()
  templateId?: string

  @ApiPropertyOptional({ description: 'Custom email subject' })
  @IsString()
  @IsOptional()
  customSubject?: string

  @ApiPropertyOptional({ description: 'Custom email content' })
  @IsString()
  @IsOptional()
  customContent?: string
}

