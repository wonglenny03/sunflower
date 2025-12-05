import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { EmailService } from './email.service'
import { SendEmailDto } from './dto/send-email.dto'
import { BatchSendEmailDto } from './dto/batch-send-email.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { User } from '../users/entities/user.entity'

@ApiTags('email')
@Controller('email')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send email to a company' })
  async sendEmail(
    @Body() sendEmailDto: SendEmailDto,
    @CurrentUser() user: User,
  ) {
    return this.emailService.sendEmail(sendEmailDto, user.id)
  }

  @Post('batch-send')
  @ApiOperation({ summary: 'Send emails to multiple companies' })
  async batchSendEmail(
    @Body() batchSendDto: BatchSendEmailDto,
    @CurrentUser() user: User,
  ) {
    return this.emailService.batchSendEmail(batchSendDto, user.id)
  }
}

