import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, FindOptionsWhere } from 'typeorm'
import { SearchHistory } from './entities/search-history.entity'
import { Company } from '../companies/entities/company.entity'
import { CreateSearchHistoryDto } from './dto/create-search-history.dto'
import { GetSearchHistoryDto } from './dto/get-search-history.dto'

@Injectable()
export class SearchHistoryService {
  constructor(
    @InjectRepository(SearchHistory)
    private readonly searchHistoryRepository: Repository<SearchHistory>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(createDto: CreateSearchHistoryDto, userId: string): Promise<SearchHistory> {
    const searchHistory = this.searchHistoryRepository.create({
      ...createDto,
      userId,
    })
    return this.searchHistoryRepository.save(searchHistory)
  }

  async findAll(
    getDto: GetSearchHistoryDto,
    userId: string,
  ): Promise<{
    data: Array<{
      keywords: string
      totalSearches: number
      totalCompanies: number
      countries: string[]
      lastSearchTime: Date
      firstSearchTime: Date
      searchHistoryIds: string[]
    }>
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const { page = 1, limit = 10 } = getDto
    const skip = (page - 1) * limit

    // 使用原始 SQL 查询以确保兼容性
    // 使用 ARRAY_AGG + ARRAY_TO_STRING 替代 STRING_AGG，兼容性更好
    const rawData = await this.searchHistoryRepository.query(
      `
      SELECT 
        sh.keywords,
        COUNT(DISTINCT sh.id) as "totalSearches",
        COALESCE(SUM(sh."resultCount"), 0) as "totalCompanies",
        MAX(sh."createdAt") as "lastSearchTime",
        MIN(sh."createdAt") as "firstSearchTime",
        ARRAY_TO_STRING(ARRAY_AGG(DISTINCT sh.id::text ORDER BY sh.id::text), ',') as "searchHistoryIds",
        ARRAY_TO_STRING(ARRAY_AGG(DISTINCT sh.country ORDER BY sh.country), ',') as "countries"
      FROM search_history sh
      WHERE sh."userId" = $1
      GROUP BY sh.keywords
      ORDER BY MAX(sh."createdAt") DESC
      LIMIT $2 OFFSET $3
    `,
      [userId, limit, skip],
    )

    const totalResult = await this.searchHistoryRepository.query(
      `
      SELECT COUNT(DISTINCT keywords) as count
      FROM search_history
      WHERE "userId" = $1
    `,
      [userId],
    )

    const data = rawData.map(item => {
      const searchHistoryIds = item.searchHistoryIds
        ? item.searchHistoryIds.split(',').filter(Boolean)
        : []
      const countries = item.countries ? item.countries.split(',').filter(Boolean) : []

      return {
        keywords: item.keywords,
        totalSearches: parseInt(item.totalSearches),
        totalCompanies: parseInt(item.totalCompanies) || 0,
        countries: countries,
        lastSearchTime: item.lastSearchTime,
        firstSearchTime: item.firstSearchTime,
        searchHistoryIds,
      }
    })

    const total = parseInt(totalResult[0]?.count || '0')

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findAllGroupedByKeywords(
    getDto: GetSearchHistoryDto,
    userId: string,
  ): Promise<{
    data: SearchHistory[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const { page = 1, limit = 10, country, keywords } = getDto
    const skip = (page - 1) * limit

    const where: FindOptionsWhere<SearchHistory> = { userId }

    if (country) {
      where.country = country
    }
    if (keywords) {
      where.keywords = keywords
    }

    const [data, total] = await this.searchHistoryRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['companies'],
    })

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findByKeywords(keywords: string, userId: string): Promise<SearchHistory[]> {
    return await this.searchHistoryRepository.find({
      where: { keywords, userId },
      order: { createdAt: 'DESC' },
    })
  }

  async deleteByKeywords(keywords: string, userId: string): Promise<void> {
    await this.searchHistoryRepository.delete({ keywords, userId })
  }

  async findCompaniesByKeywords(
    keywords: string,
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Company[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const skip = (page - 1) * limit

    // 验证该关键词是否有历史记录属于当前用户
    const historyExists = await this.searchHistoryRepository.findOne({
      where: { keywords, userId },
    })

    if (!historyExists) {
      throw new Error('Search history not found')
    }

    // 获取该关键词下所有历史记录ID
    const histories = await this.searchHistoryRepository.find({
      where: { keywords, userId },
      select: ['id'],
    })

    const historyIds = histories.map(h => h.id)

    // 查询该关键词下所有公司（去重）
    const [data, total] = await this.companyRepository
      .createQueryBuilder('company')
      .where('company.userId = :userId', { userId })
      .andWhere('company.keywords = :keywords', { keywords })
      .orderBy('company.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findById(id: string, userId: string): Promise<SearchHistory> {
    return this.searchHistoryRepository.findOne({
      where: { id, userId },
      relations: ['companies'],
    })
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.searchHistoryRepository.delete({ id, userId })
  }

  async deleteMany(ids: string[], userId: string): Promise<void> {
    await this.searchHistoryRepository.delete({ id: ids as any, userId })
  }

  async clearAll(userId: string): Promise<void> {
    await this.searchHistoryRepository.delete({ userId })
  }

  async getStatistics(userId: string) {
    const [histories, topKeywords] = await Promise.all([
      this.searchHistoryRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      }),
      this.searchHistoryRepository
        .createQueryBuilder('sh')
        .select('sh.keywords', 'keyword')
        .addSelect('COUNT(*)', 'count')
        .where('sh.userId = :userId', { userId })
        .groupBy('sh.keywords')
        .orderBy('count', 'DESC')
        .limit(5)
        .getRawMany(),
    ])

    const totalSearches = histories.length
    const totalCompanies = histories.reduce((sum, h) => sum + h.resultCount, 0)
    const lastSearchTime = histories.length > 0 ? histories[0].createdAt : null

    return {
      totalSearches,
      totalCompanies,
      lastSearchTime,
      topKeywords: topKeywords.map(item => ({
        keyword: item.keyword,
        count: parseInt(item.count),
      })),
    }
  }
}
