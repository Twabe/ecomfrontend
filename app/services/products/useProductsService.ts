/**
 * Products Service
 */

import { createEntityService } from '../_base/createEntityService'
import {
  productsSearch,
  useProductsCreate,
  useProductsUpdate,
  useProductsDelete,
} from '~/api/generated/endpoints/products/products'
import type {
  ProductDto,
  SearchProductsRequest,
  CreateProductRequest,
  UpdateProductRequest,
} from '~/api/generated/models'

export const useProductsService = createEntityService<
  ProductDto,
  SearchProductsRequest,
  CreateProductRequest,
  UpdateProductRequest
>({
  entityName: 'products',
  searchFn: productsSearch,
  useCreate: useProductsCreate,
  useUpdate: useProductsUpdate,
  useDelete: useProductsDelete,
  staleTime: 30 * 1000,
})

export type { ProductDto, CreateProductRequest, UpdateProductRequest }
