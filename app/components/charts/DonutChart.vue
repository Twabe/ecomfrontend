<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

interface Props {
  series: number[]
  labels: string[]
  title?: string
  height?: number
  colors?: string[]
  showLegend?: boolean
  valueFormatter?: (val: number) => string
}

const props = withDefaults(defineProps<Props>(), {
  height: 350,
  colors: () => ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'],
  showLegend: true,
  valueFormatter: (val: number) => val.toLocaleString()
})

// Check if dark mode is active by looking at the HTML class
const isDark = computed(() => {
  if (import.meta.client) {
    return document.documentElement.classList.contains('dark')
  }
  return false
})

const chartOptions = computed<ApexOptions>(() => {
  const options: ApexOptions = {
    chart: {
      type: 'donut',
      height: props.height,
      background: 'transparent',
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    theme: {
      mode: isDark.value ? 'dark' : 'light'
    },
    colors: props.colors,
    labels: props.labels,
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600,
              color: isDark.value ? '#F9FAFB' : '#111827'
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 700,
              color: isDark.value ? '#F9FAFB' : '#111827',
              formatter: props.valueFormatter
            },
            total: {
              show: true,
              label: 'Total',
              color: isDark.value ? '#9CA3AF' : '#6B7280',
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
                return props.valueFormatter(total)
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    legend: {
      show: props.showLegend,
      position: 'bottom',
      horizontalAlign: 'center',
      labels: {
        colors: isDark.value ? '#D1D5DB' : '#374151'
      }
    },
    tooltip: {
      theme: isDark.value ? 'dark' : 'light',
      y: {
        formatter: props.valueFormatter
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: [isDark.value ? '#1F2937' : '#FFFFFF']
    }
  }

  // Only add title if provided (to avoid ApexCharts error)
  if (props.title) {
    options.title = {
      text: props.title,
      align: 'left',
      style: {
        color: isDark.value ? '#F9FAFB' : '#111827',
        fontSize: '16px',
        fontWeight: '600'
      }
    }
  }

  return options
})
</script>

<template>
  <div class="w-full">
    <ClientOnly>
      <apexchart
        type="donut"
        :height="height"
        :options="chartOptions"
        :series="series"
      />
      <template #fallback>
        <div class="flex items-center justify-center" :style="{ height: `${height}px` }">
          <div class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full w-48 h-48 mx-auto" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
