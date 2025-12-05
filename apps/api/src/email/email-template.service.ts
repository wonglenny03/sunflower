import {
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EmailTemplate } from './entities/email-template.entity'
import { CreateEmailTemplateDto } from './dto/create-email-template.dto'
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto'

@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly emailTemplateRepository: Repository<EmailTemplate>,
  ) {}

  async create(
    createDto: CreateEmailTemplateDto,
    userId: string,
  ): Promise<EmailTemplate> {
    // 如果设置为默认模板，先取消其他默认模板
    if (createDto.isDefault) {
      await this.emailTemplateRepository.update(
        { userId, isDefault: true },
        { isDefault: false },
      )
    }

    const template = this.emailTemplateRepository.create({
      ...createDto,
      userId,
    })

    return await this.emailTemplateRepository.save(template)
  }

  async findAll(userId: string): Promise<EmailTemplate[]> {
    return await this.emailTemplateRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    })
  }

  async findOne(id: string, userId: string): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findOne({
      where: { id, userId },
    })

    if (!template) {
      throw new NotFoundException('Email template not found')
    }

    return template
  }

  async findDefault(userId: string): Promise<EmailTemplate | null> {
    return await this.emailTemplateRepository.findOne({
      where: { userId, isDefault: true },
    })
  }

  async update(
    id: string,
    updateDto: UpdateEmailTemplateDto,
    userId: string,
  ): Promise<EmailTemplate> {
    const template = await this.findOne(id, userId)

    // 如果设置为默认模板，先取消其他默认模板
    if (updateDto.isDefault === true) {
      await this.emailTemplateRepository
        .createQueryBuilder()
        .update(EmailTemplate)
        .set({ isDefault: false })
        .where('userId = :userId AND isDefault = :isDefault AND id != :id', {
          userId,
          isDefault: true,
          id,
        })
        .execute()
    }

    Object.assign(template, updateDto)
    return await this.emailTemplateRepository.save(template)
  }

  async remove(id: string, userId: string): Promise<void> {
    const template = await this.findOne(id, userId)

    // 如果删除的是默认模板，尝试将第一个模板设为默认
    if (template.isDefault) {
      const firstTemplate = await this.emailTemplateRepository
        .createQueryBuilder('template')
        .where('template.userId = :userId AND template.id != :id', {
          userId,
          id,
        })
        .orderBy('template.createdAt', 'ASC')
        .getOne()

      if (firstTemplate) {
        firstTemplate.isDefault = true
        await this.emailTemplateRepository.save(firstTemplate)
      }
    }

    await this.emailTemplateRepository.remove(template)
  }

  async setDefault(id: string, userId: string): Promise<EmailTemplate> {
    const template = await this.findOne(id, userId)

    // 取消其他默认模板
    await this.emailTemplateRepository.update(
      { userId, isDefault: true },
      { isDefault: false },
    )

    // 设置当前模板为默认
    template.isDefault = true
    return await this.emailTemplateRepository.save(template)
  }
}

