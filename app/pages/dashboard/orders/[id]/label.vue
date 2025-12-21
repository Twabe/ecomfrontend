<script setup lang="ts">
/**
 * Professional Shipping Label Page
 *
 * A6 format (105mm x 148mm) - Standard shipping label size
 * Opens in new window for clean printing
 */
import { useOrdersWorkflowService } from '~/services'

definePageMeta({
  layout: false,
  middleware: ['auth']
})

const route = useRoute()
const orderId = computed(() => route.params.id as string)

// Fetch order
const { useOrder } = useOrdersWorkflowService()
const { data: order, isLoading, error } = useOrder(orderId)

// Format currency
const formatCurrency = (amount?: number | null) => {
  if (amount === undefined || amount === null) return '-'
  return new Intl.NumberFormat('fr-MA', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount) + ' DH'
}

// Format date
const formatDate = (date?: string | null) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date))
}

// Total quantity
const totalQuantity = computed(() => {
  if (!order.value?.items) return 0
  return order.value.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
})

// Auto print when loaded
onMounted(() => {
  const unwatch = watch(isLoading, (loading) => {
    if (!loading && order.value) {
      nextTick(() => {
        setTimeout(() => {
          window.print()
        }, 300)
      })
      unwatch()
    }
  }, { immediate: true })
})
</script>

<template>
  <div class="label-page">
    <!-- Loading -->
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Chargement...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error">
      <p>Erreur de chargement</p>
      <button onclick="history.back()">Retour</button>
    </div>

    <!-- Label -->
    <div v-else-if="order" class="label">
      <!-- Header -->
      <div class="label-header">
        <div class="company-name">E-COMMERCE</div>
        <div class="order-date">{{ formatDate(order.createdOn) }}</div>
      </div>

      <!-- Order Code -->
      <div class="order-code">
        <div class="code-label">N° Commande</div>
        <div class="code-value">{{ order.code }}</div>
      </div>

      <!-- Barcode -->
      <div class="barcode">
        <svg class="barcode-svg" viewBox="0 0 200 40">
          <rect v-for="i in 40" :key="i" :x="i * 5" y="0" :width="i % 3 === 0 ? 3 : 1" height="35" fill="black"/>
        </svg>
        <div class="barcode-text">{{ order.code }}</div>
      </div>

      <!-- Recipient -->
      <div class="recipient-section">
        <div class="section-title">DESTINATAIRE</div>
        <div class="recipient-info">
          <div class="recipient-name">{{ order.fullName }}</div>
          <div class="recipient-phone">
            <span class="phone-icon">TEL:</span>
            <span class="phone-number">{{ order.phone }}</span>
          </div>
          <div class="recipient-city">{{ order.cityName || '-' }}</div>
          <div class="recipient-address">{{ order.address || '-' }}</div>
        </div>
      </div>

      <!-- Products -->
      <div class="products-section">
        <div class="section-title">CONTENU</div>
        <div class="products-list">
          <template v-if="order.items && order.items.length > 0">
            <div v-for="item in order.items" :key="item.id" class="product-item">
              <span class="product-name">{{ item.productName }}</span>
              <span class="product-qty">x{{ item.quantity }}</span>
            </div>
          </template>
          <div v-else class="product-item">
            <span class="product-name">-</span>
          </div>
        </div>
        <div class="products-total">Total articles: {{ totalQuantity }}</div>
      </div>

      <!-- COD Amount -->
      <div class="cod-section">
        <div class="cod-label">MONTANT À COLLECTER (COD)</div>
        <div class="cod-amount">{{ formatCurrency(order.price) }}</div>
      </div>

      <!-- Notes -->
      <div v-if="order.note" class="notes-section">
        <div class="section-title">NOTE</div>
        <div class="note-text">{{ order.note }}</div>
      </div>

      <!-- Footer -->
      <div class="label-footer">
        <div v-if="order.deliveryCompanyName">{{ order.deliveryCompanyName }}</div>
        <div v-if="order.storeName">Magasin: {{ order.storeName }}</div>
      </div>
    </div>

    <!-- Print Actions -->
    <div class="print-actions">
      <button onclick="window.print()" class="print-btn">Imprimer</button>
      <button onclick="history.back()" class="back-btn">Retour</button>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background: #f5f5f5;
}

