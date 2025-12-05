import { IsString, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({
    description: 'Email or username',
    example: 'user@example.com or john_doe',
  })
  @IsString()
  @IsNotEmpty()
  emailOrUsername: string

  @ApiProperty({ description: 'Password', example: 'Password123' })
  @IsString()
  @IsNotEmpty()
  password: string
}

