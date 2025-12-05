import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'
import { CompaniesService } from '../companies/companies.service'
import { EmailTemplateService } from './email-template.service'
import { SendEmailDto } from './dto/send-email.dto'
import { BatchSendEmailDto } from './dto/batch-send-email.dto'

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter

  constructor(
    private readonly configService: ConfigService,
    private readonly companiesService: CompaniesService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    })
  }

  async sendEmail(sendEmailDto: SendEmailDto, userId: string) {
    const { companyId, templateId, customSubject, customContent } = sendEmailDto

    const company = await this.companiesService.findById(companyId, userId)
    if (!company || !company.email) {
      throw new Error('Company not found or has no email')
    }

    // 测试阶段：统一发送到测试邮箱
    const TEST_EMAIL = 'marklinmac@gmail.com'
    const isTestMode = true // 测试模式开关

    // 获取邮件主题和内容
    let originalSubject: string
    let originalContent: string

    if (customSubject && customContent) {
      // 使用自定义内容
      originalSubject = customSubject
      originalContent = customContent
    } else if (templateId) {
      // 使用指定模板
      const template = await this.emailTemplateService.findOne(templateId, userId)
      originalSubject = this.replaceTemplateVariables(template.subject, company)
      originalContent = this.replaceTemplateVariables(template.content, company)
    } else {
      // 使用默认模板或系统默认
      const defaultTemplate = await this.emailTemplateService.findDefault(userId)
      if (defaultTemplate) {
        originalSubject = this.replaceTemplateVariables(defaultTemplate.subject, company)
        originalContent = this.replaceTemplateVariables(defaultTemplate.content, company)
      } else {
        // 使用系统默认模板
        originalSubject = customSubject || `商务合作咨询 - ${company.companyName}`
        originalContent =
          customContent || this.getDefaultEmailTemplate(company.companyName, company.keywords)
      }
    }

    const subject = isTestMode
      ? `[测试模式] ${originalSubject} - 原始收件人: ${company.email}`
      : originalSubject

    const content = isTestMode
      ? this.getTestModeEmailTemplate(
          company.companyName,
          company.email,
          company.keywords,
          originalContent,
        )
      : originalContent

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM'),
        to: isTestMode ? TEST_EMAIL : company.email,
        subject,
        html: content,
      })

      // Update company email status
      await this.companiesService.update(companyId, {
        emailSent: true,
        emailSentAt: new Date(),
        emailStatus: 'sent',
      } as any)

      return { success: true, message: 'Email sent successfully' }
    } catch (error) {
      // Update company email status
      await this.companiesService.update(companyId, {
        emailStatus: 'failed',
      } as any)

      throw new Error('Failed to send email: ' + error.message)
    }
  }

  async batchSendEmail(batchSendDto: BatchSendEmailDto, userId: string) {
    const { companyIds, templateId } = batchSendDto
    const results = []

    for (const companyId of companyIds) {
      try {
        await this.sendEmail({ companyId, templateId }, userId)
        results.push({ companyId, success: true })
      } catch (error) {
        results.push({ companyId, success: false, error: error.message })
      }
    }

    return {
      success: true,
      data: results,
    }
  }

  /**
   * 替换模板变量
   * 支持的变量：
   * - {{companyName}} - 公司名称
   * - {{keywords}} - 关键词
   * - {{email}} - 邮箱
   * - {{phone}} - 电话
   * - {{website}} - 网站
   * - {{country}} - 国家
   */
  private replaceTemplateVariables(template: string, company: any): string {
    return template
      .replace(/\{\{companyName\}\}/g, company.companyName || '')
      .replace(/\{\{keywords\}\}/g, company.keywords || '')
      .replace(/\{\{email\}\}/g, company.email || '')
      .replace(/\{\{phone\}\}/g, company.phone || '')
      .replace(/\{\{website\}\}/g, company.website || '')
      .replace(/\{\{country\}\}/g, company.country || '')
  }

  private getDefaultEmailTemplate(companyName: string, keywords: string): string {
    return `
      <html>
        <body>
          <p>尊敬的 ${companyName} 团队：</p>
          <p>您好！</p>
          <p>我是来自 [您的公司名称] 的 [您的姓名]，我们专注于 [业务领域]。</p>
          <p>我们注意到贵公司在 ${keywords} 领域有着卓越的表现，希望能够与贵公司建立合作关系。</p>
          <p>期待您的回复，我们可以进一步讨论合作的可能性。</p>
          <p>此致<br>敬礼！</p>
          <p>[您的姓名]<br>[您的职位]<br>[您的公司名称]</p>
        </body>
      </html>
    `
  }

  private getTestModeEmailTemplate(
    companyName: string,
    originalEmail: string,
    keywords: string,
    originalContent: string,
  ): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #856404;">⚠️ 测试模式</h3>
            <p style="margin-bottom: 0;"><strong>原始收件人：</strong> ${originalEmail}</p>
            <p style="margin-bottom: 0;"><strong>公司名称：</strong> ${companyName}</p>
            <p style="margin-bottom: 0;"><strong>关键词：</strong> ${keywords}</p>
          </div>
          <hr style="border: none; border-top: 2px dashed #ccc; margin: 20px 0;">
          <div style="margin-top: 20px;">
            ${originalContent}
          </div>
        </body>
      </html>
    `
  }
}
