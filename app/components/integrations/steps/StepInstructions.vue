<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ $t('integrations.wizard.instructions', { platform: platformName }) }}
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
        {{ $t('integrations.wizard.instructionsDesc') }}
      </p>
    </div>

    <!-- Steps -->
    <div class="space-y-4">
      <div
        v-for="(instruction, index) in instructions"
        :key="index"
        class="flex gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
      >
        <!-- Step Number -->
        <div class="flex-shrink-0">
          <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <span class="text-sm font-bold text-primary-600 dark:text-primary-400">
              {{ index + 1 }}
            </span>
          </div>
        </div>

        <!-- Step Content -->
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
            {{ $t(instruction.title) }}
          </h4>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {{ $t(instruction.description) }}
          </p>

          <!-- Link Button -->
          <a
            v-if="instruction.link"
            :href="instruction.link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 mt-3 px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
          >
            <ArrowTopRightOnSquareIcon class="w-4 h-4" />
            {{ instruction.link.label }}
          </a>

          <!-- Instruction Image -->
          <div v-if="instruction.image" class="mt-3">
            <img
              :src="instruction.image"
              :alt="$t(instruction.title)"
              class="rounded-lg border border-gray-200 dark:border-gray-700 max-w-full"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Open Platform Button -->
    <div class="flex justify-center pt-4">
      <a
        v-if="adminUrl"
        :href="adminUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <ArrowTopRightOnSquareIcon class="w-5 h-5" />
        {{ $t('integrations.wizard.openSettings', { platform: platformName }) }}
      </a>
    </div>

    <!-- Video Tutorial -->
    <div v-if="videoUrl" class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div class="flex items-center gap-3">
        <PlayCircleIcon class="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div class="flex-1">
          <h4 class="text-sm font-medium text-blue-800 dark:text-blue-200">
            {{ $t('integrations.wizard.videoTutorial') }}
          </h4>
          <p class="text-sm text-blue-700 dark:text-blue-300">
            {{ $t('integrations.wizard.videoTutorialDesc') }}
          </p>
        </div>
        <a
          :href="videoUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {{ $t('integrations.wizard.watchVideo') }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowTopRightOnSquareIcon,
  PlayCircleIcon
} from '@heroicons/vue/24/outline'
import type { PlatformInstruction } from '~/composables/usePlatformConfig'

defineProps<{
  platformName: string
  instructions: PlatformInstruction[]
  adminUrl?: string
  videoUrl?: string
}>()
</script>
