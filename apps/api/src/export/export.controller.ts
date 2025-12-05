import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Response } from 'express'
import { ExportService } from './export.service'
import { GetCompaniesDto } from '../companies/dto/get-companies.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { User } from '../users/entities/user.entity'

@ApiTags('export')
@Controller('export')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('excel')
  @ApiOperation({ summary: 'Export companies to Excel' })
  async exportExcel(
    @Query() query: GetCompaniesDto,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const buffer = await this.exportService.exportToExcel(query, user.id)

    const filename = `companies_${new Date().toISOString().split('T')[0]}.xlsx`

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(buffer)
  }
}

