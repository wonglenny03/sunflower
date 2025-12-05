import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { CompaniesService } from './companies.service'
import { CreateCompanyDto } from './dto/create-company.dto'
import { GetCompaniesDto } from './dto/get-companies.dto'
import { BatchDeleteDto } from './dto/batch-delete.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { User } from '../users/entities/user.entity'

@ApiTags('companies')
@Controller('companies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'Get companies list with pagination' })
  async findAll(
    @Query() query: GetCompaniesDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.companiesService.findAll(query, user.id)
    return {
      success: true,
      data: result,
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const company = await this.companiesService.findById(id, user.id)
    return {
      success: true,
      data: company,
    }
  }

  @Delete('batch')
  @ApiOperation({ summary: 'Batch delete companies' })
  async batchRemove(
    @Body() body: BatchDeleteDto,
    @CurrentUser() user: User,
  ) {
    await this.companiesService.deleteMany(body.ids, user.id)
    return {
      success: true,
      message: 'Companies deleted successfully',
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete company' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.companiesService.delete(id, user.id)
    return {
      success: true,
      message: 'Company deleted successfully',
    }
  }
}

