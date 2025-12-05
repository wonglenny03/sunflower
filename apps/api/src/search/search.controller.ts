import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { SearchService } from './search.service'
import { SearchCompanyDto } from './dto/search-company.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { User } from '../users/entities/user.entity'

@ApiTags('search')
@Controller('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('companies')
  @ApiOperation({ summary: 'Search companies using OpenAI' })
  async search(
    @Body() searchDto: SearchCompanyDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.searchService.search(searchDto, user.id)
    return {
      success: true,
      data: result,
    }
  }
}

