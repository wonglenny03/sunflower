import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateEmailTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: 'Email subject' })
  @IsString()
  @IsNotEmpty()
  subject: string

  @ApiProperty({ description: 'Email content (HTML)' })
  @IsString()
  @IsNotEmpty()
  content: string

  @ApiPropertyOptional({ description: 'Set as default template', default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean
}

