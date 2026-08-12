<script setup lang="ts">
import { computed } from 'vue'
import { useTaxStore } from '../store/taxStore'

const store = useTaxStore()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)
}

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
}

const totalPayable = computed(() => store.deadlines.reduce((sum, e) => sum + e.amount, 0))

const typeStyles: Record<string, { badge: string; dot: string }> = {
  saldo: { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', dot: 'bg-blue-500' },
  acconto: { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', dot: 'bg-amber-500' },
  contributi: { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', dot: 'bg-emerald-500' },
  addizionali: { badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', dot: 'bg-purple-500' },
}

const typeLabel: Record<string, string> = {
  saldo: 'Saldo',
  acconto: 'Acconto',
  contributi: 'Contributi',
  addizionali: 'Addizionali',
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8 print:hidden">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div class="flex items-start gap-3">
        <span class="bg-[#e2af0d]/10 text-[#e2af0d] p-2 rounded-lg shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </span>
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Scadenze Fiscali {{ store.fiscalYear }}</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Calendario di cassa stimato (saldo, acconti, contributi e addizionali) per il regime selezionato.
          </p>
        </div>
      </div>

      <!-- Regime selector -->
      <div class="flex items-center gap-2">
        <div class="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-1">
          <button
            v-for="r in (['forfettario', 'ordinario'] as const)"
            :key="r"
            @click="store.deadlineRegime = r"
            :class="store.deadlineRegime === r
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'"
            class="px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
          >
            {{ r === 'forfettario' ? 'Forfettario' : 'Ordinario' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Controls: metodo acconto + override -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50">
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Metodo acconto</label>
        <div class="flex flex-wrap gap-2">
          <button
            @click="store.accontoMethod = 'storico'"
            :class="store.accontoMethod === 'storico'
              ? 'border-[#e2af0d] bg-[#e2af0d]/10 text-[#a97f00] dark:text-[#e2af0d]'
              : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'"
            class="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer"
          >
            Storico (imposta {{ store.fiscalYear - 1 }})
          </button>
          <button
            @click="store.accontoMethod = 'previsionale'"
            :class="store.accontoMethod === 'previsionale'
              ? 'border-[#e2af0d] bg-[#e2af0d]/10 text-[#a97f00] dark:text-[#e2af0d]'
              : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'"
            class="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer"
          >
            Previsionale (imposta stimata 2026)
          </button>
        </div>
      </div>
      <div v-if="store.accontoMethod === 'previsionale'">
        <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center">
          Imposta prevista {{ store.fiscalYear }}
        </label>
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-sm">€</span>
          <input
            type="number"
            v-model.number="store.expectedTax"
            min="0"
            class="block w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#e2af0d] focus:border-[#e2af0d] transition-colors"
          />
        </div>
        <p class="text-[10px] text-gray-400 mt-1">Lascia 0 per usare l’imposta calcolata dal simulatore.</p>
      </div>
    </div>

    <!-- Timeline -->
    <div v-if="store.deadlines.length" class="relative">
      <!-- vertical line -->
      <div class="absolute left-[13px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500/40 via-[#e2af0d]/40 to-blue-500/40 rounded-full" />

      <ol class="space-y-4">
        <li v-for="(event, index) in store.deadlines" :key="index" class="relative flex gap-4 pl-1">
          <!-- dot -->
          <div class="relative z-10 mt-1 shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 border-2 shadow-sm" :class="typeStyles[event.type].dot + ' border-transparent'">
            <span class="w-2 h-2 rounded-full bg-white" />
          </div>
          <!-- card -->
          <div class="flex-1 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50 rounded-xl p-3.5 hover:border-[#e2af0d]/40 hover:shadow-sm transition-all">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="font-bold text-gray-900 dark:text-white text-sm">{{ formatDate(event.date) }}</span>
                <span class="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" :class="typeStyles[event.type].badge">
                  {{ typeLabel[event.type] }}
                </span>
              </div>
              <span class="font-extrabold text-[#e2af0d] text-base">{{ formatCurrency(event.amount) }}</span>
            </div>
            <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1.5">{{ event.label }}</p>
            <p v-if="event.detail" class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{{ event.detail }}</p>
          </div>
        </li>
      </ol>

      <!-- Totale -->
      <div class="mt-6 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Totale versamenti stimati</span>
        <span class="text-xl font-extrabold text-gray-900 dark:text-white">{{ formatCurrency(totalPayable) }}</span>
      </div>
    </div>

    <div v-else class="py-8 text-center text-gray-400 dark:text-gray-500">
      Nessuna scadenza da mostrare con i parametri attuali.
    </div>

    <p class="mt-5 text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
      Stima orientativa basata sulle regole 2026: il calendario ufficiale di saldi e acconti può variare per fattispecie, rateazioni e proroghe. Non sostituisce la consulenza di un professionista.
    </p>
  </div>
</template>
