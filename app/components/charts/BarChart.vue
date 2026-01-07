<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

interface Props {
  series: { name: string; data: number[] }[]
  categories: string[]
  title?: string
  height?: number
  colors?: string[]
  horizontal?: boolean
  showLegend?: boolean
  stacked?: boolean
  yAxisFormatter?: (val: number) => string
}

const props = withDefaults(defineProps<Props>(), {
  height: 350,
  colors: () => ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'],
  horizontal: false,
  showLegend: true,
  stacked: false,
  yAxisFormatter: (val: number) => val.toLocaleString()
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
      type: 'bar',
      height: props.height,
      stacked: props.stacked,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      },
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
    plotOptions: {
      bar: {
        horizontal: props.horizontal,
        borderRadius: 4,
        columnWidth: '60%',
        barHeight: '70%',
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: props.categories,
      labels: {
        style: {
          colors: isDark.value ? '#9CA3AF' : '#6B7280'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark.value ? '#9CA3AF' : '#6B7280'
        },
        formatter: props.yAxisFormatter
      }
    },
    grid: {
      borderColor: isDark.value ? '#374151' : '#E5E7EB',
      strokeDashArray: 4
    },
    legend: {
      show: props.showLegend,
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: isDark.value ? '#D1D5DB' : '#374151'
      }
    },
    tooltip: {
      theme: isDark.value ? 'dark' : 'light',
      y: {
        formatter: props.yAxisFormatter
      }
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
        type="bar"
        :height="height"
        :options="chartOptions"
        :series="series"
      />
      <template #fallback>
        <div class="flex items-center justify-center" :style="{ height: `${height}px` }">
          <div class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-full h-full" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
