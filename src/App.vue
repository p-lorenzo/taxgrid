<script setup lang="ts">
import { useTaxStore, ALIQUOTA_INPS_DATORE } from './store/taxStore'
import { Switch } from '@headlessui/vue'
import Footer from './components/Footer.vue'
import ComparisonChart from './components/ComparisonChart.vue'
import CalculationBreakdown from './components/CalculationBreakdown.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import CardForfettario from './components/CardForfettario.vue'
import CardOrdinario from './components/CardOrdinario.vue'
import CardSrl from './components/CardSrl.vue'
import CardDipendente from './components/CardDipendente.vue'
import InfoTooltip from './components/InfoTooltip.vue'
import draggable from 'vuedraggable'
import PrintReport from './components/PrintReport.vue'
import PwaInstallPrompt from './components/PwaInstallPrompt.vue'
import { computed, ref } from 'vue'

const store = useTaxStore()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val)
}

const activeRegimesCount = computed(() => {
  return [store.showForfettario, store.showOrdinario, store.showSrl, store.showDipendente].filter(Boolean).length
})

const gridColsClass = computed(() => {
  const count = activeRegimesCount.value
  if (count === 1) return 'grid-cols-1 max-w-2xl mx-auto print:grid-cols-1 print:max-w-none'
  if (count === 2) return 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto print:grid-cols-2 print:max-w-none'
  if (count === 3) return 'grid-cols-1 lg:grid-cols-3 max-w-7xl mx-auto print:grid-cols-2 print:max-w-none'
  return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4 print:grid-cols-2 print:max-w-none'
})

const printPage = () => {
  window.print()
}

const shareToastVisible = ref(false)
let shareToastTimer: ReturnType<typeof setTimeout> | null = null

const copyShareUrl = async () => {
  try {
    const url = store.buildShareUrl()
    await navigator.clipboard.writeText(url)
    shareToastVisible.value = true
    if (shareToastTimer) clearTimeout(shareToastTimer)
    shareToastTimer = setTimeout(() => {
      shareToastVisible.value = false
    }, 2500)
  } catch {
    alert('Impossibile copiare il link negli appunti.')
  }
}

// Modal State
const isBreakdownOpen = ref(false)
const breakdownTitle = ref('')
const breakdownSteps = ref<any[]>([])
const breakdownFinalNetto = ref(0)

const visibleCards = computed<string[]>({
  get: () => store.cardOrder.filter(id => {
    if (id === 'forfettario') return store.showForfettario
    if (id === 'ordinario') return store.showOrdinario
    if (id === 'srl') return store.showSrl
    if (id === 'dipendente') return store.showDipendente
    return false
  }),
  set: (newOrder) => {
    const hidden = store.cardOrder.filter(id => {
      if (id === 'forfettario') return !store.showForfettario
      if (id === 'ordinario') return !store.showOrdinario
      if (id === 'srl') return !store.showSrl
      if (id === 'dipendente') return !store.showDipendente
      return true
    })
    store.cardOrder = [...newOrder, ...hidden]
  }
})

