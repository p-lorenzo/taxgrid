<script setup lang="ts">
import { useTaxStore } from './store/taxStore'
import { Switch } from '@headlessui/vue'

const store = useTaxStore()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8 font-sans selection:bg-blue-600 selection:text-white">
    <div class="max-w-7xl mx-auto">
      
      <!-- Header -->
      <header class="mb-12 text-center sm:text-left">
        <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-[#e2af0d] dark:from-blue-400 dark:via-blue-300 dark:to-[#e2af0d] mb-4">
          TaxGrid
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
          Simula e compara in tempo reale i regimi fiscali italiani per scoprire il tuo vero netto in tasca.
        </p>
      </header>

      <!-- Global Controls -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8 transition-shadow hover:shadow-md">
        <h2 class="text-xl font-semibold mb-6 flex items-center">
          <span class="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg mr-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
          </span>
          Parametri Globali
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fatturato Annuo Stimato</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>
              <input type="number" v-model="store.fatturato" class="block w-full pl-8 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Spese Annue (Ded./Detr.)</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>
              <input type="number" v-model="store.spese" class="block w-full pl-8 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoria ATECO (Coefficiente)</label>
            <select v-model="store.atecoCategory" class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors">
              <option v-for="cat in store.ATECO_CATEGORIES" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">Solo per Forfettario.</p>
          </div>
        </div>
      </div>

      <!-- Regimes Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Forfettario Card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-lg duration-300">
          <div class="bg-blue-50 dark:bg-blue-950/30 px-6 py-4 border-b border-blue-100 dark:border-blue-900/30">
            <h3 class="text-xl font-bold text-blue-800 dark:text-blue-300">Regime Forfettario</h3>
          </div>
          
          <div class="p-6 flex-grow flex flex-col">
            <div class="mb-6 space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Aliquota Startup (5%)</span>
                <Switch
                  v-model="store.forfettarioStartup"
                  :class="store.forfettarioStartup ? 'bg-[#e2af0d]' : 'bg-gray-200 dark:bg-gray-600'"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2af0d] focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  <span class="sr-only">Toggle Startup</span>
                  <span
                    :class="store.forfettarioStartup ? 'translate-x-6' : 'translate-x-1'"
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  />
                </Switch>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cassa Previdenziale</label>
                <select v-model="store.forfettarioCassa" class="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg shadow-sm focus:ring-[#e2af0d] focus:border-[#e2af0d] sm:text-sm">
                  <option value="gestione_separata">Gestione Separata (Pro)</option>
                  <option value="artigiani">Artigiani e Commercianti</option>
                </select>
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
            </div>
          </div>
        </div>

        <!-- Ordinario Card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-lg duration-300">
          <div class="bg-blue-50 dark:bg-blue-950/30 px-6 py-4 border-b border-blue-100 dark:border-blue-900/30">
            <h3 class="text-xl font-bold text-blue-800 dark:text-blue-300">Regime Ordinario</h3>
          </div>
          
          <div class="p-6 flex-grow flex flex-col">
            <div class="mb-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cassa Previdenziale</label>
                <select v-model="store.ordinarioCassa" class="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg shadow-sm focus:ring-[#e2af0d] focus:border-[#e2af0d] sm:text-sm">
                  <option value="gestione_separata">Gestione Separata (Pro)</option>
                  <option value="artigiani">Artigiani e Commercianti</option>
                </select>
              </div>
            </div>

            <div class="mt-auto space-y-3 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500 dark:text-gray-400">INPS Stimato</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ formatCurrency(store.ordinarioResult.inps) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500 dark:text-gray-400">Imposte (IRPEF)</span>
                <span class="font-medium text-red-500">{{ formatCurrency(store.ordinarioResult.tasse) }}</span>
              </div>
              <div class="flex justify-between items-center pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                <span class="text-base font-semibold text-gray-900 dark:text-white">Netto in Tasca</span>
                <span class="text-2xl font-bold text-[#e2af0d]">{{ formatCurrency(store.ordinarioResult.netto) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- SRL Card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-lg duration-300">
          <div class="bg-blue-50 dark:bg-blue-950/30 px-6 py-4 border-b border-blue-100 dark:border-blue-900/30">
            <h3 class="text-xl font-bold text-blue-800 dark:text-blue-300">S.R.L.</h3>
          </div>
          
          <div class="p-6 flex-grow flex flex-col">
            <div class="mb-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Strategia Distribuzione</label>
                <select v-model="store.srlDistribuzione" class="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg shadow-sm focus:ring-[#e2af0d] focus:border-[#e2af0d] sm:text-sm">
                  <option value="compenso">Tutto Compenso Amministratore</option>
                  <option value="utili">Distribuzione Utili (IRES+IRAP+26%)</option>
                </select>
              </div>
            </div>

            <div class="mt-auto space-y-3 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500 dark:text-gray-400">INPS (Amministratore)</span>
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
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
