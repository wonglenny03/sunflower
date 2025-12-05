import { Module } from '@nestjs/common'
import { SearchService } from './search.service'
import { SearchController } from './search.controller'
import { CompaniesModule } from '../companies/companies.module'
import { SearchHistoryModule } from '../search-history/search-history.module'
import { OpenAIService } from './openai.service'

@Module({
  imports: [CompaniesModule, SearchHistoryModule],
  controllers: [SearchController],
  providers: [SearchService, OpenAIService],
  exports: [SearchService],
})
export class SearchModule {}

