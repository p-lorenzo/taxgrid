<script setup lang="ts">
import { useDarkMode } from '../composables/useDarkMode'

const { theme, setTheme } = useDarkMode()
</script>

<template>
  <div class="flex items-center p-1 bg-gray-100 dark:bg-gray-800/80 backdrop-blur border border-gray-250/30 dark:border-gray-700/50 rounded-xl shadow-inner self-center sm:self-auto transition-colors duration-200">
    <!-- Light Theme Button -->
    <button
      @click="setTheme('light')"
      :class="[
        'p-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 text-xs font-medium focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer',
        theme === 'light'
          ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/30'
      ]"
      title="Tema Chiaro"
      aria-label="Attiva tema chiaro"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m10.607 10.607l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
      </svg>
      <span class="sr-only sm:not-sr-only sm:inline-block">Chiaro</span>
    </button>

    <!-- Dark Theme Button -->
    <button
      @click="setTheme('dark')"
      :class="[
        'p-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 text-xs font-medium focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer',
        theme === 'dark'
          ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/30'
      ]"
      title="Tema Scuro"
      aria-label="Attiva tema scuro"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
      <span class="sr-only sm:not-sr-only sm:inline-block">Scuro</span>
    </button>

    <!-- System Default Button -->
    <button
      @click="setTheme('system')"
      :class="[
        'p-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 text-xs font-medium focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer',
        theme === 'system'
          ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/30'
      ]"
      title="Usa impostazioni di sistema"
      aria-label="Usa tema di sistema"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <span class="sr-only sm:not-sr-only sm:inline-block">Auto</span>
    </button>
  </div>
</template>
