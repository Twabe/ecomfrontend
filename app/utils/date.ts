/**
 * Date utilities for date range filtering
 */

export type DatePreset =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'last_year'
  | 'custom'

export interface DateRange {
  from: Date | null
  to: Date | null
}

/**
 * Get date range from preset
 */
export function getDateRangeFromPreset(preset: DatePreset): DateRange {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)

  switch (preset) {
    case 'today':
      return { from: today, to: endOfToday }

    case 'yesterday': {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const endOfYesterday = new Date(yesterday)
      endOfYesterday.setHours(23, 59, 59, 999)
      return { from: yesterday, to: endOfYesterday }
    }

    case 'this_week': {
      const weekStart = new Date(today)
      // Get Monday of current week (getDay() returns 0 for Sunday)
      const day = weekStart.getDay()
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1)
      weekStart.setDate(diff)
      return { from: weekStart, to: endOfToday }
    }

    case 'last_week': {
      const lastWeekEnd = new Date(today)
      const day = lastWeekEnd.getDay()
      const diff = lastWeekEnd.getDate() - day + (day === 0 ? -6 : 1) - 1
      lastWeekEnd.setDate(diff)
      lastWeekEnd.setHours(23, 59, 59, 999)

      const lastWeekStart = new Date(lastWeekEnd)
      lastWeekStart.setDate(lastWeekStart.getDate() - 6)
      lastWeekStart.setHours(0, 0, 0, 0)

      return { from: lastWeekStart, to: lastWeekEnd }
    }

    case 'this_month': {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      return { from: monthStart, to: endOfToday }
    }

    case 'last_month': {
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999)
      return { from: lastMonthStart, to: lastMonthEnd }
    }

    case 'this_year': {
      const yearStart = new Date(today.getFullYear(), 0, 1)
      return { from: yearStart, to: endOfToday }
    }

    case 'last_year': {
      const lastYearStart = new Date(today.getFullYear() - 1, 0, 1)
      const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31, 23, 59, 59, 999)
      return { from: lastYearStart, to: lastYearEnd }
    }

    case 'custom':
    default:
      return { from: null, to: null }
  }
}

/**
 * Format date for API (ISO string)
 */
export function formatDateForApi(date: Date | null): string | undefined {
  if (!date) return undefined
  return date.toISOString()
}

/**
 * Parse date from API or URL
 */
export function parseDateFromString(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Format date for input[type="date"] (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | null): string {
  if (!date) return ''
  return date.toISOString().split('T')[0]
}

/**
 * Get preset from date range (for URL sync)
 */
export function getPresetFromDateRange(range: DateRange): DatePreset | null {
  if (!range.from || !range.to) return null

  const presets: DatePreset[] = [
    'today',
    'yesterday',
    'this_week',
    'last_week',
    'this_month',
    'last_month',
    'this_year',
    'last_year',
  ]

  for (const preset of presets) {
    const presetRange = getDateRangeFromPreset(preset)
    if (
      presetRange.from &&
      presetRange.to &&
      isSameDay(range.from, presetRange.from) &&
      isSameDay(range.to, presetRange.to)
    ) {
      return preset
    }
  }

  return 'custom'
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Format date range for display
 */
export function formatDateRangeDisplay(range: DateRange, locale: string = 'fr-FR'): string {
  if (!range.from && !range.to) return ''

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }

  if (range.from && range.to) {
    if (isSameDay(range.from, range.to)) {
      return range.from.toLocaleDateString(locale, options)
    }
    return `${range.from.toLocaleDateString(locale, options)} - ${range.to.toLocaleDateString(locale, options)}`
  }

  if (range.from) {
    return `${range.from.toLocaleDateString(locale, options)} -`
  }

  if (range.to) {
    return `- ${range.to.toLocaleDateString(locale, options)}`
  }

  return ''
}
