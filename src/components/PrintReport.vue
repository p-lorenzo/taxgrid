<script setup lang="ts">
import { computed } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { useTaxStore } from '../store/taxStore'

const store = useTaxStore()
const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)
const formattedDate = computed(() => new Intl.DateTimeFormat('it-IT', { dateStyle: 'long', timeStyle: 'short' }).format(new Date()))

const activeColumns = computed(() => [
  store.showForfettario && { id: 'forfettario', name: 'Forfettario', precision: 'Alta precisione' },
  store.showOrdinario && { id: 'ordinario', name: 'Ordinario', precision: 'Stima' },
  store.showSrl && { id: 'srl', name: `SRL — ${store.srlDistribuzione === 'compenso' ? 'Compenso' : 'Utili'}`, precision: 'Stima semplificata' },
  store.showDipendente && { id: 'dipendente', name: 'Dipendente', precision: 'Stima' },
].filter(Boolean) as Array<{ id: 'forfettario' | 'ordinario' | 'srl' | 'dipendente'; name: string; precision: string }>)

const rows = computed(() => [
  {
    label: 'Fatturato / costo contributivo stimato',
    forfettario: formatCurrency(store.effectiveFatturato),
    ordinario: formatCurrency(store.effectiveFatturato),
    srl: formatCurrency(store.effectiveFatturato),
    dipendente: formatCurrency(store.dipendenteResult.fatturatoEquivalente),
  },
  {
    label: 'Costi operativi reali',
    forfettario: formatCurrency(store.costiOperativiReali),
    ordinario: formatCurrency(store.costiOperativiReali),
    srl: `${formatCurrency(store.costiOperativiReali)} + ${formatCurrency(store.srlCostiFissi)} amministrativi`,
    dipendente: formatCurrency(store.costiOperativiReali),
  },
  ...(store.advancedMode ? [{
    label: 'Costi fiscalmente deducibili',
    forfettario: 'Non applicabili',
    ordinario: formatCurrency(store.costiFiscalmenteDeducibili),
    srl: 'Inclusi nella stima operativa',
    dipendente: 'Non applicabili',
  }] : []),
  {
    label: 'Contributi previdenziali',
    forfettario: formatCurrency(store.forfettarioResult.inps),
    ordinario: formatCurrency(store.ordinarioResult.inps),
    srl: formatCurrency(store.srlResult.inps),
    dipendente: formatCurrency(store.dipendenteResult.inps),
  },
  {
    label: 'Imposte stimate',
    forfettario: formatCurrency(store.forfettarioResult.tasse),
    ordinario: formatCurrency(store.ordinarioResult.tasse),
    srl: formatCurrency(store.srlResult.tasse),
    dipendente: formatCurrency(store.dipendenteResult.tasse),
  },
  {
    label: 'Netto annuo in tasca',
    forfettario: formatCurrency(store.forfettarioResult.netto),
    ordinario: formatCurrency(store.ordinarioResult.netto),
    srl: formatCurrency(store.srlResult.netto),
    dipendente: formatCurrency(store.dipendenteResult.netto),
    isBold: true,
  },
  {
    label: `Netto mensile (${store.mesiParagone} mensilità)`,
    forfettario: formatCurrency(store.forfettarioResult.nettoMensile),
    ordinario: formatCurrency(store.ordinarioResult.nettoMensile),
    srl: formatCurrency(store.srlResult.nettoMensile),
    dipendente: formatCurrency(store.dipendenteResult.nettoMensile),
    isBold: true,
  },
])

const stepsFor = (id: 'forfettario' | 'ordinario' | 'srl' | 'dipendente') => {
  if (id === 'forfettario') return store.forfettarioResult.breakdown.steps
  if (id === 'ordinario') return store.ordinarioResult.breakdown.steps
  if (id === 'srl') return store.srlResult.breakdown.steps
  return store.dipendenteResult.breakdown.steps
}
</script>

