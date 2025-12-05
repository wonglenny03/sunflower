import { Injectable, OnModuleInit } from '@nestjs/common'
import { EmailTemplateService } from './email-template.service'
import { GLOBAL_HEADHUNTERS_TEMPLATE } from './templates/global-headhunters.template'

/**
 * 邮件模板初始化服务
 * 在模块启动时创建默认模板
 */
@Injectable()
export class EmailTemplateInitService implements OnModuleInit {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  async onModuleInit() {
    // 注意：这里需要用户 ID，但初始化时可能没有用户
    // 所以这个服务主要用于在用户注册后或首次使用时创建默认模板
    // 或者可以通过 API 端点手动触发
  }

  /**
   * 为用户创建默认模板
   * 可以在用户注册后调用，或者在用户首次访问模板功能时调用
   */
  async createDefaultTemplatesForUser(userId: string): Promise<void> {
    try {
      // 检查用户是否已有默认模板
      const defaultTemplate =
        await this.emailTemplateService.findDefault(userId)
      if (defaultTemplate) {
        // 用户已有默认模板，不需要创建
        return
      }

      // 检查是否已存在 Global Headhunters 模板
      const existingTemplates =
        await this.emailTemplateService.findAll(userId)
      const existingGlobalTemplate = existingTemplates.find(
        (t) => t.name === GLOBAL_HEADHUNTERS_TEMPLATE.name,
      )

      if (existingGlobalTemplate) {
        // 如果已存在但未设为默认，则设为默认
        await this.emailTemplateService.setDefault(
          existingGlobalTemplate.id,
          userId,
        )
      } else {
        // 创建新的 Global Headhunters 模板作为默认模板
        await this.emailTemplateService.create(
          {
            ...GLOBAL_HEADHUNTERS_TEMPLATE,
            isDefault: true,
          },
          userId,
        )
      }
    } catch (error) {
      // 抛出错误，让调用者知道失败原因
      console.error('Failed to create default email templates:', error)
      throw new Error(
        `Failed to initialize default templates: ${error.message}`,
      )
    }
  }
}

