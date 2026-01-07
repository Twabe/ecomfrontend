/**
 * Services Layer - Central Export
 *
 * This file re-exports all domain services for easy importing.
 * Import from '~/services' instead of individual service files.
 *
 * @example
 * ```typescript
 * import { useBrandsService, useCitiesService } from '~/services'
 *
 * const { items: brands, create, update } = useBrandsService()
 * const { items: cities } = useCitiesService()
 * ```
 */

// ============================================
// BASE EXPORTS
// ============================================
export { createEntityService, createReadOnlyService } from './_base/createEntityService'
export { queryKeys, type EntityName, type EntityQueryKeys, type QueryKeyParams } from './_base/queryKeys'
export type {
  BaseSearchParams,
  EntityServiceConfig,
  EntityServiceReturn,
  PaginatedResponse,
  PaginationInfo,
  ReadOnlyEntityServiceReturn,
  UseEntityServiceOptions,
} from './_base/types'

// ============================================
// MASTER DATA SERVICES (No Dependencies)
// ============================================
export { useBrandsService, type BrandDto, type CreateBrandRequest, type UpdateBrandRequest } from './brands/useBrandsService'
export { useCitiesService, type CityDto, type CreateCityRequest, type UpdateCityRequest } from './cities/useCitiesService'
export { useSourcesService, type SourceDto, type CreateSourceRequest, type UpdateSourceRequest } from './sources/useSourcesService'
export { useReasonsService, type ReasonDto, type CreateReasonRequest, type UpdateReasonRequest } from './reasons/useReasonsService'
export { useExtraTagsService, type ExtraTagDto, type CreateExtraTagRequest, type UpdateExtraTagRequest } from './extra-tags/useExtraTagsService'
export { useTrackingStatesService, type TrackingStateDto, type CreateTrackingStateRequest, type UpdateTrackingStateRequest } from './tracking-states/useTrackingStatesService'
export { useExpenseTypesService, type ExpenseTypeDto, type CreateExpenseTypeRequest, type UpdateExpenseTypeRequest } from './expense-types/useExpenseTypesService'
export { useSuppliersService, type SupplierDto, type CreateSupplierRequest, type UpdateSupplierRequest } from './suppliers/useSuppliersService'

// ============================================
// SIMPLE ENTITY SERVICES (1 Dependency)
// ============================================
export { useProductsService, type ProductDto, type CreateProductRequest, type UpdateProductRequest } from './products/useProductsService'
export {
  useProductVariantsService,
  useProductVariantsByProduct,
  type ProductVariantDto,
  type CreateProductVariantRequest,
  type UpdateProductVariantRequest,
} from './product-variants/useProductVariantsService'
export {
  useSkuMappingsService,
  useSkuMappingLookup,
  useSkuMappingsBulkCreate,
  type SkuMappingDto,
  type CreateSkuMappingRequest,
  type UpdateSkuMappingRequest,
  type SkuMappingsLookupParams,
  type SkuMappingLookupResult,
  type BulkCreateSkuMappingsRequest,
  type BulkCreateSkuMappingsResult,
} from './sku-mappings/useSkuMappingsService'
export { useDeliveryCompaniesService, type DeliveryCompanyDto, type CreateDeliveryCompanyRequest, type UpdateDeliveryCompanyRequest } from './delivery-companies/useDeliveryCompaniesService'
export { useStoresService, type StoreDto, type CreateStoreRequest, type UpdateStoreRequest } from './stores/useStoresService'
export { useShippingFeesService, type ShippingFeeDto, type CreateShippingFeeRequest, type UpdateShippingFeeRequest } from './shipping-fees/useShippingFeesService'

// ============================================
// CORE ENTITY SERVICES (2-3 Dependencies)
// ============================================
export { useCustomersService, type CustomerDto, type CreateCustomerRequest, type UpdateCustomerRequest } from './customers/useCustomersService'
export { useStocksService, type StockDto, type SearchStocksRequest, type AdjustStockRequest } from './stocks/useStocksService'
export { useStockTransactionsService, type StockTransactionDto, type SearchStockTransactionsRequest } from './stock-transactions/useStockTransactionsService'
export { usePurchasesService, type PurchaseDto, type CreatePurchaseRequest, type UpdatePurchaseRequest } from './purchases/usePurchasesService'
export { useExpensesService, type ExpenseDto, type CreateExpenseRequest, type UpdateExpenseRequest } from './expenses/useExpensesService'

