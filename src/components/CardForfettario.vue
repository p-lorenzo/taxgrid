<script setup lang="ts">
import { useTaxStore } from '../store/taxStore'
import { Switch } from '@headlessui/vue'
import InfoTooltip from './InfoTooltip.vue'

const store = useTaxStore()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val)
}

defineEmits<{
  (e: 'open-breakdown', regime: 'forfettario'): void
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
        <h3 class="text-xl font-bold text-blue-800 dark:text-blue-300">Regime Forfettario</h3>
      </div>
    </div>
    
    <div class="p-6 flex-grow flex flex-col">
      <!-- Warning Banner -->
      <div v-if="store.advancedMode && store.hasLavoroDipendente && store.ralDipendente > 35000" class="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300 leading-relaxed font-medium">
        <svg class="w-4 h-4 shrink-0 mt-0.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <span>Attenzione: con redditi da lavoro dipendente &gt; 35.000€ non è consentito aderire al Regime Forfettario.</span>
      </div>

      <div class="mb-6 space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Aliquota Startup (5%)</span>
          <Switch
            v-model="store.forfettarioStartup"
            :class="store.forfettarioStartup ? 'bg-[#e2af0d]' : 'bg-gray-200 dark:bg-gray-600'"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2af0d] focus:ring-offset-2 dark:focus:ring-offset-gray-800 print:hidden"
          >
            <span class="sr-only">Toggle Startup</span>
            <span
              :class="store.forfettarioStartup ? 'translate-x-6' : 'translate-x-1'"
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            />
          </Switch>
          <span class="hidden print:inline-block text-sm font-bold text-gray-900">
            {{ store.forfettarioStartup ? 'Sì' : 'No' }}
          </span>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
            Cassa Previdenziale
            <InfoTooltip text="Gestione Separata: contributi calcolati in percentuale senza minimale fisso. Artigiani/Commercianti: contributi fissi minimi + quota percentuale." />
          </label>
          <select v-model="store.forfettarioCassa" class="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg shadow-sm focus:ring-[#e2af0d] focus:border-[#e2af0d] sm:text-sm print:hidden">
            <option value="gestione_separata">Gestione Separata (Pro)</option>
            <option value="artigiani">Artigiani e Commercianti</option>
          </select>
          <div class="hidden print:block text-sm font-bold text-gray-900 py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-lg">
            {{ store.forfettarioCassa === 'gestione_separata' ? 'Gestione Separata (Pro)' : 'Artigiani e Commercianti' }}
          </div>
        </div>

        <!-- INPS Reductions (Artigiani only) -->
        <div v-if="store.forfettarioCassa === 'artigiani'" class="flex flex-col gap-3 pt-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              Riduzione INPS 35%
              <InfoTooltip text="Esclusiva per Regime Forfettario (Artigiani/Commercianti). Riduce del 35% tutti i contributi dovuti. Riduce proporzionalmente l'anzianità pensionistica." />
            </span>
            <Switch
              v-model="store.forfettarioRiduzione35"
              :class="store.forfettarioRiduzione35 ? 'bg-[#e2af0d]' : 'bg-gray-200 dark:bg-gray-600'"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2af0d] focus:ring-offset-2 dark:focus:ring-offset-gray-800 print:hidden"
            >
              <span class="sr-only">Toggle Riduzione 35%</span>
              <span
                :class="store.forfettarioRiduzione35 ? 'translate-x-6' : 'translate-x-1'"
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              />
            </Switch>
            <span class="hidden print:inline-block text-sm font-bold text-gray-900">
              {{ store.forfettarioRiduzione35 ? 'Sì' : 'No' }}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              Riduzione INPS 50%
              <InfoTooltip text="Applicabile ai pensionati Over 65 INPS o a specifici neo-iscritti. Incompatibile con la riduzione del 35%." />
            </span>
            <Switch
              v-model="store.forfettarioRiduzione50"
              :class="store.forfettarioRiduzione50 ? 'bg-[#e2af0d]' : 'bg-gray-200 dark:bg-gray-600'"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2af0d] focus:ring-offset-2 dark:focus:ring-offset-gray-800 print:hidden"
            >
              <span class="sr-only">Toggle Riduzione 50%</span>
              <span
                :class="store.forfettarioRiduzione50 ? 'translate-x-6' : 'translate-x-1'"
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              />
            </Switch>
            <span class="hidden print:inline-block text-sm font-bold text-gray-900">
              {{ store.forfettarioRiduzione50 ? 'Sì' : 'No' }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-auto space-y-3 pt-6 border-t border-gray-100 dark:border-gray-700">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500 dark:text-gray-400">INPS Stimato</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ formatCurrency(store.forfettarioResult.inps) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500 dark:text-gray-400">Imposte (Sostitutiva)</span>
          <span class="font-medium text-red-500">{{ formatCurrency(store.forfettarioResult.tasse) }}</span>
        </div>
        <div class="flex justify-between items-center pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
          <span class="text-base font-semibold text-gray-900 dark:text-white">Netto in Tasca</span>
          <span class="text-2xl font-bold text-[#e2af0d]">{{ formatCurrency(store.forfettarioResult.netto) }}</span>
        </div>
        <div class="flex justify-between items-center pt-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Paragone Mensile (su {{ store.mesiParagone }} mensilità)</span>
          <span class="font-semibold text-gray-900 dark:text-white">{{ formatCurrency(store.forfettarioResult.nettoMensile) }}</span>
        </div>
        <button 
          @click="$emit('open-breakdown', 'forfettario')"
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
