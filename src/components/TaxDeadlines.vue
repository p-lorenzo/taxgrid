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

const nextFiscalYear = computed(() => store.fiscalYear + 1)
const totalCurrentYear = computed(() => store.deadlines.filter((event) => event.date.startsWith(`${store.fiscalYear}-`)).reduce((sum, event) => sum + event.amount, 0))
const totalNextYear = computed(() => store.deadlines.filter((event) => event.date.startsWith(`${nextFiscalYear.value}-`)).reduce((sum, event) => sum + event.amount, 0))
const startsIn2026 = computed(() => store.deadlineForecastComplete && store.activityStartDate.startsWith(`${store.fiscalYear}-`))
const hasPriorData = computed(() => [
  store.previousYearTax,
  store.previousTaxAdvanceBase,
  store.previousTaxAdvancesPaid,
  store.previousTaxCreditsWithholdings,
  store.previousContributionIncome,
  store.previousYearContributions,
  store.previousContributionAdvancesPaid,
].some((value) => Number(value) > 0))

const typeStyles: Record<string, { badge: string; dot: string; line: string }> = {
  saldo: { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', dot: 'bg-blue-500', line: 'bg-blue-500/40' },
  acconto: { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', dot: 'bg-amber-500', line: 'bg-amber-500/40' },
  contributi: { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', dot: 'bg-emerald-500', line: 'bg-emerald-500/40' },
  adempimento: { badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', dot: 'bg-purple-500', line: 'bg-purple-500/40' },
}

const typeLabel: Record<string, string> = {
  saldo: 'Saldo',
  acconto: 'Acconto',
  contributi: 'Contributi',
  adempimento: 'Adempimento',
}
</script>

<template>
  <div class="tg-glass rounded-2xl p-6 mb-8 print:hidden">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div class="flex items-start gap-3">
        <span class="bg-[#e2af0d]/10 text-[#e2af0d] p-2 rounded-lg shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </span>
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Scadenze Fiscali {{ store.fiscalYear }}–{{ nextFiscalYear }}</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Tutti i saldi, acconti, contributi e Modelli Redditi dall’inizio dell’anno simulato alla fine del successivo.
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

    <!-- Dati necessari: fatti storici che determinano saldi e acconti -->
    <section class="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50" aria-labelledby="deadline-data-title">
      <div class="flex flex-wrap items-start justify-between gap-2 mb-4">
        <div>
          <h3 id="deadline-data-title" class="text-sm font-bold text-gray-900 dark:text-white">Dati necessari</h3>
          <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Inserisci dati relativi al 2025 riportati nella dichiarazione 2026. Valore 0 significa nessun importo.</p>
        </div>
        <span v-if="startsIn2026" class="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Prima attività: storico non richiesto</span>
        <span v-else-if="store.deadlineForecastComplete && hasPriorData" class="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Dati minimi completi</span>
        <span v-else-if="store.deadlineForecastComplete" class="text-[11px] font-semibold text-amber-700 dark:text-amber-300">Storico tutto a zero: verifica gli importi</span>
        <span v-else class="text-[11px] font-semibold text-amber-700 dark:text-amber-300">Data apertura obbligatoria</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="activity-start-date" class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Data apertura Partita IVA *</label>
          <input id="activity-start-date" v-model="store.activityStartDate" type="date" max="2026-12-31" required class="tg-input block w-full px-3 py-2 rounded-xl text-sm" />
          <p class="text-[10px] text-gray-400 mt-1">Determina presenza dello storico e mesi del minimale INPS.</p>
        </div>
        <label v-if="store.deadlineRegime === 'ordinario'" class="flex items-start gap-2 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-xs text-gray-700 dark:text-gray-300">
          <input v-model="store.ordinaryIsaEligible" type="checkbox" class="mt-0.5 accent-[#e2af0d]" />
          <span><strong>Soggetto ISA / proroga 2026</strong><br><span class="text-[10px] text-gray-400">Usa scadenza 20 luglio e ripartizione acconti 50/50.</span></span>
        </label>
      </div>

      <div v-if="startsIn2026" class="mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-3 py-2 text-xs text-blue-700 dark:text-blue-300">
        Prima attività nel {{ store.fiscalYear }}: nessun saldo o acconto storico. Saldo e acconti fiscali/INPS generati nell’anno successivo dai risultati simulati.
      </div>

      <div v-else-if="store.deadlineForecastComplete" class="mt-4">
        <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Storico fiscale 2025</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label class="text-xs text-gray-600 dark:text-gray-300">Imposta netta dovuta 2025
            <input v-model.number="store.previousYearTax" type="number" min="0" class="tg-input block w-full mt-1 px-3 py-2 rounded-xl text-sm" />
          </label>
          <label class="text-xs text-gray-600 dark:text-gray-300">Base acconti da dichiarazione
            <input v-model.number="store.previousTaxAdvanceBase" type="number" min="0" class="tg-input block w-full mt-1 px-3 py-2 rounded-xl text-sm" />
          </label>
          <label class="text-xs text-gray-600 dark:text-gray-300">Acconti fiscali già versati
            <input v-model.number="store.previousTaxAdvancesPaid" type="number" min="0" class="tg-input block w-full mt-1 px-3 py-2 rounded-xl text-sm" />
          </label>
          <label class="text-xs text-gray-600 dark:text-gray-300">Crediti e ritenute
            <input v-model.number="store.previousTaxCreditsWithholdings" type="number" min="0" class="tg-input block w-full mt-1 px-3 py-2 rounded-xl text-sm" />
          </label>
        </div>
        <p class="text-[10px] text-gray-400 mt-1">Saldo 2025 = imposta netta − acconti − crediti/ritenute. Base acconti: importo specifico indicato nella dichiarazione, non saldo residuo.</p>

        <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-4 mb-2">Storico previdenziale 2025</h4>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label class="text-xs text-gray-600 dark:text-gray-300">Reddito previdenziale 2025
            <input v-model.number="store.previousContributionIncome" type="number" min="0" class="tg-input block w-full mt-1 px-3 py-2 rounded-xl text-sm" />
          </label>
          <label class="text-xs text-gray-600 dark:text-gray-300">Contributi dovuti 2025
            <input v-model.number="store.previousYearContributions" type="number" min="0" class="tg-input block w-full mt-1 px-3 py-2 rounded-xl text-sm" />
          </label>
          <label class="text-xs text-gray-600 dark:text-gray-300">Acconti INPS già versati
            <input v-model.number="store.previousContributionAdvancesPaid" type="number" min="0" class="tg-input block w-full mt-1 px-3 py-2 rounded-xl text-sm" />
          </label>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Metodo acconto fiscale</label>
          <div class="flex flex-wrap gap-2">
            <button @click="store.accontoMethod = 'storico'" :class="store.accontoMethod === 'storico' ? 'border-[#e2af0d] bg-[#e2af0d]/10 text-[#a97f00] dark:text-[#e2af0d]' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'" class="px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer">Storico (imposta 2025)</button>
            <button @click="store.accontoMethod = 'previsionale'" :class="store.accontoMethod === 'previsionale' ? 'border-[#e2af0d] bg-[#e2af0d]/10 text-[#a97f00] dark:text-[#e2af0d]' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'" class="px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer">Previsionale (stima 2026)</button>
          </div>
        </div>
        <div v-if="store.accontoMethod === 'previsionale'">
          <label class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 mb-2">
            <input v-model="store.useCalculatedExpectedTax" type="checkbox" class="accent-[#e2af0d]" /> Usa imposta principale calcolata dal simulatore
          </label>
          <template v-if="!store.useCalculatedExpectedTax">
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Imposta principale prevista {{ store.fiscalYear }}</label>
            <input v-model.number="store.expectedTax" type="number" min="0" class="tg-input block w-full px-3 py-2 rounded-xl text-sm" />
            <p class="text-[10px] text-gray-400 mt-1">Zero è una previsione valida. Metodo previsionale espone a sanzioni se sottostimato.</p>
          </template>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <div v-if="store.deadlines.length" class="relative">
      <ol class="space-y-4">
        <li v-for="(event, index) in store.deadlines" :key="index" class="relative flex gap-4">
          <!-- Segmento di connessione: centrato sul pallino, si ferma all'ultimo -->
          <div
            v-if="index < store.deadlines.length - 1"
            class="absolute left-[13px] top-[18px] bottom-[-20px] w-0.5 rounded-full"
            :class="typeStyles[event.type].line"
            aria-hidden="true"
          />
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
              <span v-if="event.type !== 'adempimento'" class="font-extrabold text-[#e2af0d] text-base">{{ formatCurrency(event.amount) }}</span>
              <span v-else class="text-[10px] font-bold uppercase tracking-wide text-purple-600 dark:text-purple-300">Invio telematico</span>
            </div>
            <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1.5">{{ event.label }}</p>
            <p v-if="event.detail" class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{{ event.detail }}</p>
          </div>
        </li>
      </ol>

      <!-- Totale -->
      <div class="mt-6 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Totale versamenti {{ store.fiscalYear }}</span>
          <span class="text-xl font-extrabold text-gray-900 dark:text-white">{{ formatCurrency(totalCurrentYear) }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Totale versamenti {{ nextFiscalYear }}</span>
          <span class="text-base font-bold text-gray-700 dark:text-gray-200">{{ formatCurrency(totalNextYear) }}</span>
        </div>
      </div>
    </div>

    <div v-else class="py-8 text-center text-gray-400 dark:text-gray-500">
      {{ store.deadlineForecastComplete ? 'Nessuna scadenza da mostrare con gli importi indicati.' : 'Inserisci la data di apertura per generare la previsione.' }}
    </div>

    <p class="mt-5 text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
      Orizzonte: 1 gennaio {{ store.fiscalYear }}–31 dicembre {{ nextFiscalYear }}. Scadenze e importi dell’anno successivo sono stime a normativa invariata. Addizionali regionali/comunali e adempimenti diversi dal Modello Redditi esclusi. Importi INPS di prima iscrizione restano stime finché INPS non emette gli F24; rateazioni, casi speciali e proroghe possono cambiare il calendario. Non sostituisce la consulenza di un professionista.
    </p>
  </div>
</template>
