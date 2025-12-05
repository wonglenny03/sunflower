import { Injectable } from '@nestjs/common'
import { OpenAIService } from './openai.service'
import { CompaniesService } from '../companies/companies.service'
import { SearchHistoryService } from '../search-history/search-history.service'
import { SearchCompanyDto } from './dto/search-company.dto'
import { CreateCompanyDto } from '../companies/dto/create-company.dto'
import { Company } from '../companies/entities/company.entity'

@Injectable()
export class SearchService {
  constructor(
    private readonly openAIService: OpenAIService,
    private readonly companiesService: CompaniesService,
    private readonly searchHistoryService: SearchHistoryService,
  ) {}

  async search(
    searchDto: SearchCompanyDto,
    userId: string,
  ): Promise<{
    companies: Company[]
    total: number
    hasMore: boolean
    searchHistoryId: string
    duplicatesRemoved: number
    hasHistory: boolean
  }> {
    const { country, keywords, limit = 10 } = searchDto

    // Check if there's existing history for these keywords
    const existingHistory = await this.searchHistoryService.findByKeywords(keywords, userId)
    const hasHistory = existingHistory.length > 0

    // Search companies using OpenAI
    const searchedCompanies = await this.openAIService.searchCompanies(country, keywords, limit)

    // Filter out duplicates
    const newCompanies: CreateCompanyDto[] = []
    let duplicatesRemoved = 0
    for (const company of searchedCompanies) {
      const isDuplicate = await this.companiesService.checkDuplicate(
        company.companyName,
        company.email,
        company.website,
        userId,
      )
      if (!isDuplicate) {
        newCompanies.push(company)
      } else {
        duplicatesRemoved++
      }
    }

    // Create search history
    const searchHistory = await this.searchHistoryService.create(
      {
        keywords,
        country,
        resultCount: newCompanies.length,
        searchParams: { limit },
      },
      userId,
    )

    // Save companies to database and get saved companies with IDs
    let savedCompanies: Company[] = []
    if (newCompanies.length > 0) {
      savedCompanies = await this.companiesService.createMany(
        newCompanies.map(c => ({
          ...c,
          searchHistoryId: searchHistory.id,
        })),
        userId,
      )
    }

    return {
      companies: savedCompanies,
      total: savedCompanies.length,
      hasMore: savedCompanies.length >= limit,
      searchHistoryId: searchHistory.id,
      duplicatesRemoved,
      hasHistory,
    }
  }
}
