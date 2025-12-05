import { PartialType } from '@nestjs/swagger'
import { CreateEmailTemplateDto } from './create-email-template.dto'
import { IsString, IsOptional, IsBoolean } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateEmailTemplateDto extends PartialType(CreateEmailTemplateDto) {
  @ApiPropertyOptional({ description: 'Template name' })
  @IsString()
  @IsOptional()
  name?: string

  @ApiPropertyOptional({ description: 'Email subject' })
  @IsString()
  @IsOptional()
  subject?: string

  @ApiPropertyOptional({ description: 'Email content (HTML)' })
  @IsString()
  @IsOptional()
  content?: string

  @ApiPropertyOptional({ description: 'Set as default template' })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean
}

