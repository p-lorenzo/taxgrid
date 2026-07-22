<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'banner' | 'compact'
}>(), {
  variant: 'banner'
})
</script>

<template>
  <aside
    v-if="variant === 'banner'"
    class="print:hidden max-w-3xl mx-auto mt-8 rounded-2xl border border-[#e2af0d]/35 bg-gradient-to-r from-[#fff9df] to-white px-5 py-4 shadow-sm dark:from-[#2f2711] dark:to-gray-800 dark:border-[#e2af0d]/30"
    aria-label="Sostieni TaxGrid"
  >
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
      <div>
        <p class="font-semibold text-gray-900 dark:text-[#fff4c2]">TaxGrid ti è stato utile?</p>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Aiutami a mantenerlo gratuito, indipendente e aggiornato.
        </p>
      </div>
      <a
        data-testid="kofi-support"
        href="https://ko-fi.com/lorenzopesce"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl bg-[#e2af0d] px-4 py-2.5 text-sm font-bold text-gray-950 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f0be19] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#e2af0d] focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      >
        <span aria-hidden="true">☕</span>
        Offrimi un caffè
      </a>
    </div>
  </aside>

  <div
    v-else
    class="print:hidden mt-4 rounded-xl bg-[#fff9df] px-4 py-3 text-center text-sm text-gray-700 dark:bg-[#2f2711] dark:text-gray-300"
  >
    Ti è stato utile questo dettaglio?
    <a
      data-testid="kofi-support"
      href="https://ko-fi.com/lorenzopesce"
      target="_blank"
      rel="noopener noreferrer"
      class="ml-1 inline-flex items-center gap-1 font-semibold text-amber-800 underline decoration-amber-500/50 underline-offset-2 hover:text-amber-950 dark:text-[#f3cf55] dark:hover:text-[#ffe98c]"
    >
      <span aria-hidden="true">☕</span>
      Sostieni TaxGrid su Ko-fi
    </a>
  </div>
</template>
