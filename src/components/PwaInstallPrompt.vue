<script setup lang="ts">
import { usePwaInstall } from '../composables/usePwaInstall'

const {
  isIosSafari,
  showPrompt,
  install,
  dismiss
} = usePwaInstall()
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-12 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-12 opacity-0"
  >
    <div
      v-if="showPrompt"
      class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/80 rounded-2xl shadow-2xl p-5 transition-colors duration-300 print:hidden"
    >
      <!-- Close button (X) -->
      <button
        @click="dismiss"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-850 cursor-pointer"
        aria-label="Chiudi"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div class="flex items-start gap-4">
        <!-- App Logo Icon -->
        <div class="shrink-0 w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100/50 dark:border-blue-900/40 flex items-center justify-center p-1">
          <img src="/icon-192.png" alt="TaxGrid Logo" class="w-10 h-10 object-contain rounded-lg" />
        </div>

        <div class="flex-1 min-w-0 pr-6">
          <h4 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            Installa TaxGrid
            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#e2af0d]/10 text-[#e2af0d] dark:text-[#f4be1a] border border-[#e2af0d]/20">
              PWA
            </span>
          </h4>
          
          <!-- Android / Desktop custom instructions -->
          <div v-if="!isIosSafari" class="mt-1">
            <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Accedi istantaneamente e calcola offline aggiungendo l'app alla schermata home.
            </p>
            <div class="mt-4 flex items-center gap-3">
              <button
                @click="install"
                class="px-4 py-2 bg-[#e2af0d] hover:bg-[#c99b0a] text-gray-950 font-bold rounded-xl text-xs transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
              >
                Installa
              </button>
              <button
                @click="dismiss"
                class="px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium text-xs transition-all duration-200 cursor-pointer"
              >
                Annulla
              </button>
            </div>
          </div>

          <!-- iOS Safari custom instructions -->
          <div v-else class="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed space-y-3">
            <p>
              Installa TaxGrid sul tuo iPhone/iPad per usarlo offline e a schermo intero come un'app nativa.
            </p>
            <div class="bg-gray-50 dark:bg-gray-950/50 border border-gray-150/40 dark:border-gray-805/30 rounded-xl p-3 space-y-2 text-[11px]">
              <div class="flex items-center gap-2">
                <span class="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold">1</span>
                <span>Tocca il pulsante <strong>Condividi</strong> nella barra di Safari</span>
                <span class="inline-flex shrink-0 p-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-blue-500">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold">2</span>
                <span>Scorri in basso e seleziona <strong>Aggiungi alla schermata Home</strong></span>
                <span class="inline-flex shrink-0 p-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </div>
            </div>
            <div class="pt-1 flex justify-end">
              <button
                @click="dismiss"
                class="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Ensure high premium transitions */
.bg-gray-850 {
  background-color: rgb(24 32 47 / 0.8);
}
</style>
