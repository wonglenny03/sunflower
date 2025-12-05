import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { SearchHistoryService } from './search-history.service'
import { GetSearchHistoryDto } from './dto/get-search-history.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { User } from '../users/entities/user.entity'

@ApiTags('search-history')
@Controller('search-history')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchHistoryController {
  constructor(private readonly searchHistoryService: SearchHistoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get search history list' })
  async findAll(@Query() query: GetSearchHistoryDto, @CurrentUser() user: User) {
    const result = await this.searchHistoryService.findAll(query, user.id)
    return {
      success: true,
      data: result,
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get search history statistics' })
  async getStatistics(@CurrentUser() user: User) {
    const statistics = await this.searchHistoryService.getStatistics(user.id)
    return {
      success: true,
      data: statistics,
    }
  }

  @Get('keywords/:keywords/companies')
  @ApiOperation({ summary: 'Get companies by keywords' })
  async getCompaniesByKeywords(
    @Param('keywords') keywords: string,
    @CurrentUser() user: User,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const result = await this.searchHistoryService.findCompaniesByKeywords(
      decodeURIComponent(keywords),
      user.id,
      parseInt(page),
      parseInt(limit),
    )
    return {
      success: true,
      data: result,
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get search history by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const history = await this.searchHistoryService.findById(id, user.id)
    if (!history) {
      return {
        success: false,
        message: 'Search history not found',
      }
    }
    return {
      success: true,
      data: history,
    }
  }

  @Delete('keywords/:keywords')
  @ApiOperation({ summary: 'Delete all search history by keywords' })
  async deleteByKeywords(@Param('keywords') keywords: string, @CurrentUser() user: User) {
    await this.searchHistoryService.deleteByKeywords(decodeURIComponent(keywords), user.id)
    return {
      success: true,
      message: 'Search history deleted successfully',
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete search history by ID' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.searchHistoryService.delete(id, user.id)
    return {
      success: true,
      message: 'Search history deleted successfully',
    }
  }

  @Delete('clear/all')
  @ApiOperation({ summary: 'Clear all search history' })
  async clearAll(@CurrentUser() user: User) {
    await this.searchHistoryService.clearAll(user.id)
    return {
      success: true,
      message: 'All search history cleared successfully',
    }
  }
}
