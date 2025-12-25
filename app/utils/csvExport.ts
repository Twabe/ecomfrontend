/**
 * CSV Export Utility
 * Provides functions to export data to CSV format with proper formatting
 */

export interface CsvColumn<T> {
  key: keyof T | string
  label: string
  formatter?: (value: any, item: T) => string
}

/**
 * Escape CSV value to handle commas, quotes, and newlines
 */
function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)

  // Check if value needs escaping (contains comma, quote, or newline)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
    // Escape quotes by doubling them and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Get nested property value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

/**
 * Export data to CSV and trigger download
 */
export function exportToCsv<T extends Record<string, any>>(
  data: T[],
  columns: CsvColumn<T>[],
  filename: string
): void {
  if (data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Build headers row
  const headers = columns.map(col => escapeCsvValue(col.label)).join(',')

  // Build data rows
  const rows = data.map(item => {
    return columns
      .map(col => {
        const rawValue = typeof col.key === 'string' && col.key.includes('.')
          ? getNestedValue(item, col.key as string)
          : item[col.key as keyof T]

        const value = col.formatter
          ? col.formatter(rawValue, item)
          : rawValue

        return escapeCsvValue(value)
      })
      .join(',')
  })

  // Combine headers and rows
  const csvContent = [headers, ...rows].join('\r\n')

  // Add BOM for Excel UTF-8 compatibility
  const bom = '\uFEFF'
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })

  // Create download link and trigger
  downloadBlob(blob, `${filename}.csv`)
}

/**
 * Download blob as file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

/**
 * Format date for CSV export
 */
export function formatDateForCsv(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''

  return d.toLocaleDateString('fr-MA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * Format currency for CSV export
 */
export function formatCurrencyForCsv(amount: number | null | undefined, currency: string = 'MAD'): string {
  if (amount === null || amount === undefined) return ''
  return `${amount.toFixed(2)} ${currency}`
}

/**
 * Format number for CSV export
 */
export function formatNumberForCsv(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined) return ''
  return value.toFixed(decimals)
}

/**
 * Common column definitions for reuse
 */
export const commonCsvFormatters = {
  date: (value: string | Date | null) => formatDateForCsv(value),
  currency: (value: number | null) => formatCurrencyForCsv(value),
  number: (value: number | null) => formatNumberForCsv(value),
  boolean: (value: boolean | null) => value === null ? '' : value ? 'Yes' : 'No',
  percentage: (value: number | null) => value === null || value === undefined ? '' : `${value.toFixed(2)}%`,
}