const openBreakdown = (regime: 'forfettario' | 'ordinario' | 'srl' | 'dipendente') => {
  if (regime === 'forfettario') {
    breakdownTitle.value = 'Regime Forfettario'
    breakdownSteps.value = store.forfettarioResult.breakdown.steps
    breakdownFinalNetto.value = store.forfettarioResult.netto
  } else if (regime === 'ordinario') {
    breakdownTitle.value = 'Regime Ordinario'
    breakdownSteps.value = store.ordinarioResult.breakdown.steps
    breakdownFinalNetto.value = store.ordinarioResult.netto
  } else if (regime === 'srl') {
    breakdownTitle.value = 'Società S.R.L.'
    breakdownSteps.value = store.srlResult.breakdown.steps
    breakdownFinalNetto.value = store.srlResult.netto
  } else if (regime === 'dipendente') {
    breakdownTitle.value = 'Lavoro Dipendente'
    breakdownSteps.value = store.dipendenteResult.breakdown.steps
    breakdownFinalNetto.value = store.dipendenteResult.netto
  }
  isBreakdownOpen.value = true
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8 font-sans selection:bg-blue-600 selection:text-white">
    <!-- Interactive UI (hidden on print) -->
    <div class="print:hidden">
      <div class="max-w-7xl mx-auto">

      <!-- Header -->
      <header class="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-center sm:text-left print:hidden">
        <div>
          <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-[#e2af0d] dark:from-blue-400 dark:via-blue-300 dark:to-[#e2af0d] mb-4">
            TaxGrid
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Simula e compara in tempo reale i regimi fiscali italiani per scoprire il tuo vero netto in tasca.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <!-- Global Controls -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8 transition-shadow hover:shadow-md">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 class="text-xl font-semibold flex items-center">
            <span class="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg mr-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            </span>
            Parametri Globali
          </h2>
          <div class="flex items-center gap-2">
          <button @click="copyShareUrl" class="print:hidden inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#e2af0d] dark:border-[#e2af0d] rounded-xl bg-white dark:bg-gray-800 hover:bg-[#e2af0d]/10 dark:hover:bg-[#e2af0d]/20 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm hover:shadow transition-all duration-200 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            Condividi Simulazione
          </button>
          <button @click="printPage" class="print:hidden inline-flex items-center justify-center gap-2 px-4 py-2 border border-blue-600 dark:border-blue-500 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-sm font-semibold text-white shadow-sm hover:shadow transition-all duration-200 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Stampa Report / PDF
          </button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ store.inputMode === 'ral' ? 'RAL (Retribuzione Annua Lorda)' : 'Fatturato Annuo Stimato' }}
              </label>
              <div class="flex items-center gap-1.5">
                <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Fatt.</span>
                <Switch
                  :model-value="store.inputMode === 'ral'"
                  @update:model-value="(val: boolean) => { const newMode = val ? 'ral' : 'fatturato'; if (store.inputMode !== newMode) { const factor = 1 + ALIQUOTA_INPS_DATORE; store.fatturato = store.inputMode === 'ral' ? Math.round(store.fatturato * factor * 100) / 100 : Math.round(store.fatturato / factor * 100) / 100; store.inputMode = newMode; } }"
                  :class="store.inputMode === 'ral' ? 'bg-[#e2af0d]' : 'bg-gray-200 dark:bg-gray-600'"
                  class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2af0d]"
                >
                  <span class="sr-only">Toggle Fatturato / RAL</span>
                  <span
                    :class="store.inputMode === 'ral' ? 'translate-x-5' : 'translate-x-1'"
                    class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                  />
                </Switch>
                <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">RAL</span>
              </div>
            </div>
            <div class="relative print:hidden">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>
              <input type="number" v-model="store.fatturato" class="block w-full pl-8 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
            </div>
            <div class="hidden print:block text-lg font-bold text-gray-900 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl border border-gray-200 min-h-[42px] flex items-center">
              {{ formatCurrency(store.fatturato) }}
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Spese Annue</label>
            
            <!-- Simple Mode Input -->
            <div v-if="!store.advancedMode">
              <div class="relative print:hidden">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>
                <input type="number" v-model="store.speseDeducibili" class="block w-full pl-8 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
              </div>
              <div class="hidden print:block text-lg font-bold text-gray-900 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl border border-gray-200 min-h-[42px] flex items-center">
                {{ formatCurrency(store.speseDeducibili) }}
              </div>
              <p class="text-xs text-gray-500 mt-1 print:hidden">Spese operative generiche deducibili dal reddito.</p>
            </div>

            <!-- Advanced Mode Placeholder -->
            <div v-else>
              <div class="bg-gray-50 dark:bg-gray-700/50 border border-dashed border-gray-200 dark:border-gray-600 rounded-xl py-2 px-3 text-sm text-gray-500 dark:text-gray-400 flex items-center h-[42px] print:hidden">
                <svg class="w-4 h-4 mr-2 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                <span class="truncate">Suddivise nei parametri avanzati</span>
              </div>
              <div class="hidden print:block text-sm font-semibold text-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl border border-gray-200 min-h-[42px] flex items-center">
                Vedi parametri avanzati
              </div>
              <p class="text-xs text-gray-500 mt-1 print:hidden">Vedi sezione in calce.</p>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              Categoria ATECO (Coefficiente)
              <InfoTooltip text="La percentuale (stabilita per codice ATECO) su cui si calcolano imposte e contributi nel regime Forfettario. Le spese reali non vengono detratte." />
            </label>
            <select v-model="store.atecoCategory" class="print:hidden block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors">
              <option v-for="cat in store.ATECO_CATEGORIES" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
            <div class="hidden print:block text-xs font-semibold text-gray-900 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl border border-gray-200 min-h-[42px] flex items-center leading-tight">
              {{ store.ATECO_CATEGORIES.find(c => c.id === store.atecoCategory)?.name || store.atecoCategory }}
            </div>
            <p class="text-xs text-gray-500 mt-1 print:hidden">Solo per Forfettario.</p>
          </div>
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Confronto Stipendio</label>
              <span class="text-xs font-semibold text-blue-600 dark:text-blue-400 print:text-xs print:text-gray-900">Dividi per: {{ store.mesiParagone }} mensilità</span>
            </div>
            <div class="pt-2 print:hidden">
              <input type="range" v-model.number="store.mesiParagone" min="1" max="15" step="1" class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#e2af0d] focus:outline-none focus:ring-2 focus:ring-[#e2af0d] focus:ring-offset-2 dark:focus:ring-offset-gray-800" />
              <div class="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 px-1 mt-1 font-medium">
                <span>1</span>
                <span>5</span>
                <span>10</span>
                <span>15</span>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-1 print:hidden">Confronta il netto con uno stipendio mensile.</p>
          </div>
        </div>

        <!-- Divider and Toggle for Advanced Parameters -->
        <div class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
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

        <!-- Print-only Advanced Parameters Title -->
        <div v-if="store.advancedMode" class="hidden print:block mt-6 pt-6 border-t border-gray-200">
          <h3 class="text-sm font-bold uppercase tracking-wider text-gray-700">Parametri Avanzati</h3>
        </div>

        <!-- Advanced Parameters Panel (conditional) -->
        <div v-if="store.advancedMode">
          <div class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Section 1: Spese Suddivise -->
          <div class="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
            <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center">
              <span class="mr-1.5 text-blue-500">●</span> Spese Suddivise
            </h4>
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Spese Deducibili</label>
                <div class="relative print:hidden">
                  <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-400 text-xs">€</span>
                  <input type="number" v-model="store.speseDeducibili" class="block w-full pl-7 pr-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
                </div>
                <div class="hidden print:block text-sm font-bold text-gray-900 bg-white dark:bg-gray-850 px-2.5 py-1.5 rounded-lg border border-gray-200 min-h-[34px] flex items-center">
                  {{ formatCurrency(store.speseDeducibili) }}
                </div>
                <p class="text-[10px] text-gray-400 mt-1 print:hidden">Riducono il reddito imponibile</p>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                  Spese Detraibili (19%)
                  <InfoTooltip text="Non si applicano al Forfettario. Riducono direttamente l'IRPEF netta del 19% delle spese sostenute." />
                </label>
                <div class="relative print:hidden">
                  <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-400 text-xs">€</span>
                  <input type="number" v-model="store.speseDetraibili" class="block w-full pl-7 pr-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
                </div>
                <div class="hidden print:block text-sm font-bold text-gray-900 bg-white dark:bg-gray-850 px-2.5 py-1.5 rounded-lg border border-gray-200 min-h-[34px] flex items-center">
                  {{ formatCurrency(store.speseDetraibili) }}
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
                  class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2af0d] print:hidden"
                >
                  <span class="sr-only">Toggle Has Job</span>
                  <span
                    :class="store.hasLavoroDipendente ? 'translate-x-5' : 'translate-x-1'"
                    class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                  />
                </Switch>
                <span class="hidden print:inline-block text-xs font-bold text-gray-900">
                  {{ store.hasLavoroDipendente ? 'Sì' : 'No' }}
                </span>
              </div>

              <div v-if="store.hasLavoroDipendente" class="space-y-3 pt-2 border-t border-gray-200/50 dark:border-gray-700/30">
                <div>
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                    RAL (Reddito Annuo Lordo)
                    <InfoTooltip text="Retribuzione Annua Lorda da lavoro dipendente. Determina lo scaglione IRPEF di partenza in caso di cumulo con la partita IVA." />
                  </label>
                  <div class="relative print:hidden">
                    <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-400 text-xs">€</span>
                    <input type="number" v-model="store.ralDipendente" class="block w-full pl-7 pr-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
                  </div>
                  <div class="hidden print:block text-sm font-bold text-gray-900 bg-white dark:bg-gray-850 px-2.5 py-1.5 rounded-lg border border-gray-200 min-h-[34px] flex items-center">
                    {{ formatCurrency(store.ralDipendente) }}
                  </div>
                </div>

                <div class="flex items-center space-x-2 py-1">
                  <input type="checkbox" id="fullTimeCheck" v-model="store.dipendenteFullTime" class="h-4 w-4 text-[#e2af0d] focus:ring-[#e2af0d] border-gray-300 dark:border-gray-600 rounded print:hidden" />
                  <span class="hidden print:inline-block text-xs font-bold text-gray-900">
                    [ {{ store.dipendenteFullTime ? 'X' : ' ' }} ]
                  </span>
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
                  <InfoTooltip text="Imposta regionale aggiuntiva calcolata sull'imponibile IRPEF dei regimi ordinari e dipendenti. Medie regionali: 1.2% - 3.3%." />
                </label>
                <div class="relative print:hidden">
                  <input type="number" step="0.01" v-model="store.addizionaleRegionale" class="block w-full pr-7 pl-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
                  <span class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 text-xs">%</span>
                </div>
                <div class="hidden print:block text-sm font-bold text-gray-900 bg-white dark:bg-gray-850 px-2.5 py-1.5 rounded-lg border border-gray-200 min-h-[34px] flex items-center">
                  {{ store.addizionaleRegionale }}%
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                  Addizionale Comunale
                  <InfoTooltip text="Imposta comunale aggiuntiva calcolata sull'imponibile IRPEF. Medie comunali: Milano 0.8%, Roma e Napoli 0.9%." />
                </label>
                <div class="relative print:hidden">
                  <input type="number" step="0.01" v-model="store.addizionaleComunale" class="block w-full pr-7 pl-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
                  <span class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 text-xs">%</span>
                </div>
                <div class="hidden print:block text-sm font-bold text-gray-900 bg-white dark:bg-gray-850 px-2.5 py-1.5 rounded-lg border border-gray-200 min-h-[34px] flex items-center">
                  {{ store.addizionaleComunale }}%
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
                  <InfoTooltip text="Soglia massima di imponibile previdenziale (119.650€ per il 2025) oltre la quale non sono dovuti contributi pensionistici." />
                </label>
                <div class="relative print:hidden">
                  <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-400 text-xs">€</span>
                  <input type="number" v-model="store.massimaleInps" class="block w-full pl-7 pr-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors" />
                </div>
                <div class="hidden print:block text-sm font-bold text-gray-900 bg-white dark:bg-gray-850 px-2.5 py-1.5 rounded-lg border border-gray-200 min-h-[34px] flex items-center">
                  {{ formatCurrency(store.massimaleInps) }}
                </div>
              </div>
            </div>
          </div>
        </div>
          
          <!-- Section 5: Visibilità Regimi -->
          <div class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center">
              <span class="mr-1.5 text-purple-500">●</span> Visibilità Regimi
            </h4>
            <div class="flex flex-wrap gap-x-8 gap-y-4">
              <div class="flex items-center space-x-3">
                <Switch v-model="store.showForfettario" :class="store.showForfettario ? 'bg-[#e2af0d]' : 'bg-gray-200 dark:bg-gray-600'" class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2af0d]">
                  <span :class="store.showForfettario ? 'translate-x-5' : 'translate-x-1'" class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"/>
                </Switch>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Forfettario</span>
              </div>
              <div class="flex items-center space-x-3">
                <Switch v-model="store.showOrdinario" :class="store.showOrdinario ? 'bg-[#e2af0d]' : 'bg-gray-200 dark:bg-gray-600'" class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2af0d]">
                  <span :class="store.showOrdinario ? 'translate-x-5' : 'translate-x-1'" class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"/>
                </Switch>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Ordinario</span>
              </div>
              <div class="flex items-center space-x-3">
                <Switch v-model="store.showSrl" :class="store.showSrl ? 'bg-[#e2af0d]' : 'bg-gray-200 dark:bg-gray-600'" class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2af0d]">
                  <span :class="store.showSrl ? 'translate-x-5' : 'translate-x-1'" class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"/>
                </Switch>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">S.R.L.</span>
              </div>
              <div class="flex items-center space-x-3">
                <Switch v-model="store.showDipendente" :class="store.showDipendente ? 'bg-[#e2af0d]' : 'bg-gray-200 dark:bg-gray-600'" class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2af0d]">
                  <span :class="store.showDipendente ? 'translate-x-5' : 'translate-x-1'" class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"/>
                </Switch>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Dipendente</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div> <!-- Fine contenitore max-w-7xl -->

    <!-- Contenitore più largo per le card -->
    <div class="max-w-[1600px] w-full mx-auto mt-6">
      <!-- Regimes Grid -->
      <draggable
        v-model="visibleCards"
        item-key="id"
        handle=".drag-handle"
        tag="div"
        :class="['grid gap-6', gridColsClass]"
        :animation="200"
        ghost-class="opacity-50"
      >
        <template #item="{ element }">
          <div class="h-full">
            <CardForfettario v-if="element === 'forfettario'" @open-breakdown="openBreakdown" />
            <CardOrdinario v-else-if="element === 'ordinario'" @open-breakdown="openBreakdown" />
            <CardSrl v-else-if="element === 'srl'" @open-breakdown="openBreakdown" />
            <CardDipendente v-else-if="element === 'dipendente'" @open-breakdown="openBreakdown" />
          </div>
        </template>
      </draggable>
    </div>

    <!-- Grafico di Confronto (spostato in fondo, sotto le card) -->
    <div class="max-w-[1600px] w-full mx-auto mt-12">
      <ComparisonChart />
    </div>

    <Footer />
    </div>

    <!-- Dedicated Print Report (visible ONLY when printing) -->
    <PrintReport class="hidden print:block" />

    <!-- Calculation Breakdown Dialog -->
    <CalculationBreakdown
      :is-open="isBreakdownOpen"
      :title="breakdownTitle"
      :steps="breakdownSteps"
      :final-netto="breakdownFinalNetto"
      :mesi-paragone="store.mesiParagone"
      @close="isBreakdownOpen = false"
    />

    <!-- Share Toast Notification -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div v-if="shareToastVisible" class="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl shadow-xl text-sm font-medium">
        <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        Link copiato! Ora puoi condividere la simulazione.
      </div>
    </Transition>

    <!-- PWA Install Prompt -->
    <PwaInstallPrompt />
  </div>
</template>
