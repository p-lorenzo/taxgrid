<script setup lang="ts">
import { useTaxStore } from './store/taxStore'
import { Switch } from '@headlessui/vue'
import { computed } from 'vue'

const store = useTaxStore()

const isAdvanced = computed({
  get: () => store.expensesMode === 'advanced',
  set: (val: boolean) => {
    store.expensesMode = val ? 'advanced' : 'simple'
  }
})

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
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fatturato Annuo Stimato</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>
              <input type="number" v-model="store.fatturato" class="block w-full pl-8 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Spese Annue</label>
              <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-500 dark:text-gray-400">Avanzate</span>
                <Switch
                  v-model="isAdvanced"
                  :class="isAdvanced ? 'bg-[#e2af0d]' : 'bg-gray-200 dark:bg-gray-600'"
                  class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2af0d] focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  <span class="sr-only">Toggle Advanced Mode</span>
                  <span
                    :class="isAdvanced ? 'translate-x-5' : 'translate-x-1'"
                    class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                  />
                </Switch>
              </div>
            </div>

            <!-- Simple Mode Input -->
            <div v-if="!isAdvanced">
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>
                <input type="number" v-model="store.speseDeducibili" class="block w-full pl-8 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
              </div>
              <p class="text-xs text-gray-500 mt-1">Spese operative generiche deducibili dal reddito.</p>
            </div>

            <!-- Advanced Mode Grid -->
            <div v-else>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Deducibili</label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs">€</span>
                    <input type="number" v-model="store.speseDeducibili" class="block w-full pl-7 pr-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Detraibili (19%)</label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs">€</span>
                    <input type="number" v-model="store.speseDetraibili" class="block w-full pl-7 pr-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
                  </div>
                </div>
              </div>
              <div class="mt-2 text-xs text-blue-600 dark:text-blue-400 flex items-start gap-1">
                <svg class="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>Le detraibili riducono l'IRPEF del 19%. Non si applicano al Forfettario.</span>
              </div>
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
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Confronto Stipendio</label>
              <span class="text-xs font-semibold text-blue-600 dark:text-blue-400">Dividi per: {{ store.mesiParagone }} mensilità</span>
            </div>
            <div class="pt-2">
              <input type="range" v-model.number="store.mesiParagone" min="1" max="15" step="1" class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#e2af0d] focus:outline-none focus:ring-2 focus:ring-[#e2af0d] focus:ring-offset-2 dark:focus:ring-offset-gray-800" />
              <div class="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 px-1 mt-1 font-medium">
                <span>1</span>
                <span>5</span>
                <span>10</span>
                <span>15</span>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-1">Confronta il netto con uno stipendio mensile.</p>
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

              <!-- INPS Reductions (Artigiani only) -->
              <div v-if="store.forfettarioCassa === 'artigiani'" class="flex flex-col gap-3 pt-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    Riduzione INPS 35%
                    <div class="relative group inline-block ml-1.5 cursor-pointer align-middle text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none leading-relaxed normal-case font-normal">
                        Esclusiva per Regime Forfettario (Artigiani/Commercianti). Riduce del 35% i contributi fissi e variabili. Attenzione: riduce proporzionalmente anche l'anzianità per la pensione.
                        <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </span>
                  <Switch
                    v-model="store.forfettarioRiduzione35"
                    :class="store.forfettarioRiduzione35 ? 'bg-[#e2af0d]' : 'bg-gray-200 dark:bg-gray-600'"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2af0d] focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    <span class="sr-only">Toggle Riduzione 35%</span>
                    <span
                      :class="store.forfettarioRiduzione35 ? 'translate-x-6' : 'translate-x-1'"
                      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    />
                  </Switch>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    Riduzione INPS 50%
                    <div class="relative group inline-block ml-1.5 cursor-pointer align-middle text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none leading-relaxed normal-case font-normal">
                        Applicabile ai pensionati Over 65 INPS o a specifici neo-iscritti. Incompatibile con la riduzione del 35%.
                        <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </span>
                  <Switch
                    v-model="store.forfettarioRiduzione50"
                    :class="store.forfettarioRiduzione50 ? 'bg-[#e2af0d]' : 'bg-gray-200 dark:bg-gray-600'"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2af0d] focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    <span class="sr-only">Toggle Riduzione 50%</span>
                    <span
                      :class="store.forfettarioRiduzione50 ? 'translate-x-6' : 'translate-x-1'"
                      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    />
                  </Switch>
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

              <!-- INPS Reductions (Artigiani only) -->
              <div v-if="store.ordinarioCassa === 'artigiani'" class="flex flex-col gap-3 pt-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    Riduzione INPS 50%
                    <div class="relative group inline-block ml-1.5 cursor-pointer align-middle text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none leading-relaxed normal-case font-normal">
                        Applicabile ai pensionati Over 65 (già titolari di pensione INPS) o a specifici neo-iscritti alla gestione Artigiani/Commercianti.
                        <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </span>
                  <Switch
                    v-model="store.ordinarioRiduzione50"
                    :class="store.ordinarioRiduzione50 ? 'bg-[#e2af0d]' : 'bg-gray-200 dark:bg-gray-600'"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2af0d] focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    <span class="sr-only">Toggle Riduzione 50%</span>
                    <span
                      :class="store.ordinarioRiduzione50 ? 'translate-x-6' : 'translate-x-1'"
                      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    />
                  </Switch>
                </div>
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
              <div class="flex justify-between items-center pt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Paragone Mensile (su {{ store.mesiParagone }} mensilità)</span>
                <span class="font-semibold text-gray-900 dark:text-white">{{ formatCurrency(store.ordinarioResult.nettoMensile) }}</span>
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

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cassa Previdenziale</label>
                <select v-model="store.srlCassa" class="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg shadow-sm focus:ring-[#e2af0d] focus:border-[#e2af0d] sm:text-sm">
                  <option value="gestione_separata">Gestione Separata (Pro)</option>
                  <option value="artigiani">Artigiani e Commercianti</option>
                </select>
              </div>

              <!-- INPS Reductions (Artigiani only) -->
              <div v-if="store.srlCassa === 'artigiani'" class="flex flex-col gap-3 pt-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    Riduzione INPS 50%
                    <div class="relative group inline-block ml-1.5 cursor-pointer align-middle text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none leading-relaxed normal-case font-normal">
                        Applicabile ai pensionati Over 65 (già titolari di pensione INPS) o a specifici neo-iscritti alla gestione Artigiani/Commercianti.
                        <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </span>
                  <Switch
                    v-model="store.srlRiduzione50"
                    :class="store.srlRiduzione50 ? 'bg-[#e2af0d]' : 'bg-gray-200 dark:bg-gray-600'"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2af0d] focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    <span class="sr-only">Toggle Riduzione 50%</span>
                    <span
                      :class="store.srlRiduzione50 ? 'translate-x-6' : 'translate-x-1'"
                      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    />
                  </Switch>
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
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