// ============================================
// COMPLEX AGGREGATE SERVICES (4+ Dependencies)
// ============================================
export {
  useOrdersService,
  useOrdersWorkflowService,
  type OrderDto,
  type CreateOrderRequest,
  type UpdateOrderRequest,
  type ConfirmOrderRequest,
  type ConfirmOrderResponse,
  type CancelOrderWithReasonRequest,
  type CancelOrderWithReasonResponse,
  type ConfirmationOrderDto,
  type GetNewOrdersRequest,
  type OrdersGetConfirmationOrdersParams,
  type AddOrderItemRequest,
  type UpdateOrderItemRequest,
  type RemoveOrderItemRequest,
  type ReadyForDeliveryOrderDto,
  type OrderAssignmentSummaryDto,
  type GetOrdersReadyForDeliveryRequestExtended,
} from './orders/useOrdersService'
export { useInvoicesService, type InvoiceDto, type InvoiceDetailsDto, type UpdateInvoiceRequest, type MarkInvoicePaidRequest } from './invoices/useInvoicesService'
export { useDeliveryNotesService, type DeliveryNoteDto, type CreateDeliveryNoteRequest, type UpdateDeliveryNoteRequest } from './delivery-notes/useDeliveryNotesService'
export { usePaymentsService, type PaymentDto, type CreatePaymentRequest, type UpdatePaymentRequest } from './payments/usePaymentsService'
export { useDropshippingsService, type DropshippingDto, type CreateDropshippingRequest, type UpdateDropshippingRequest } from './dropshippings/useDropshippingsService'
export {
  useLegalInvoicesService,
  useLegalInvoicesGenerateFromOrders,
  useLegalInvoicesFinalize,
  useLegalInvoicesCancel,
  useLegalInvoicesCreateManual,
  type LegalInvoiceDto,
  type CreateLegalInvoiceRequest,
  type UpdateLegalInvoiceRequest,
  type GenerateLegalInvoiceFromOrdersRequest,
  type GenerateLegalInvoiceResponse,
  type LegalInvoiceItemDto,
  type ManualLegalInvoiceItemDto,
  type CreateManualLegalInvoiceRequest,
  type CreateManualLegalInvoiceResponse,
} from './legal-invoices/useLegalInvoicesService'
export { useShipmentsService, type ShipmentDto, type CreateShipmentRequest, type UpdateShipmentRequest } from './shipments/useShipmentsService'

// ============================================
// ORDER MANAGEMENT SERVICES
// ============================================
export { useOrderAssignmentsService, type WorkerAssignmentDto, type SupervisorAssignmentDto, type SupervisorCallbackDto, type AssignOrderRequest, type CompleteAssignmentRequest, type WorkerStatsSummary, type OverallStats, type WorkersStatsResponse } from './order-assignments/useOrderAssignmentsService'
export { useOrderHistoriesService, orderHistoryActionLabels, type OrderHistoryDto, type SearchOrderHistoriesRequest } from './order-histories/useOrderHistoriesService'
export { useOrderCostsService, type OrderCostDto, type CreateOrderCostRequest, type UpdateOrderCostRequest } from './order-costs/useOrderCostsService'
export { useOrderFeesService, type OrderFeeDto, type CreateOrderFeeRequest, type UpdateOrderFeeRequest } from './order-fees/useOrderFeesService'

// ============================================
// MEDIA BUYER SERVICES
// ============================================
export { useMediaBuyerExpensesService, type MediaBuyerExpenseDto, type CreateMediaBuyerExpenseRequest, type UpdateMediaBuyerExpenseRequest } from './media-buyer-expenses/useMediaBuyerExpensesService'
export { useMediaBuyerInvoicesService, type MediaBuyerInvoiceDto, type CreateMediaBuyerInvoiceRequest, type UpdateMediaBuyerInvoiceRequest } from './media-buyer-invoices/useMediaBuyerInvoicesService'
export { useSpentAdsService, type SpentAdDto, type CreateSpentAdRequest, type UpdateSpentAdRequest } from './spent-ads/useSpentAdsService'

