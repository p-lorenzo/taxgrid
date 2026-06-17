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
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fatturato Annuo Stimato</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>
              <input type="number" v-model="store.fatturato" class="block w-full pl-8 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Spese Annue</label>
            
            <!-- Simple Mode Input -->
            <div v-if="!store.advancedMode">
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>
                <input type="number" v-model="store.speseDeducibili" class="block w-full pl-8 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
              </div>
              <p class="text-xs text-gray-500 mt-1">Spese operative generiche deducibili dal reddito.</p>
            </div>

            <!-- Advanced Mode Placeholder -->
            <div v-else>
              <div class="bg-gray-50 dark:bg-gray-700/50 border border-dashed border-gray-200 dark:border-gray-600 rounded-xl py-2 px-3 text-sm text-gray-500 dark:text-gray-400 flex items-center h-[42px]">
                <svg class="w-4 h-4 mr-2 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                <span class="truncate">Suddivise nei parametri avanzati</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">Vedi sezione in calce.</p>
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

        <!-- Divider and Toggle for Advanced Parameters -->
        <div class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center space-x-3">
            <span class="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 p-2 rounded-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </span>
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Parametri Avanzati</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">Configura cumulo RAL, detrazioni, tasse locali e massimali INPS</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-sm text-gray-700 dark:text-gray-300 font-medium">Mostra parametri avanzati</span>
            <Switch
              v-model="store.advancedMode"
              :class="store.advancedMode ? 'bg-[#e2af0d]' : 'bg-gray-200 dark:bg-gray-600'"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2af0d] focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              <span class="sr-only">Toggle Advanced Parameters</span>
              <span
                :class="store.advancedMode ? 'translate-x-6' : 'translate-x-1'"
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              />
            </Switch>
          </div>
        </div>

        <!-- Advanced Parameters Panel (conditional) -->
        <div v-if="store.advancedMode" class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Section 1: Spese Suddivise -->
          <div class="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
            <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center">
              <span class="mr-1.5 text-blue-500">●</span> Spese Suddivise
            </h4>
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Spese Deducibili</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-400 text-xs">€</span>
                  <input type="number" v-model="store.speseDeducibili" class="block w-full pl-7 pr-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
                </div>
                <p class="text-[10px] text-gray-400 mt-1">Riducono il reddito imponibile</p>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                  Spese Detraibili (19%)
                  <div class="relative group inline-block ml-1 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 p-2 bg-gray-900 text-white text-[10px] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none font-normal leading-snug">
                      Non si applicano al Forfettario. Riducono direttamente l'IRPEF netta del 19%.
                      <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-400 text-xs">€</span>
                  <input type="number" v-model="store.speseDetraibili" class="block w-full pl-7 pr-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Lavoro Dipendente Concomitante -->
          <div class="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
            <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center">
              <span class="mr-1.5 text-[#e2af0d]">●</span> Lavoro Dipendente
            </h4>
            <div class="space-y-4">
              <div class="flex items-center justify-between py-1">
                <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">Hai un lavoro dipendente?</span>
                <Switch
                  v-model="store.hasLavoroDipendente"
                  :class="store.hasLavoroDipendente ? 'bg-[#e2af0d]' : 'bg-gray-200 dark:bg-gray-600'"
                  class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2af0d]"
                >
                  <span class="sr-only">Toggle Has Job</span>
                  <span
                    :class="store.hasLavoroDipendente ? 'translate-x-5' : 'translate-x-1'"
                    class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                  />
                </Switch>
              </div>

              <div v-if="store.hasLavoroDipendente" class="space-y-3 pt-2 border-t border-gray-200/50 dark:border-gray-700/30">
                <div>
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">RAL (Reddito Annuo Lordo)</label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-400 text-xs">€</span>
                    <input type="number" v-model="store.ralDipendente" class="block w-full pl-7 pr-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
                  </div>
                </div>

                <div class="flex items-center space-x-2 py-1">
                  <input type="checkbox" id="fullTimeCheck" v-model="store.dipendenteFullTime" class="h-4 w-4 text-[#e2af0d] focus:ring-[#e2af0d] border-gray-300 dark:border-gray-600 rounded" />
                  <label for="fullTimeCheck" class="text-xs font-semibold text-gray-600 dark:text-gray-400 cursor-pointer">Contratto Full-Time?</label>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Tasse Locali -->
          <div class="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
            <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center">
              <span class="mr-1.5 text-red-500">●</span> Tasse Locali (Addizionali)
            </h4>
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                  Addizionale Regionale
                  <div class="relative group inline-block ml-1 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-56 p-2 bg-gray-900 text-white text-[10px] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none font-normal leading-snug">
                      Medie regionali: Lombardia (1.23-1.73%), Lazio e Campania (fino a 3.33%).
                      <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </label>
                <div class="relative">
                  <input type="number" step="0.01" v-model="store.addizionaleRegionale" class="block w-full pr-7 pl-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
                  <span class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 text-xs">%</span>
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                  Addizionale Comunale
                  <div class="relative group inline-block ml-1 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-56 p-2 bg-gray-900 text-white text-[10px] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none font-normal leading-snug">
                      Medie comunali: Milano 0.8%, Roma e Napoli 0.9%.
                      <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </label>
                <div class="relative">
                  <input type="number" step="0.01" v-model="store.addizionaleComunale" class="block w-full pr-7 pl-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
                  <span class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 text-xs">%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 4: Massimale INPS -->
          <div class="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
            <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center">
              <span class="mr-1.5 text-green-500">●</span> Limiti Previdenziali
            </h4>
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                  Massimale Contributivo
                  <div class="relative group inline-block ml-1 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-60 p-2.5 bg-gray-900 text-white text-[10px] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none font-normal leading-relaxed">
                      Default 119.650€ (2025). Oltre questa soglia di imponibile non sono dovuti contributi.
                      <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-400 text-xs">€</span>
                  <input type="number" v-model="store.massimaleInps" class="block w-full pl-7 pr-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
                </div>
              </div>
            </div>
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
            <!-- Warning Banner -->
            <div v-if="store.advancedMode && store.hasLavoroDipendente && store.ralDipendente > 35000" class="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300 leading-relaxed font-medium">
              <svg class="w-4 h-4 shrink-0 mt-0.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <span>Attenzione: con redditi da lavoro dipendente &gt; 35.000€ non è consentito aderire al Regime Forfettario.</span>
            </div>

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
