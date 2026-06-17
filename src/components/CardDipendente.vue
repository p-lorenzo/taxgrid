<script setup lang="ts">
import { useTaxStore } from '../store/taxStore'
import InfoTooltip from './InfoTooltip.vue'

const store = useTaxStore()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val)
}

defineEmits<{
  (e: 'open-breakdown', regime: 'dipendente'): void
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
        <h3 class="text-xl font-bold text-blue-800 dark:text-blue-300">Dipendente</h3>
      </div>
    </div>
    
    <div class="p-6 flex-grow flex flex-col">
      <div class="mb-6 space-y-4">
        <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
          <p>
            Il <strong>Fatturato Annuo ({{ formatCurrency(store.fatturato) }})</strong> viene considerato come il
            <strong>Costo Aziendale Totale</strong>. Da qui si ricava la RAL sottraendo i contributi a carico dell'azienda.
          </p>
        </div>

        <div class="flex justify-between text-sm py-1">
          <span class="text-gray-500 dark:text-gray-400 flex items-center">
            RAL Calcolata
            <InfoTooltip text="La Retribuzione Annua Lorda calcolata a partire dal costo aziendale totale, sottraendo i contributi previdenziali a carico dell'azienda." />
          </span>
          <span class="font-medium text-gray-900 dark:text-white">{{ formatCurrency(store.dipendenteResult.ral) }}</span>
        </div>
      </div>

      <div class="mt-auto space-y-3 pt-6 border-t border-gray-100 dark:border-gray-700">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500 dark:text-gray-400">INPS Totale (Dip. + Az.)</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ formatCurrency(store.dipendenteResult.inps) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500 dark:text-gray-400 flex items-center">
            Imposte (IRPEF + Add.)
            <InfoTooltip text="Somma dell'IRPEF nazionale a scaglioni e delle addizionali regionali e comunali dovute sul reddito da lavoro dipendente." />
          </span>
          <span class="font-medium text-red-500">{{ formatCurrency(store.dipendenteResult.tasse) }}</span>
        </div>
        <div class="flex justify-between items-center pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
          <span class="text-base font-semibold text-gray-900 dark:text-white">Netto in Tasca</span>
          <span class="text-2xl font-bold text-[#e2af0d]">{{ formatCurrency(store.dipendenteResult.netto) }}</span>
        </div>
        <div class="flex justify-between items-center pt-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Paragone Mensile (su {{ store.mesiParagone }} mensilità)</span>
          <span class="font-semibold text-gray-900 dark:text-white">{{ formatCurrency(store.dipendenteResult.nettoMensile) }}</span>
        </div>
        <button 
          @click="$emit('open-breakdown', 'dipendente')"
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
