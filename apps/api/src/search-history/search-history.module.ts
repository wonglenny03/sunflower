import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SearchHistoryService } from './search-history.service'
import { SearchHistoryController } from './search-history.controller'
import { SearchHistory } from './entities/search-history.entity'
import { Company } from '../companies/entities/company.entity'

@Module({
  imports: [TypeOrmModule.forFeature([SearchHistory, Company])],
  controllers: [SearchHistoryController],
  providers: [SearchHistoryService],
  exports: [SearchHistoryService],
})
export class SearchHistoryModule {}

