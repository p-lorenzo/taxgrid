<script setup lang="ts">
import { useTaxStore } from '../store/taxStore'
import { Switch } from '@headlessui/vue'
import InfoTooltip from './InfoTooltip.vue'

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
        <div>
          <h3 class="text-xl font-bold text-blue-800 dark:text-blue-300">S.R.L.</h3>
          <span class="text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">Stima semplificata</span>
        </div>
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

        <div v-if="store.srlDistribuzione === 'compenso'" class="rounded-lg border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 p-3 text-xs text-blue-800 dark:text-blue-200">
          Il compenso amministratore usa la Gestione Separata 2026 dedicata agli amministratori, distinta da quella dei professionisti.
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Costi amministrativi SRL stimati</label>
          <div class="relative print:hidden">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">€</span>
            <input type="number" v-model="store.srlCostiFissi" class="block w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm" />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            Socio lavoratore operativo
            <InfoTooltip text="Può coesistere con il ruolo di amministratore e comportare una distinta iscrizione Artigiani o Commercianti." />
          </span>
          <Switch v-model="store.srlSocioLavoratore" :class="store.srlSocioLavoratore ? 'bg-[#e2af0d]' : 'bg-gray-200 dark:bg-gray-600'" class="relative inline-flex h-6 w-11 items-center rounded-full print:hidden">
            <span :class="store.srlSocioLavoratore ? 'translate-x-6' : 'translate-x-1'" class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
          </Switch>
        </div>

        <div v-if="store.srlSocioLavoratore" class="space-y-3">
          <select v-model="store.srlSocioCassa" class="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm print:hidden">
            <option value="artigiani">Gestione Artigiani</option>
            <option value="commercianti">Gestione Commercianti</option>
          </select>
          <select v-model="store.srlContributionRelief" class="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm print:hidden">
            <option value="none">Nessuna agevolazione</option>
            <option value="pensioner_50">Pensionato INPS over 65 −50%</option>
            <option value="new_entrant_2025_50">Neo-iscritto nel 2025 −50%</option>
          </select>
        </div>
      </div>

      <div class="mt-auto space-y-3 pt-6 border-t border-gray-100 dark:border-gray-700">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500 dark:text-gray-400">INPS (Socio/Amministratore)</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ formatCurrency(store.srlResult.inps) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500 dark:text-gray-400 flex items-center">
            Imposte (IRES+IRAP/IRPEF)
            <InfoTooltip text="IRES e IRAP sono mostrate separatamente. La base IRAP reale non è modellata: il risultato operativo è usato come proxy semplificata." />
          </span>
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
