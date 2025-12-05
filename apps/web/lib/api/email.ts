import { apiClient } from './client'
import { SendEmailDto, BatchSendEmailDto } from '@company-search/types'

export const emailApi = {
  send: async (data: SendEmailDto): Promise<void> => {
    await apiClient.instance.post('/email/send', data)
  },

  batchSend: async (data: BatchSendEmailDto): Promise<any> => {
    const response = await apiClient.instance.post('/email/batch-send', data)
    return response.data.data
  },
}