// ============================================
// ANALYTICS & REPORTING SERVICES
// ============================================
export { useDashboardService, type StatsDto, type DashboardStatsDto, type DashboardGetOverviewParams } from './dashboard/useDashboardService'
export { useStatisticsService, type StatisticDto, type CreateStatisticRequest, type UpdateStatisticRequest } from './statistics/useStatisticsService'

// ============================================
// CONFIGURATION SERVICES
// ============================================
export { useSettingsService, type TenantSettingsDto, type UpdateTenantSettingsRequest } from './settings/useSettingsService'
export { useAutoAssignmentSettingsService, type AutoAssignmentSettingsDto, type UpdateAutoAssignmentSettingsRequest } from './auto-assignment-settings/useAutoAssignmentSettingsService'
export { useStockSettingsService, type StockSettingsDto, type UpdateStockSettingsRequest } from './stock-settings/useStockSettingsService'
export { useQualityChecklistItemsService, useActiveQualityChecklistItems, type QualityChecklistItemDto, type CreateQualityChecklistItemRequest, type UpdateQualityChecklistItemRequest } from './quality-checklist-items/useQualityChecklistItemsService'
export { useSmsTemplatesService, type SmsTemplateDto, type CreateSmsTemplateRequest, type UpdateSmsTemplateRequest } from './sms-templates/useSmsTemplatesService'
export { useWorkerServiceConfigsService, type WorkerServiceConfigDto, type CreateWorkerConfigRequest, type UpdateWorkerConfigRequest, type SetOnlineStatusRequest } from './worker-service-configs/useWorkerServiceConfigsService'

// ============================================
// INTEGRATION SERVICES
// ============================================
export { useWebhooksService, type WebhookPayload } from './webhooks/useWebhooksService'
export { useDeliveryWebhooksService, type DeliveryWebhookPayload } from './delivery-webhooks/useDeliveryWebhooksService'
export { usePlatformIntegrationsService, type PlatformIntegrationDto, type CreatePlatformIntegrationRequest, type UpdatePlatformIntegrationRequest } from './platform-integrations/usePlatformIntegrationsService'
export { useYouCanIntegrationService, type YouCanIntegrationStatusDto, type YouCanIntegrationConnectParams, type YouCanIntegrationCallbackParams } from './you-can-integration/useYouCanIntegrationService'

// ============================================
// DELIVERY PROVIDER SERVICES
// ============================================
export { useDeliveryProviderTemplatesService, type DeliveryProviderTemplateDto, type TemplateStatsDto, type WebhookHealthReport } from './delivery-provider-templates/useDeliveryProviderTemplatesService'
export {
  useTenantDeliveryConnectionsService,
  type TenantDeliveryConnectionDto,
  type ConnectDeliveryProviderRequest,
  type UpdateDeliveryConnectionRequest,
  type TestConnectionResponse,
  type SyncConnectionResponse,
} from './tenant-delivery-connections/useTenantDeliveryConnectionsService'
export {
  useProviderCitiesService,
  type ProviderCityDto2,
  type CreateProviderCityRequest,
  type UpdateProviderCityRequest,
  type BulkCreateProviderCitiesRequest,
  type BulkCreateResult,
} from './provider-cities/useProviderCitiesService'

// ============================================
// IDENTITY & ACCESS SERVICES
// ============================================
export { useUsersService, type UserDetailsDto, type UserRoleDto, type CreateUserRequest, type UpdateUserRequest, type AdminSetPasswordRequest, type UserRolesRequest } from './users/useUsersService'
export { useRolesService, type RoleDto, type CreateOrUpdateRoleRequest, type UpdateRolePermissionsRequest } from './roles/useRolesService'
export { usePersonalService, type ChangePasswordRequest } from './personal/usePersonalService'
export { useTokensService, type TokenRequest, type RefreshTokenRequest, type TokenResponse } from './tokens/useTokensService'
export { useTenantsService, type TenantDto, type CreateTenantRequest, type UpgradeSubscriptionRequest } from './tenants/useTenantsService'
