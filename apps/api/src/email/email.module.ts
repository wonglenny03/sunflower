import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EmailService } from './email.service'
import { EmailController } from './email.controller'
import { EmailTemplateService } from './email-template.service'
import { EmailTemplateController } from './email-template.controller'
import { EmailTemplateInitService } from './email-template-init.service'
import { EmailTemplate } from './entities/email-template.entity'
import { CompaniesModule } from '../companies/companies.module'

@Module({
  imports: [
    CompaniesModule,
    TypeOrmModule.forFeature([EmailTemplate]),
  ],
  controllers: [EmailController, EmailTemplateController],
  providers: [
    EmailService,
    EmailTemplateService,
    EmailTemplateInitService,
  ],
  exports: [EmailService, EmailTemplateService],
})
export class EmailModule {}

