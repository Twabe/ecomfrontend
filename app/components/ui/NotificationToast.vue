<script setup lang="ts">
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'

const notificationState = useState('notification', () => ({
  message: '',
  title: '' as string | undefined,
  type: 'info' as 'success' | 'error' | 'warning' | 'info',
  show: false
}))

const icons = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon
}

const colors = {
  success: 'bg-green-50 border-green-500 text-green-800 dark:bg-green-900/50 dark:text-green-200',
  error: 'bg-red-50 border-red-500 text-red-800 dark:bg-red-900/50 dark:text-red-200',
  warning: 'bg-yellow-50 border-yellow-500 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
  info: 'bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
}

const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500'
}

const close = () => {
  notificationState.value.show = false
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="notificationState.show"
        class="fixed bottom-4 right-4 z-[9999] max-w-md"
      >
        <div
          :class="[
            'flex items-start gap-3 rounded-lg border-l-4 p-4 shadow-lg',
            colors[notificationState.type]
          ]"
        >
          <component
            :is="icons[notificationState.type]"
            :class="['h-6 w-6 flex-shrink-0', iconColors[notificationState.type]]"
          />
          <div class="flex-1 min-w-0">
            <p v-if="notificationState.title" class="text-sm font-semibold mb-0.5">
              {{ notificationState.title }}
            </p>
            <p class="text-sm break-words" :class="notificationState.title ? 'opacity-90' : 'font-medium'">
              {{ notificationState.message }}
            </p>
          </div>
          <button
            type="button"
            class="flex-shrink-0 rounded-md p-1 hover:bg-black/10 dark:hover:bg-white/10"
            @click="close"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
