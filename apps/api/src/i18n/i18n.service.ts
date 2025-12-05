import { Injectable } from '@nestjs/common'
import { Language } from '@company-search/types'

@Injectable()
export class I18nService {
  private translations: Record<Language, Record<string, string>> = {
    'zh-CN': {
      'error.user.notFound': '用户不存在',
      'error.user.exists': '用户已存在',
      'error.auth.invalid': '无效的凭证',
      'error.company.notFound': '公司不存在',
      'error.search.failed': '搜索失败',
      'error.email.failed': '邮件发送失败',
    },
    'en-US': {
      'error.user.notFound': 'User not found',
      'error.user.exists': 'User already exists',
      'error.auth.invalid': 'Invalid credentials',
      'error.company.notFound': 'Company not found',
      'error.search.failed': 'Search failed',
      'error.email.failed': 'Failed to send email',
    },
  }

  translate(key: string, language: Language = 'zh-CN'): string {
    return this.translations[language]?.[key] || key
  }
}