<template>
  <div class="print-report">
    <div class="border-b-2 border-gray-900 pb-4 mb-8">
      <div class="flex justify-between items-baseline">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 font-serif">Simulazione Fiscale — TaxGrid</h1>
        <p class="text-sm font-semibold text-gray-700 font-sans">Anno fiscale {{ store.fiscalYear }}</p>
      </div>
      <div class="mt-2 flex justify-between text-xs text-gray-500 font-sans">
        <p>Report comparativo orientativo con livello di precisione dichiarato per ogni modello.</p>
        <p>Data simulazione: {{ formattedDate }}</p>
      </div>
    </div>

    <div class="mb-8 p-4 bg-gray-50 border border-gray-300 rounded-lg print:break-inside-avoid font-sans">
      <h2 class="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">Parametri della simulazione</h2>
      <div class="grid grid-cols-4 gap-y-3 gap-x-6 text-xs text-gray-700">
        <div><span class="font-semibold block text-gray-500 text-[10px] uppercase">Input</span><span class="font-bold text-sm">{{ formatCurrency(store.fatturato) }} ({{ store.inputMode.toUpperCase() }})</span></div>
        <div><span class="font-semibold block text-gray-500 text-[10px] uppercase">Costi reali</span><span class="font-bold text-sm">{{ formatCurrency(store.costiOperativiReali) }}</span></div>
        <div><span class="font-semibold block text-gray-500 text-[10px] uppercase">ATECO sintetico</span><span class="font-bold text-sm">{{ store.atecoCategory }} — {{ (store.atecoCoef * 100).toFixed(0) }}%</span></div>
        <div><span class="font-semibold block text-gray-500 text-[10px] uppercase">Anno fiscale</span><span class="font-bold text-sm">{{ store.fiscalYear }}</span></div>
        <div v-if="store.advancedMode"><span class="font-semibold block text-gray-500 text-[10px] uppercase">Costi deducibili</span><span class="font-bold text-sm">{{ formatCurrency(store.costiFiscalmenteDeducibili) }}</span></div>
        <div v-if="store.advancedMode"><span class="font-semibold block text-gray-500 text-[10px] uppercase">Detraibili 19%</span><span class="font-bold text-sm">{{ formatCurrency(store.speseDetraibili) }}</span></div>
        <div v-if="store.advancedMode && store.hasLavoroDipendente"><span class="font-semibold block text-gray-500 text-[10px] uppercase">RAL concomitante</span><span class="font-bold text-sm">{{ formatCurrency(store.ralDipendente) }}</span></div>
        <div v-if="store.advancedMode"><span class="font-semibold block text-gray-500 text-[10px] uppercase">Massimale INPS</span><span class="font-bold text-sm">{{ formatCurrency(store.massimaleInps) }}</span></div>
      </div>
    </div>

    <div v-if="store.validationIssues.length" class="mb-8 border border-amber-300 bg-amber-50 rounded-lg p-4 text-xs text-amber-900">
      <p class="font-bold uppercase mb-2">Avvisi scenario</p>
      <ul class="list-disc pl-4 space-y-1"><li v-for="(issue, index) in store.validationIssues" :key="index">{{ issue.message }}</li></ul>
    </div>

    <div class="mb-10 print:break-inside-avoid font-sans">
      <h2 class="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Confronto</h2>
      <table class="w-full border-collapse border border-gray-400 text-xs text-left">
        <thead><tr class="bg-gray-100 border-b-2 border-gray-400"><th class="p-3 border border-gray-400">Voce</th><th v-for="col in activeColumns" :key="col.id" class="p-3 border border-gray-400 text-right"><span class="block">{{ col.name }}</span><span class="text-[9px] uppercase text-gray-500">{{ col.precision }}</span></th></tr></thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="index" :class="row.isBold ? 'bg-gray-100 font-bold border-y-2 border-gray-900' : ''">
            <td class="p-2.5 border border-gray-400">{{ row.label }}</td>
            <td v-for="col in activeColumns" :key="col.id" class="p-2.5 border border-gray-400 text-right font-mono">{{ row[col.id] }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-8 font-sans">
      <h2 class="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Dettaglio analitico</h2>
      <div class="space-y-8">
        <div v-for="col in activeColumns" :key="col.id" class="border border-gray-300 rounded-lg p-5 print:break-inside-avoid">
          <h3 class="text-xs font-bold uppercase border-b border-gray-300 pb-2 mb-3">{{ col.name }} — {{ col.precision }}</h3>
          <table class="w-full text-[11px]">
            <tbody><tr v-for="(step, index) in stepsFor(col.id)" :key="index" class="border-b border-gray-200" :class="step.operator === '=' ? 'font-bold bg-gray-50' : ''"><td class="py-2 w-10 text-center font-mono">{{ step.operator }}</td><td class="py-2"><span>{{ step.label }}</span><p v-if="step.details" class="text-[9px] text-gray-500 italic">{{ step.details }}</p></td><td class="py-2 text-right font-mono">{{ formatCurrency(step.value) }}</td></tr></tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="mt-12 pt-8 border-t-2 border-gray-400 flex items-center justify-between gap-6 print:break-inside-avoid font-sans">
      <div class="text-[10px] text-gray-500 max-w-xl leading-relaxed">
        <p class="font-bold text-gray-700 mb-1 uppercase">Disclaimer</p>
        <p>Simulazione orientativa riferita al {{ store.fiscalYear }}. Ordinario, dipendente, addizionali e SRL includono assunzioni semplificate; la SRL non modella una base IRAP autonoma. Gli importi rappresentano il carico economico annuo e non il calendario di saldo e acconti. Il report non costituisce consulenza fiscale, previdenziale o societaria.</p>
      </div>
      <div class="flex items-center gap-4 border border-gray-300 p-3.5 bg-gray-50 rounded-lg">
        <qrcode-vue :value="store.buildShareUrl()" :size="70" level="M" render-as="svg" :margin="1" />
        <div class="text-[10px] text-gray-700 max-w-[190px]"><p class="font-bold text-gray-900 text-xs mb-1">TaxGrid.it</p><p>Scansiona per ricaricare questa simulazione, incluso l’anno fiscale.</p></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .print-report { background-color: #fff !important; color: #000055 !important; }
}
</style>