.label-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e5e5;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Label - A6 Size - Fixed height to fit on one page */
.label {
  width: 105mm;
  height: 148mm;
  max-height: 148mm;
  background: white;
  border: 2px solid #000;
  padding: 3mm;
  display: flex;
  flex-direction: column;
  gap: 2mm;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  overflow: hidden;
}

.label-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1mm;
  border-bottom: 1px solid #000;
  flex-shrink: 0;
}

.company-name {
  font-weight: bold;
  font-size: 12pt;
}

.order-date {
  font-size: 9pt;
  color: #333;
}

.order-code {
  text-align: center;
  padding: 1mm 0;
  border-bottom: 1px dashed #000;
  flex-shrink: 0;
}

.code-label {
  font-size: 8pt;
  text-transform: uppercase;
  color: #666;
  margin-bottom: 1mm;
}

.code-value {
  font-size: 16pt;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.barcode {
  text-align: center;
  padding: 1mm 0;
  flex-shrink: 0;
}

.barcode-svg {
  width: 60mm;
  height: 10mm;
}

.barcode-text {
  font-size: 8pt;
  font-family: 'Courier New', monospace;
  margin-top: 1mm;
}

.section-title {
  font-size: 8pt;
  font-weight: bold;
  text-transform: uppercase;
  background: #000;
  color: #fff;
  padding: 1mm 2mm;
  margin-bottom: 2mm;
}

.recipient-section {
  border: 1px solid #000;
  padding: 2mm;
  flex-shrink: 0;
}

.recipient-info {
  padding: 1mm;
}

.recipient-name {
  font-size: 12pt;
  font-weight: bold;
  margin-bottom: 1mm;
}

.recipient-phone {
  font-size: 14pt;
  font-weight: bold;
  margin-bottom: 2mm;
  display: flex;
  align-items: center;
  gap: 2mm;
}

.phone-icon {
  font-size: 9pt;
  font-weight: normal;
}

.phone-number {
  font-family: 'Courier New', monospace;
}

.recipient-city {
  font-size: 11pt;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 1mm;
}

.recipient-address {
  font-size: 9pt;
  color: #333;
  line-height: 1.3;
}

.products-section {
  border: 1px solid #000;
  padding: 2mm;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.products-list {
  padding: 1mm;
}

.product-item {
  display: flex;
  justify-content: space-between;
  font-size: 9pt;
  padding: 0.5mm 0;
  border-bottom: 1px dotted #ccc;
}

.product-item:last-child {
  border-bottom: none;
}

.product-qty {
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.products-total {
  font-size: 8pt;
  text-align: right;
  margin-top: 1mm;
  font-weight: bold;
}

.cod-section {
  background: #000;
  color: #fff;
  padding: 2mm;
  text-align: center;
  flex-shrink: 0;
}

.cod-label {
  font-size: 8pt;
  text-transform: uppercase;
  margin-bottom: 1mm;
}

.cod-amount {
  font-size: 18pt;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.notes-section {
  border: 1px solid #000;
  padding: 2mm;
}

.note-text {
  font-size: 8pt;
  color: #333;
  font-style: italic;
  padding: 1mm;
}

.label-footer {
  margin-top: auto;
  padding-top: 1mm;
  border-top: 1px solid #000;
  display: flex;
  justify-content: space-between;
  font-size: 7pt;
  color: #666;
  flex-shrink: 0;
}

.print-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.print-btn, .back-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.print-btn {
  background: #4f46e5;
  color: white;
}

.back-btn {
  background: #e5e5e5;
  color: #333;
}

/* Print Styles */
@media print {
  @page {
    size: 105mm 148mm;
    margin: 0;
  }

  html, body {
    width: 105mm;
    height: 148mm;
    margin: 0;
    padding: 0;
    background: white;
    overflow: hidden;
  }

  .label-page {
    padding: 0;
    min-height: auto;
    width: 105mm;
    height: 148mm;
    overflow: hidden;
  }

  .label {
    width: 105mm;
    height: 148mm;
    max-height: 148mm;
    border: none;
    box-shadow: none;
    margin: 0;
    padding: 3mm;
    overflow: hidden;
    page-break-inside: avoid;
    page-break-after: avoid;
  }

  .print-actions,
  .loading,
  .error {
    display: none !important;
  }
}
</style>
