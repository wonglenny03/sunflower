import { Module } from '@nestjs/common'
import { ExportService } from './export.service'
import { ExportController } from './export.controller'
import { CompaniesModule } from '../companies/companies.module'

@Module({
  imports: [CompaniesModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}

