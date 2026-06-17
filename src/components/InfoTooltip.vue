<script setup lang="ts">
defineProps<{
  text?: string
}>()
</script>

<template>
  <span
    class="relative group inline-block ml-1.5 align-middle text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 print:hidden font-normal leading-none cursor-pointer focus:outline-none"
    tabindex="0"
    aria-haspopup="true"
  >
    <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span
      class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus:opacity-100 group-focus:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-50 pointer-events-none leading-relaxed normal-case font-normal block"
      role="tooltip"
    >
      <slot>{{ text }}</slot>
      <span class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></span>
    </span>
  </span>
</template>
