/**
 * SMS Templates Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  smsTemplatesSearch,
  useSmsTemplatesCreate,
  useSmsTemplatesUpdate,
  useSmsTemplatesDelete,
} from '~/api/generated/endpoints/sms-templates/sms-templates'
import type {
  SmsTemplateDto,
  SearchSmsTemplatesRequest,
  CreateSmsTemplateRequest,
  UpdateSmsTemplateRequest,
} from '~/api/generated/models'

export const useSmsTemplatesService = createEntityService<
  SmsTemplateDto,
  SearchSmsTemplatesRequest,
  CreateSmsTemplateRequest,
  UpdateSmsTemplateRequest
>({
  entityName: 'smsTemplates',
  searchFn: smsTemplatesSearch,
  useCreate: useSmsTemplatesCreate,
  useUpdate: useSmsTemplatesUpdate,
  useDelete: useSmsTemplatesDelete,
  staleTime: 60 * 1000, // Templates - longer stale time
})

export type { SmsTemplateDto, CreateSmsTemplateRequest, UpdateSmsTemplateRequest }
