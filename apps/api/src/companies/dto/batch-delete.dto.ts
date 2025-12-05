import { IsArray, ArrayMinSize, IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class BatchDeleteDto {
  @ApiProperty({ description: 'Array of company IDs', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  ids: string[]
}

