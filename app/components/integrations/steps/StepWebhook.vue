<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <div class="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
        <LinkIcon class="w-8 h-8 text-primary-600 dark:text-primary-400" />
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ $t('integrations.wizard.webhookUrl') }}
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
        {{ $t('integrations.wizard.webhookDesc', { platform: platformName }) }}
      </p>
    </div>

    <!-- Webhook URL Box -->
    <div class="relative">
      <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <div class="flex items-center gap-3">
          <input
            ref="urlInput"
            type="text"
            :value="webhookUrl"
            readonly
            class="flex-1 bg-transparent border-none text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-0 truncate"
          />
          <button
            type="button"
            class="flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all duration-200"
            :class="copied
              ? 'bg-green-500 text-white'
              : 'bg-primary-600 text-white hover:bg-primary-700'"
            @click="copyToClipboard"
          >
            <span v-if="copied" class="flex items-center gap-2">
              <CheckIcon class="w-4 h-4" />
              {{ $t('integrations.wizard.copied') }}
            </span>
            <span v-else class="flex items-center gap-2">
              <ClipboardDocumentIcon class="w-4 h-4" />
              {{ $t('integrations.wizard.copy') }}
            </span>
          </button>
        </div>
      </div>

      <!-- Copy Success Animation -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="showCopyNotification"
          class="absolute -bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg shadow-lg"
        >
          {{ $t('integrations.wizard.urlCopied') }}
        </div>
      </Transition>
    </div>

    <!-- Badge -->
    <div class="flex justify-center">
      <span class="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
        <BoltIcon class="w-4 h-4" />
        Webhook: Order creation
      </span>
    </div>

    <!-- Info Box -->
    <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <div class="flex gap-3">
        <InformationCircleIcon class="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            {{ $t('integrations.wizard.webhookNote') }}
          </h4>
          <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            {{ $t('integrations.wizard.webhookNoteDesc') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  LinkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  BoltIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  webhookUrl: string
  platformName: string
}>()

const urlInput = ref<HTMLInputElement | null>(null)
const copied = ref(false)
const showCopyNotification = ref(false)

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.webhookUrl)
    copied.value = true
    showCopyNotification.value = true

    setTimeout(() => {
      copied.value = false
    }, 2000)

    setTimeout(() => {
      showCopyNotification.value = false
    }, 3000)
  } catch (err) {
    // Fallback for older browsers
    if (urlInput.value) {
      urlInput.value.select()
      document.execCommand('copy')
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    }
  }
}
</script>
