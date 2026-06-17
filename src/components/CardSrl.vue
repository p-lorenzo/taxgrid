<script setup lang="ts">
import { useTaxStore } from '../store/taxStore'
import { Switch } from '@headlessui/vue'

const store = useTaxStore()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val)
}

defineEmits<{
  (e: 'open-breakdown', regime: 'srl'): void
}>()
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-lg duration-300 print:break-inside-avoid h-full">
    <!-- Header -->
    <div class="bg-blue-50 dark:bg-blue-950/30 px-6 py-4 border-b border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
      <div class="flex items-center">
        <!-- Drag Handle Icon -->
        <div class="drag-handle cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors mr-2.5 print:hidden">
          <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 2a2 2 0 100 4 2 2 0 000-4zM7 8a2 2 0 100 4 2 2 0 000-4zM7 14a2 2 0 100 4 2 2 0 000-4zM13 2a2 2 0 100 4 2 2 0 000-4zM13 8a2 2 0 100 4 2 2 0 000-4zM13 14a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-blue-800 dark:text-blue-300">S.R.L.</h3>
      </div>
    </div>
    
    <div class="p-6 flex-grow flex flex-col">
      <div class="mb-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Strategia Distribuzione</label>
          <select v-model="store.srlDistribuzione" class="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg shadow-sm focus:ring-[#e2af0d] focus:border-[#e2af0d] sm:text-sm print:hidden">
            <option value="compenso">Tutto Compenso Amministratore</option>
            <option value="utili">Distribuzione Utili (IRES+IRAP+26%)</option>
          </select>
          <div class="hidden print:block text-sm font-bold text-gray-900 py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-lg">
            {{ store.srlDistribuzione === 'compenso' ? 'Tutto Compenso Amministratore' : 'Distribuzione Utili (IRES+IRAP+26%)' }}
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cassa Previdenziale</label>
          <select v-model="store.srlCassa" class="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg shadow-sm focus:ring-[#e2af0d] focus:border-[#e2af0d] sm:text-sm print:hidden">
            <option value="gestione_separata">Gestione Separata (Pro)</option>
            <option value="artigiani">Artigiani e Commercianti</option>
          </select>
          <div class="hidden print:block text-sm font-bold text-gray-900 py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-lg">
            {{ store.srlCassa === 'gestione_separata' ? 'Gestione Separata (Pro)' : 'Artigiani e Commercianti' }}
          </div>
        </div>

        <!-- INPS Reductions (Artigiani only) -->
        <div v-if="store.srlCassa === 'artigiani'" class="flex flex-col gap-3 pt-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              Riduzione INPS 50%
              <div class="relative group inline-block ml-1.5 cursor-pointer align-middle text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 print:hidden">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none leading-relaxed normal-case font-normal">
                  Applicabile ai pensionati Over 65 (già titolari di pensione INPS) o a specifici neo-iscritti alla gestione Artigiani/Commercianti.
                  <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </span>
            <Switch
              v-model="store.srlRiduzione50"
              :class="store.srlRiduzione50 ? 'bg-[#e2af0d]' : 'bg-gray-200 dark:bg-gray-600'"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2af0d] focus:ring-offset-2 dark:focus:ring-offset-gray-800 print:hidden"
            >
              <span class="sr-only">Toggle Riduzione 50%</span>
              <span
                :class="store.srlRiduzione50 ? 'translate-x-6' : 'translate-x-1'"
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              />
            </Switch>
            <span class="hidden print:inline-block text-sm font-bold text-gray-900">
              {{ store.srlRiduzione50 ? 'Sì' : 'No' }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-auto space-y-3 pt-6 border-t border-gray-100 dark:border-gray-700">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500 dark:text-gray-400">INPS (Socio/Amministratore)</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ formatCurrency(store.srlResult.inps) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500 dark:text-gray-400">Imposte (IRES+IRAP/IRPEF)</span>
          <span class="font-medium text-red-500">{{ formatCurrency(store.srlResult.tasse) }}</span>
        </div>
        <div class="flex justify-between items-center pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
          <span class="text-base font-semibold text-gray-900 dark:text-white">Netto in Tasca (Socio)</span>
          <span class="text-2xl font-bold text-[#e2af0d]">{{ formatCurrency(store.srlResult.netto) }}</span>
        </div>
        <div class="flex justify-between items-center pt-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Paragone Mensile (su {{ store.mesiParagone }} mensilità)</span>
          <span class="font-semibold text-gray-900 dark:text-white">{{ formatCurrency(store.srlResult.nettoMensile) }}</span>
        </div>
        <button 
          @click="$emit('open-breakdown', 'srl')"
          class="w-full mt-3 py-2 px-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-xl transition-all duration-200 border border-blue-150/40 dark:border-blue-900/30 cursor-pointer flex items-center justify-center gap-1.5 print:hidden"
        >
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
          Vedi dettaglio calcolo
        </button>
      </div>
    </div>
  </div>
</template>
