'use client'

import { useState, useEffect } from 'react'
import { emailTemplatesApi, CreateEmailTemplateDto, UpdateEmailTemplateDto } from '@/lib/api/email-templates'
import { EmailTemplate } from '@company-search/types'
import { Loading } from '@/components/common/Loading'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function EmailTemplatesPage() {
  const { t } = useTranslation()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [formData, setFormData] = useState<CreateEmailTemplateDto>({
    name: '',
    subject: '',
    content: '',
    isDefault: false,
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const data = await emailTemplatesApi.getAll()
      console.log('Loaded templates:', data)
      console.log('Templates type:', typeof data)
      console.log('Is array:', Array.isArray(data))
      setTemplates(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load templates:', error)
      alert(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingTemplate(null)
    setFormData({
      name: '',
      subject: '',
      content: '',
      isDefault: false,
    })
    setShowModal(true)
  }

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      isDefault: template.isDefault,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('emailTemplates.deleteConfirm'))) return
    try {
      await emailTemplatesApi.delete(id)
      alert(t('emailTemplates.deleteSuccess'))
      loadTemplates()
    } catch (error) {
      console.error('Failed to delete template:', error)
      alert(t('emailTemplates.deleteFailed'))
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await emailTemplatesApi.setDefault(id)
      alert(t('emailTemplates.setDefaultSuccess'))
      loadTemplates()
    } catch (error) {
      console.error('Failed to set default template:', error)
      alert(t('emailTemplates.setDefaultFailed'))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingTemplate) {
        await emailTemplatesApi.update(editingTemplate.id, formData)
        alert(t('emailTemplates.updateSuccess'))
      } else {
        await emailTemplatesApi.create(formData)
        alert(t('emailTemplates.createSuccess'))
      }
      setShowModal(false)
      loadTemplates()
    } catch (error) {
      console.error('Failed to save template:', error)
      alert(editingTemplate ? t('emailTemplates.updateFailed') : t('emailTemplates.createFailed'))
    }
  }

  const handleInitDefaults = async () => {
    try {
      await emailTemplatesApi.initDefaults()
      alert(t('emailTemplates.initDefaultsSuccess'))
      loadTemplates()
    } catch (error: any) {
      console.error('Failed to initialize defaults:', error)
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t('emailTemplates.initDefaultsFailed')
      alert(errorMessage)
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString()
  }

  if (loading && templates.length === 0) {
    return <Loading />
  }

  return (
    <main className="px-4 sm:px-6 md:px-10 py-8 flex flex-col gap-8">
      {/* Page Heading */}
      <div className="flex flex-wrap justify-between gap-3">
        <div className="flex min-w-72 flex-col gap-2">
          <p className="text-text-light text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
            {t('emailTemplates.title')}
          </p>
          <p className="text-text-secondary-light text-base font-normal leading-normal">
            {t('emailTemplates.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          {templates.length === 0 && (
            <button
              onClick={handleInitDefaults}
              className="px-4 py-2 rounded-lg bg-hover-light text-text-light text-sm font-medium hover:bg-hover-light/80 transition-all"
            >
              {t('emailTemplates.initDefaults')}
            </button>
          )}
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all"
          >
            {t('emailTemplates.create')}
          </button>
        </div>
      </div>

      {/* Templates List */}
      <div className="bg-card-light rounded-xl shadow-sm overflow-hidden">
        {templates.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-text-secondary-light text-base mb-4">
              {t('emailTemplates.noTemplates')}
            </p>
            <button
              onClick={handleInitDefaults}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all"
            >
              {t('emailTemplates.initDefaults')}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-hover-light/50 border-b border-border-light">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary-light uppercase tracking-wider">
                    {t('emailTemplates.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary-light uppercase tracking-wider">
                    {t('emailTemplates.subject')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary-light uppercase tracking-wider">
                    {t('emailTemplates.inUse')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary-light uppercase tracking-wider">
                    {t('emailTemplates.updatedAt')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary-light uppercase tracking-wider">
                    {t('emailTemplates.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-hover-light/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text-light">
                        {template.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-secondary-light max-w-md truncate">
                        {template.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {template.isDefault ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          <span className="size-1.5 rounded-full bg-primary"></span>
                          {t('emailTemplates.inUse')}
                        </span>
                      ) : (
                        <span className="text-xs text-text-secondary-light">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">
                      {formatDate(template.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {!template.isDefault && (
                          <button
                            onClick={() => handleSetDefault(template.id)}
                            className="text-primary hover:text-primary/80"
                          >
                            {t('emailTemplates.setDefault')}
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(template)}
                          className="text-primary hover:text-primary/80"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="text-error hover:text-error/80"
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-light rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border-light">
              <h2 className="text-xl font-bold text-text-light">
                {editingTemplate ? t('emailTemplates.edit') : t('emailTemplates.create')}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-light mb-2">
                  {t('emailTemplates.name')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('emailTemplates.namePlaceholder')}
                  className="w-full px-4 py-2 border border-border-light rounded-lg bg-card-light text-text-light focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-light mb-2">
                  {t('emailTemplates.subject')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder={t('emailTemplates.subjectPlaceholder')}
                  className="w-full px-4 py-2 border border-border-light rounded-lg bg-card-light text-text-light focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-light mb-2">
                  {t('emailTemplates.content')}
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={t('emailTemplates.contentPlaceholder')}
                  rows={12}
                  className="w-full px-4 py-2 border border-border-light rounded-lg bg-card-light text-text-light focus:ring-2 focus:ring-primary/50 focus:outline-none font-mono text-sm"
                />
                <div className="mt-2 p-3 bg-hover-light/30 rounded-lg">
                  <p className="text-xs font-medium text-text-secondary-light mb-1">
                    {t('emailTemplates.variables')}:
                  </p>
                  <ul className="text-xs text-text-secondary-light space-y-1">
                    <li>{t('emailTemplates.variables.companyName')}</li>
                    <li>{t('emailTemplates.variables.keywords')}</li>
                    <li>{t('emailTemplates.variables.email')}</li>
                    <li>{t('emailTemplates.variables.phone')}</li>
                    <li>{t('emailTemplates.variables.website')}</li>
                    <li>{t('emailTemplates.variables.country')}</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-primary border-border-light rounded focus:ring-primary"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-text-light">
                  {t('emailTemplates.isDefault')}
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-border-light">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-hover-light text-text-light text-sm font-medium hover:bg-hover-light/80 transition-all"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}



