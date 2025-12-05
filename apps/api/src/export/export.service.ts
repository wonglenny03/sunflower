import { Injectable } from '@nestjs/common'
import * as ExcelJS from 'exceljs'
import { CompaniesService } from '../companies/companies.service'
import { GetCompaniesDto } from '../companies/dto/get-companies.dto'

@Injectable()
export class ExportService {
  constructor(private readonly companiesService: CompaniesService) {}

  async exportToExcel(
    getCompaniesDto: GetCompaniesDto,
    userId: string,
  ): Promise<Buffer> {
    const result = await this.companiesService.findAll(
      { ...getCompaniesDto, limit: 10000 },
      userId,
    )

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Companies')

    // Set columns
    worksheet.columns = [
      { header: 'Company Name', key: 'companyName', width: 30 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Website', key: 'website', width: 30 },
      { header: 'Country', key: 'country', width: 15 },
      { header: 'Keywords', key: 'keywords', width: 20 },
      { header: 'Email Status', key: 'emailStatus', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ]

    // Add data
    result.data.forEach((company) => {
      worksheet.addRow({
        companyName: company.companyName,
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        country: company.country,
        keywords: company.keywords,
        emailStatus: company.emailStatus,
        createdAt: company.createdAt,
      })
    })

    // Style header row
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }
}

