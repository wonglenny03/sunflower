import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, FindOptionsWhere } from 'typeorm'
import { Company } from './entities/company.entity'
import { CreateCompanyDto } from './dto/create-company.dto'
import { GetCompaniesDto } from './dto/get-companies.dto'

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto, userId: string) {
    const company = this.companyRepository.create({
      ...createCompanyDto,
      userId,
    })
    return this.companyRepository.save(company)
  }

  async createMany(
    createCompanyDtos: CreateCompanyDto[],
    userId: string,
  ): Promise<Company[]> {
    const companies = createCompanyDtos.map((dto) =>
      this.companyRepository.create({
        ...dto,
        userId,
      }),
    )
    return this.companyRepository.save(companies)
  }

  async update(id: string, updateData: Partial<Company>): Promise<Company> {
    await this.companyRepository.update(id, updateData)
    return this.companyRepository.findOne({ where: { id } })
  }

  async findAll(getCompaniesDto: GetCompaniesDto, userId: string) {
    const { page = 1, limit = 10, ...filters } = getCompaniesDto
    const skip = (page - 1) * limit

    const where: FindOptionsWhere<Company> = { userId }

    if (filters.country) {
      where.country = filters.country
    }
    if (filters.keywords) {
      where.keywords = filters.keywords
    }
    if (filters.emailStatus) {
      where.emailStatus = filters.emailStatus
    }

    const [data, total] = await this.companyRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    })

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findById(id: string, userId: string): Promise<Company> {
    return this.companyRepository.findOne({
      where: { id, userId },
    })
  }

  async checkDuplicate(
    companyName: string,
    email?: string,
    website?: string,
    userId?: string,
  ): Promise<boolean> {
    const where: FindOptionsWhere<Company> = {}

    if (userId) {
      where.userId = userId
    }

    const existing = await this.companyRepository.findOne({
      where: [
        { ...where, companyName },
        ...(email ? [{ ...where, email }] : []),
        ...(website ? [{ ...where, website }] : []),
      ],
    })

    return !!existing
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.companyRepository.delete({ id, userId })
  }

  async deleteMany(ids: string[], userId: string): Promise<void> {
    await this.companyRepository
      .createQueryBuilder()
      .delete()
      .where('id IN (:...ids)', { ids })
      .andWhere('userId = :userId', { userId })
      .execute()
  }
}
