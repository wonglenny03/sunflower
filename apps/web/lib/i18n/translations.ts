type Language = 'en' | 'zh'

export type TranslationKey =
  | 'nav.search'
  | 'nav.companies'
  | 'nav.history'
  | 'nav.emailTemplates'
  | 'nav.logout'
  | 'auth.login.title'
  | 'auth.login.subtitle'
  | 'auth.login.emailOrUsername'
  | 'auth.login.password'
  | 'auth.login.submit'
  | 'auth.login.signingIn'
  | 'auth.login.noAccount'
  | 'auth.login.forgotPassword'
  | 'auth.brand.name'
  | 'auth.brand.tagline'
  | 'auth.brand.description'
  | 'auth.register.title'
  | 'auth.register.subtitle'
  | 'auth.register.email'
  | 'auth.register.username'
  | 'auth.register.password'
  | 'auth.register.confirmPassword'
  | 'auth.register.submit'
  | 'auth.register.creating'
  | 'auth.register.hasAccount'
  | 'auth.register.passwordHint'
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.cancel'
  | 'common.confirm'
  | 'common.delete'
  | 'common.edit'
  | 'common.save'
  | 'common.search'
  | 'common.filter'
  | 'common.reset'
  | 'common.export'
  | 'common.import'
  | 'common.actions'
  | 'common.noData'
  | 'common.selectAll'
  | 'common.deselectAll'
  | 'common.selected'
  | 'common.batchDelete'
  | 'common.batchSend'
  | 'common.sendEmail'
  | 'common.view'
  | 'common.detail'
  | 'common.back'
  | 'common.next'
  | 'common.previous'
  | 'common.page'
  | 'common.total'
  | 'common.items'
  | 'common.of'
  | 'common.itemsPerPage'
  | 'common.language'
  | 'common.language.en'
  | 'common.language.zh'
  | 'search.title'
  | 'search.country'
  | 'search.keywords'
  | 'search.keywordsPlaceholder'
  | 'search.limit'
  | 'search.quantity'
  | 'search.submit'
  | 'search.more'
  | 'search.pageTitle'
  | 'search.pageSubtitle'
  | 'search.searching'
  | 'search.results'
  | 'search.companiesFound'
  | 'search.loadMore'
  | 'search.loading'
  | 'search.noResults'
  | 'search.table.companyName'
  | 'search.table.phone'
  | 'search.table.email'
  | 'search.table.website'
  | 'search.error'
  | 'search.loadMoreError'
  | 'search.progress.initializing'
  | 'search.progress.connecting'
  | 'search.progress.searching'
  | 'search.progress.processing'
  | 'search.progress.filtering'
  | 'search.progress.finalizing'
  | 'search.progress.complete'
  | 'search.hasHistory'
  | 'search.hasHistoryMessage'
  | 'search.duplicatesRemoved'
  | 'search.duplicatesRemovedMessage'
  | 'search.viewHistory'
  | 'companies.title'
  | 'companies.subtitle'
  | 'companies.export'
  | 'companies.country'
  | 'companies.allCountries'
  | 'companies.emailStatus'
  | 'companies.allStatus'
  | 'companies.status.notSent'
  | 'companies.status.sent'
  | 'companies.status.failed'
  | 'companies.deleteSelected'
  | 'companies.sendEmailSelected'
  | 'companies.table.companyName'
  | 'companies.table.phone'
  | 'companies.table.email'
  | 'companies.table.website'
  | 'companies.table.status'
  | 'companies.table.actions'
  | 'companies.noCompanies'
  | 'companies.noSelection'
  | 'companies.deleteConfirm'
  | 'companies.batchDeleteConfirm'
  | 'companies.emailSent'
  | 'companies.emailFailed'
  | 'companies.emailsSent'
  | 'companies.exportFailed'
  | 'companies.showing'
  | 'companies.of'
  | 'companies.filterByKeyword'
  | 'companies.filterByCountry'
  | 'companies.filterByEmailStatus'
  | 'companies.clearFilters'
  | 'companies.table.country'
  | 'companies.table.keywords'
  | 'companies.table.createdTime'
  | 'companies.status.bounced'
  | 'history.title'
  | 'history.subtitle'
  | 'history.clearAll'
  | 'history.statistics.totalSearches'
  | 'history.statistics.totalCompanies'
  | 'history.statistics.lastSearch'
  | 'history.statistics.topKeywords'
  | 'history.table.keywords'
  | 'history.table.country'
  | 'history.table.countries'
  | 'history.table.results'
  | 'history.table.searches'
  | 'history.table.companies'
  | 'history.table.searchCount'
  | 'history.table.firstSearch'
  | 'history.table.lastSearch'
  | 'history.table.date'
  | 'history.table.actions'
  | 'history.deleteKeywordConfirm'
  | 'history.deleteFailed'
  | 'history.noHistory'
  | 'history.deleteConfirm'
  | 'history.clearAllConfirm'
  | 'history.reSearch'
  | 'history.detail.title'
  | 'history.detail.keywords'
  | 'history.detail.country'
  | 'history.detail.resultsFound'
  | 'history.detail.searchDate'
  | 'history.detail.companies'
  | 'history.detail.notFound'
  | 'history.detail.description'
  | 'history.detail.filterByCountry'
  | 'nav.emailTemplates'
  | 'emailTemplates.title'
  | 'emailTemplates.subtitle'
  | 'emailTemplates.create'
  | 'emailTemplates.edit'
  | 'emailTemplates.delete'
  | 'emailTemplates.setDefault'
  | 'emailTemplates.default'
  | 'emailTemplates.inUse'
  | 'emailTemplates.setAsInUse'
  | 'emailTemplates.name'
  | 'emailTemplates.subject'
  | 'emailTemplates.content'
  | 'emailTemplates.isDefault'
  | 'emailTemplates.createdAt'
  | 'emailTemplates.updatedAt'
  | 'emailTemplates.actions'
  | 'emailTemplates.noTemplates'
  | 'emailTemplates.deleteConfirm'
  | 'emailTemplates.deleteSuccess'
  | 'emailTemplates.deleteFailed'
  | 'emailTemplates.createSuccess'
  | 'emailTemplates.createFailed'
  | 'emailTemplates.updateSuccess'
  | 'emailTemplates.updateFailed'
  | 'emailTemplates.setDefaultSuccess'
  | 'emailTemplates.setDefaultFailed'
  | 'emailTemplates.initDefaults'
  | 'emailTemplates.initDefaultsSuccess'
  | 'emailTemplates.initDefaultsFailed'
  | 'emailTemplates.preview'
  | 'emailTemplates.variables'
  | 'emailTemplates.variables.companyName'
  | 'emailTemplates.variables.keywords'
  | 'emailTemplates.variables.email'
  | 'emailTemplates.variables.phone'
  | 'emailTemplates.variables.website'
  | 'emailTemplates.variables.country'
  | 'emailTemplates.namePlaceholder'
  | 'emailTemplates.subjectPlaceholder'
  | 'emailTemplates.contentPlaceholder'

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    'nav.search': 'Search',
    'nav.companies': 'Companies',
    'nav.history': 'History',
    'nav.emailTemplates': 'Email Templates',
    'nav.logout': 'Logout',
    'auth.login.title': 'Sign in to your account',
    'auth.login.subtitle': 'Welcome back! Please enter your details.',
    'auth.login.emailOrUsername': 'Email or Username',
    'auth.login.password': 'Password',
    'auth.login.submit': 'Sign in',
    'auth.login.signingIn': 'Signing in...',
    'auth.login.noAccount': "Don't have an account? Sign up",
    'auth.login.forgotPassword': 'Forgot Password?',
    'auth.brand.name': 'IntelliSearch',
    'auth.brand.tagline': 'Unlock Global Business Intelligence.',
    'auth.brand.description':
      'Access unparalleled insights and data to drive your business decisions forward on a global scale.',
    'auth.register.title': 'Create your account',
    'auth.register.subtitle': 'Join us today! Fill in your information to get started.',
    'auth.register.email': 'Email',
    'auth.register.username': 'Username',
    'auth.register.password': 'Password',
    'auth.register.confirmPassword': 'Confirm Password',
    'auth.register.submit': 'Sign up',
    'auth.register.creating': 'Creating account...',
    'auth.register.hasAccount': 'Already have an account?',
    'auth.register.passwordHint': 'Must be at least 8 characters.',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.save': 'Save',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.reset': 'Reset',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.actions': 'Actions',
    'common.noData': 'No data available',
    'common.selectAll': 'Select All',
    'common.deselectAll': 'Deselect All',
    'common.selected': 'selected',
    'common.batchDelete': 'Batch Delete',
    'common.batchSend': 'Batch Send',
    'common.sendEmail': 'Send Email',
    'common.view': 'View',
    'common.detail': 'Detail',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.page': 'Page',
    'common.total': 'Total',
    'common.items': 'items',
    'common.of': 'of',
    'common.itemsPerPage': 'Items per page',
    'common.language': 'Language',
    'common.language.en': 'English',
    'common.language.zh': '中文',
    'search.title': 'Company Search',
    'search.country': 'Country/Region',
    'search.keywords': 'Keywords',
    'search.keywordsPlaceholder': 'Enter search keywords',
    'search.limit': 'Limit',
    'search.quantity': 'Search Quantity',
    'search.submit': 'Search',
    'search.more': 'More',
    'search.pageTitle': 'Company Information Search',
    'search.pageSubtitle': 'Find and manage company data from around the world.',
    'search.searching': 'Searching...',
    'search.results': 'Search Results',
    'search.companiesFound': 'companies found',
    'search.loadMore': 'Load More',
    'search.loading': 'Loading...',
    'search.noResults': 'No companies found',
    'search.table.companyName': 'Company Name',
    'search.table.phone': 'Phone',
    'search.table.email': 'Email',
    'search.table.website': 'Website',
    'search.error': 'Search failed',
    'search.loadMoreError': 'Load more failed',
    'search.progress.initializing': 'Initializing search...',
    'search.progress.connecting': 'Connecting to search service...',
    'search.progress.searching': 'Searching for companies...',
    'search.progress.processing': 'Processing results...',
    'search.progress.filtering': 'Filtering duplicates...',
    'search.progress.finalizing': 'Finalizing results...',
    'search.progress.complete': 'Search complete!',
    'search.hasHistory': 'Has History',
    'search.hasHistoryMessage':
      'This keyword has previous search history. You can view all historical results.',
    'search.duplicatesRemoved': 'Duplicates Removed',
    'search.duplicatesRemovedMessage': '{count} duplicate companies were removed from the results.',
    'search.viewHistory': 'View History',
    'companies.title': 'Companies',
    'companies.subtitle': 'Manage and export company information',
    'companies.export': 'Export Excel',
    'companies.country': 'Country',
    'companies.allCountries': 'All Countries',
    'companies.emailStatus': 'Email Status',
    'companies.allStatus': 'All Status',
    'companies.status.notSent': 'Not Sent',
    'companies.status.sent': 'Sent',
    'companies.status.failed': 'Failed',
    'companies.deleteSelected': 'Delete Selected',
    'companies.sendEmailSelected': 'Send Email to Selected',
    'companies.table.companyName': 'Company Name',
    'companies.table.phone': 'Phone',
    'companies.table.email': 'Email',
    'companies.table.website': 'Website',
    'companies.table.status': 'Status',
    'companies.table.actions': 'Actions',
    'companies.noCompanies': 'No companies found',
    'companies.noSelection': 'Please select at least one company',
    'companies.deleteConfirm': 'Are you sure you want to delete this company?',
    'companies.batchDeleteConfirm': 'Are you sure you want to delete {count} companies?',
    'companies.emailSent': 'Email sent successfully',
    'companies.emailFailed': 'Failed to send email',
    'companies.emailsSent': 'Emails sent successfully',
    'companies.exportFailed': 'Failed to export',
    'companies.showing': 'Showing',
    'companies.of': 'of',
    'companies.filterByKeyword': 'Filter by Keyword',
    'companies.filterByCountry': 'Filter by Country',
    'companies.filterByEmailStatus': 'Filter by Email Status',
    'companies.clearFilters': 'Clear Filters',
    'companies.table.country': 'Country',
    'companies.table.keywords': 'Keywords',
    'companies.table.createdTime': 'Created Time',
    'companies.status.bounced': 'Bounced',
    'history.title': 'Search History',
    'history.subtitle': 'View and manage your search history',
    'history.clearAll': 'Clear All',
    'history.statistics.totalSearches': 'Total Searches',
    'history.statistics.totalCompanies': 'Total Companies',
    'history.statistics.lastSearch': 'Last Search',
    'history.statistics.topKeywords': 'Top Keywords',
    'history.table.keywords': 'Keywords',
    'history.table.country': 'Country',
    'history.table.countries': 'Countries',
    'history.table.results': 'Total Companies',
    'history.table.searches': 'Searches',
    'history.table.companies': 'Companies',
    'history.table.searchCount': 'Search Count',
    'history.table.firstSearch': 'First Search',
    'history.table.lastSearch': 'Last Search',
    'history.table.date': 'Date',
    'history.table.actions': 'Actions',
    'history.noHistory': 'No search history',
    'history.deleteConfirm': 'Are you sure you want to delete this history?',
    'history.deleteKeywordConfirm':
      'Are you sure you want to delete all records for keyword "{keywords}"?',
    'history.deleteFailed': 'Failed to delete history',
    'history.clearAllConfirm': 'Are you sure you want to clear all history?',
    'history.reSearch': 'Re-search',
    'history.detail.title': 'Search History Detail',
    'history.detail.keywords': 'Keywords',
    'history.detail.country': 'Country',
    'history.detail.resultsFound': 'Results Found',
    'history.detail.searchDate': 'Search Date',
    'history.detail.companies': 'Companies',
    'history.detail.description': 'View all search records for this keyword',
    'history.detail.filterByCountry': 'Filter by Country',
    'history.detail.notFound': 'History not found',
    'emailTemplates.title': 'Email Templates',
    'emailTemplates.subtitle': 'Manage your email templates for sending business emails',
    'emailTemplates.create': 'Create Template',
    'emailTemplates.edit': 'Edit Template',
    'emailTemplates.delete': 'Delete Template',
    'emailTemplates.setDefault': 'Set as In Use',
    'emailTemplates.default': 'Default',
    'emailTemplates.inUse': 'In Use',
    'emailTemplates.setAsInUse': 'Set as In Use',
    'emailTemplates.name': 'Template Name',
    'emailTemplates.subject': 'Subject',
    'emailTemplates.content': 'Content',
    'emailTemplates.isDefault': 'Set as In Use',
    'emailTemplates.createdAt': 'Created At',
    'emailTemplates.updatedAt': 'Updated At',
    'emailTemplates.actions': 'Actions',
    'emailTemplates.noTemplates': 'No templates found. Create your first template!',
    'emailTemplates.deleteConfirm': 'Are you sure you want to delete this template?',
    'emailTemplates.deleteSuccess': 'Template deleted successfully',
    'emailTemplates.deleteFailed': 'Failed to delete template',
    'emailTemplates.createSuccess': 'Template created successfully',
    'emailTemplates.createFailed': 'Failed to create template',
    'emailTemplates.updateSuccess': 'Template updated successfully',
    'emailTemplates.updateFailed': 'Failed to update template',
    'emailTemplates.setDefaultSuccess': 'Template set as in use successfully',
    'emailTemplates.setDefaultFailed': 'Failed to set template as in use',
    'emailTemplates.initDefaults': 'Initialize Default Templates',
    'emailTemplates.initDefaultsSuccess': 'Default templates initialized successfully',
    'emailTemplates.initDefaultsFailed': 'Failed to initialize default templates',
    'emailTemplates.preview': 'Preview',
    'emailTemplates.variables': 'Available Variables',
    'emailTemplates.variables.companyName': '{{companyName}} - Company Name',
    'emailTemplates.variables.keywords': '{{keywords}} - Keywords',
    'emailTemplates.variables.email': '{{email}} - Email',
    'emailTemplates.variables.phone': '{{phone}} - Phone',
    'emailTemplates.variables.website': '{{website}} - Website',
    'emailTemplates.variables.country': '{{country}} - Country',
    'emailTemplates.namePlaceholder': 'Enter template name',
    'emailTemplates.subjectPlaceholder':
      'Enter email subject (e.g., Business Inquiry - {{companyName}})',
    'emailTemplates.contentPlaceholder': 'Enter email content (HTML)',
  },
  zh: {
    'nav.search': '搜索',
    'nav.companies': '公司',
    'nav.history': '历史',
    'nav.logout': '退出',
    'auth.login.title': '登录您的账户',
    'auth.login.subtitle': '欢迎回来！请输入您的详细信息。',
    'auth.login.emailOrUsername': '邮箱或用户名',
    'auth.login.password': '密码',
    'auth.login.submit': '登录',
    'auth.login.signingIn': '登录中...',
    'auth.login.noAccount': '还没有账户？注册',
    'auth.login.forgotPassword': '忘记密码？',
    'auth.brand.name': '智能搜索',
    'auth.brand.tagline': '解锁全球商业智能。',
    'auth.brand.description': '获取无与伦比的洞察和数据，推动您的业务决策在全球范围内向前发展。',
    'auth.register.title': '创建您的账户',
    'auth.register.subtitle': '立即加入我们！填写您的信息开始使用。',
    'auth.register.email': '邮箱',
    'auth.register.username': '用户名',
    'auth.register.password': '密码',
    'auth.register.confirmPassword': '确认密码',
    'auth.register.submit': '注册',
    'auth.register.creating': '创建账户中...',
    'auth.register.hasAccount': '已有账户？',
    'auth.register.passwordHint': '至少需要 8 个字符。',
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.save': '保存',
    'common.search': '搜索',
    'common.filter': '筛选',
    'common.reset': '重置',
    'common.export': '导出',
    'common.import': '导入',
    'common.actions': '操作',
    'common.noData': '暂无数据',
    'common.selectAll': '全选',
    'common.deselectAll': '取消全选',
    'common.selected': '已选择',
    'common.batchDelete': '批量删除',
    'common.batchSend': '批量发送',
    'common.sendEmail': '发送邮件',
    'common.view': '查看',
    'common.detail': '详情',
    'common.back': '返回',
    'common.next': '下一页',
    'common.previous': '上一页',
    'common.page': '页',
    'common.total': '总计',
    'common.items': '项',
    'common.of': '共',
    'common.itemsPerPage': '每页显示',
    'common.language': '语言',
    'common.language.en': 'English',
    'common.language.zh': '中文',
    'search.title': '公司搜索',
    'search.country': '国家/地区',
    'search.keywords': '关键词',
    'search.keywordsPlaceholder': '输入搜索关键词',
    'search.limit': '数量',
    'search.quantity': '搜索数量',
    'search.submit': '搜索',
    'search.more': '更多',
    'search.pageTitle': '公司信息搜索',
    'search.pageSubtitle': '查找和管理来自世界各地的公司数据。',
    'search.searching': '搜索中...',
    'search.results': '搜索结果',
    'search.companiesFound': '家公司',
    'search.loadMore': '加载更多',
    'search.loading': '加载中...',
    'search.noResults': '未找到公司',
    'search.table.companyName': '公司名称',
    'search.table.phone': '电话',
    'search.table.email': '邮箱',
    'search.table.website': '网站',
    'search.error': '搜索失败',
    'search.loadMoreError': '加载更多失败',
    'search.progress.initializing': '正在初始化搜索...',
    'search.progress.connecting': '正在连接搜索服务...',
    'search.progress.searching': '正在搜索公司...',
    'search.progress.processing': '正在处理结果...',
    'search.progress.filtering': '正在过滤重复项...',
    'search.progress.finalizing': '正在完成搜索...',
    'search.progress.complete': '搜索完成！',
    'search.hasHistory': '有历史记录',
    'search.hasHistoryMessage': '该关键词有历史搜索记录，您可以查看所有历史搜索结果。',
    'search.duplicatesRemoved': '已去重',
    'search.duplicatesRemovedMessage': '已从结果中移除 {count} 家重复公司。',
    'search.viewHistory': '查看历史记录',
    'companies.title': '公司列表',
    'companies.subtitle': '管理和导出公司信息',
    'companies.export': '导出 Excel',
    'companies.country': '国家',
    'companies.allCountries': '所有国家',
    'companies.emailStatus': '邮件状态',
    'companies.allStatus': '所有状态',
    'companies.status.notSent': '未发送',
    'companies.status.sent': '已发送',
    'companies.status.failed': '发送失败',
    'companies.deleteSelected': '删除选中',
    'companies.sendEmailSelected': '发送邮件给选中',
    'companies.table.companyName': '公司名称',
    'companies.table.phone': '电话',
    'companies.table.email': '邮箱',
    'companies.table.website': '网站',
    'companies.table.status': '状态',
    'companies.table.actions': '操作',
    'companies.noCompanies': '未找到公司',
    'companies.noSelection': '请至少选择一个公司',
    'companies.deleteConfirm': '确定要删除这家公司吗？',
    'companies.batchDeleteConfirm': '确定要删除 {count} 家公司吗？',
    'companies.emailSent': '邮件发送成功',
    'companies.emailFailed': '邮件发送失败',
    'companies.emailsSent': '邮件发送成功',
    'companies.exportFailed': '导出失败',
    'companies.showing': '显示',
    'companies.of': '共',
    'companies.filterByKeyword': '按关键词筛选',
    'companies.filterByCountry': '按国家筛选',
    'companies.filterByEmailStatus': '按邮件状态筛选',
    'companies.clearFilters': '清除筛选',
    'companies.table.country': '国家',
    'companies.table.keywords': '关键词',
    'companies.table.createdTime': '创建时间',
    'companies.status.bounced': '退回',
    'history.title': '搜索历史',
    'history.subtitle': '查看和管理您的搜索历史',
    'history.clearAll': '清空全部',
    'history.statistics.totalSearches': '总搜索次数',
    'history.statistics.totalCompanies': '总公司数',
    'history.statistics.lastSearch': '最近搜索',
    'history.statistics.topKeywords': '热门关键词',
    'history.table.keywords': '关键词',
    'history.table.country': '国家',
    'history.table.countries': '国家/地区',
    'history.table.results': '公司总数',
    'history.table.searches': '搜索次数',
    'history.table.companies': '公司数',
    'history.table.searchCount': '搜索次数',
    'history.table.firstSearch': '首次搜索',
    'history.table.lastSearch': '最后搜索',
    'history.table.date': '日期',
    'history.table.actions': '操作',
    'history.noHistory': '暂无搜索历史',
    'history.deleteConfirm': '确定要删除这条历史记录吗？',
    'history.deleteKeywordConfirm': '确定要删除关键词"{keywords}"的所有记录吗？',
    'history.deleteFailed': '删除历史记录失败',
    'history.clearAllConfirm': '确定要清空所有历史记录吗？',
    'history.reSearch': '重新搜索',
    'history.detail.title': '搜索历史详情',
    'history.detail.keywords': '关键词',
    'history.detail.country': '国家',
    'history.detail.resultsFound': '找到结果',
    'history.detail.searchDate': '搜索日期',
    'history.detail.companies': '公司列表',
    'history.detail.description': '查看该关键词的所有搜索记录',
    'history.detail.filterByCountry': '按国家筛选',
    'history.detail.notFound': '历史记录未找到',
    'nav.emailTemplates': '邮件模板',
    'emailTemplates.title': '邮件模板',
    'emailTemplates.subtitle': '管理您的邮件模板，用于发送商务邮件',
    'emailTemplates.create': '创建模板',
    'emailTemplates.edit': '编辑模板',
    'emailTemplates.delete': '删除模板',
    'emailTemplates.setDefault': '设为使用中',
    'emailTemplates.default': '默认',
    'emailTemplates.inUse': '使用中',
    'emailTemplates.setAsInUse': '设为使用中',
    'emailTemplates.name': '模板名称',
    'emailTemplates.subject': '主题',
    'emailTemplates.content': '内容',
    'emailTemplates.isDefault': '设为使用中',
    'emailTemplates.createdAt': '创建时间',
    'emailTemplates.updatedAt': '更新时间',
    'emailTemplates.actions': '操作',
    'emailTemplates.noTemplates': '未找到模板。创建您的第一个模板！',
    'emailTemplates.deleteConfirm': '确定要删除此模板吗？',
    'emailTemplates.deleteSuccess': '模板删除成功',
    'emailTemplates.deleteFailed': '删除模板失败',
    'emailTemplates.createSuccess': '模板创建成功',
    'emailTemplates.createFailed': '创建模板失败',
    'emailTemplates.updateSuccess': '模板更新成功',
    'emailTemplates.updateFailed': '更新模板失败',
    'emailTemplates.setDefaultSuccess': '模板已设为使用中',
    'emailTemplates.setDefaultFailed': '设置模板为使用中失败',
    'emailTemplates.initDefaults': '初始化默认模板',
    'emailTemplates.initDefaultsSuccess': '默认模板初始化成功',
    'emailTemplates.initDefaultsFailed': '初始化默认模板失败',
    'emailTemplates.preview': '预览',
    'emailTemplates.variables': '可用变量',
    'emailTemplates.variables.companyName': '{{companyName}} - 公司名称',
    'emailTemplates.variables.keywords': '{{keywords}} - 关键词',
    'emailTemplates.variables.email': '{{email}} - 邮箱',
    'emailTemplates.variables.phone': '{{phone}} - 电话',
    'emailTemplates.variables.website': '{{website}} - 网站',
    'emailTemplates.variables.country': '{{country}} - 国家',
    'emailTemplates.namePlaceholder': '输入模板名称',
    'emailTemplates.subjectPlaceholder': '输入邮件主题（例如：商务咨询 - {{companyName}}）',
    'emailTemplates.contentPlaceholder': '输入邮件内容（HTML）',
  },
}
