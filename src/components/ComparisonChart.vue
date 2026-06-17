<script setup lang="ts">
import { computed } from 'vue'
import { useTaxStore } from '../store/taxStore'

const store = useTaxStore()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)
}

const chartData = computed(() => {
  const data = []

  // Forfettario
  if (store.showForfettario) {
    const res = store.forfettarioResult
    const rawSegments = [
      { label: 'Netto in Tasca', value: res.netto, color: 'bg-[#e2af0d]' },
      { label: 'INPS / Contributi', value: res.inps, color: 'bg-blue-500 dark:bg-blue-600' },
      { label: 'Tasse (Sostitutiva)', value: res.tasse, color: 'bg-red-500 dark:bg-red-600' }
    ]
    const validSegments = rawSegments.map(s => ({ ...s, value: Math.max(0, s.value) }))
    const sum = validSegments.reduce((a, b) => a + b.value, 0)
    data.push({
      id: 'forfettario',
      name: 'Regime Forfettario',
      netto: res.netto,
      segments: validSegments.filter(s => s.value > 0).map(s => ({
        ...s,
        percentage: sum > 0 ? (s.value / sum) * 100 : 0
      }))
    })
  }

  // Ordinario
  if (store.showOrdinario) {
    const res = store.ordinarioResult
    const spese = store.speseDeducibili
    const rawSegments = [
      { label: 'Netto in Tasca', value: res.netto, color: 'bg-[#e2af0d]' },
      { label: 'INPS / Contributi', value: res.inps, color: 'bg-blue-500 dark:bg-blue-600' },
      { label: 'Tasse (IRPEF+Locali)', value: res.tasse, color: 'bg-red-500 dark:bg-red-600' },
      { label: 'Spese Deducibili', value: spese, color: 'bg-gray-400 dark:bg-gray-500' }
    ]
    const validSegments = rawSegments.map(s => ({ ...s, value: Math.max(0, s.value) }))
    const sum = validSegments.reduce((a, b) => a + b.value, 0)
    data.push({
      id: 'ordinario',
      name: 'Regime Ordinario',
      netto: res.netto,
      segments: validSegments.filter(s => s.value > 0).map(s => ({
        ...s,
        percentage: sum > 0 ? (s.value / sum) * 100 : 0
      }))
    })
  }

  // SRL
  if (store.showSrl) {
    const res = store.srlResult
    const spese = store.speseDeducibili
    const costiFissi = 4000
    const totaleSpeseCosti = spese + costiFissi
    const rawSegments = [
      { label: 'Netto in Tasca', value: res.netto, color: 'bg-[#e2af0d]' },
      { label: 'INPS / Contributi', value: res.inps, color: 'bg-blue-500 dark:bg-blue-600' },
      { label: 'Tasse (Società+IRPEF)', value: res.tasse, color: 'bg-red-500 dark:bg-red-600' },
      { label: 'Spese & Costi Fissi', value: totaleSpeseCosti, color: 'bg-gray-400 dark:bg-gray-500' }
    ]
    const validSegments = rawSegments.map(s => ({ ...s, value: Math.max(0, s.value) }))
    const sum = validSegments.reduce((a, b) => a + b.value, 0)
    data.push({
      id: 'srl',
      name: 'Società (S.R.L.)',
      netto: res.netto,
      segments: validSegments.filter(s => s.value > 0).map(s => ({
        ...s,
        percentage: sum > 0 ? (s.value / sum) * 100 : 0
      }))
    })
  }

  // Dipendente
  if (store.showDipendente) {
    const res = store.dipendenteResult
    const rawSegments = [
      { label: 'Netto in Tasca', value: res.netto, color: 'bg-[#e2af0d]' },
      { label: 'INPS Totale (Dip.+Az.)', value: res.inps, color: 'bg-blue-500 dark:bg-blue-600' },
      { label: 'Tasse (IRPEF)', value: res.tasse, color: 'bg-red-500 dark:bg-red-600' }
    ]
    const validSegments = rawSegments.map(s => ({ ...s, value: Math.max(0, s.value) }))
    const sum = validSegments.reduce((a, b) => a + b.value, 0)
    data.push({
      id: 'dipendente',
      name: 'Lavoro Dipendente',
      netto: res.netto,
      segments: validSegments.filter(s => s.value > 0).map(s => ({
        ...s,
        percentage: sum > 0 ? (s.value / sum) * 100 : 0
      }))
    })
  }

  return data
})
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8 transition-shadow hover:shadow-md">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2 class="text-xl font-semibold flex items-center">
          <span class="bg-[#e2af0d]/10 text-[#e2af0d] p-2 rounded-lg mr-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </span>
          Confronto Visivo dei Regimi
        </h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Ripartizione percentuale del costo totale (€ {{ formatCurrency(store.fatturato) }})
        </p>
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-gray-600 dark:text-gray-400">
        <div class="flex items-center space-x-1.5">
          <span class="w-3.5 h-3.5 rounded bg-[#e2af0d]" />
          <span>Netto in tasca</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="w-3.5 h-3.5 rounded bg-blue-500 dark:bg-blue-600" />
          <span>INPS / Contributi</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="w-3.5 h-3.5 rounded bg-red-500 dark:bg-red-600" />
          <span>Tasse / Imposte</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="w-3.5 h-3.5 rounded bg-gray-400 dark:bg-gray-500" />
          <span>Spese / Costi Fissi</span>
        </div>
      </div>
    </div>

    <!-- Chart Body -->
    <div v-if="chartData.length > 0" class="space-y-6">
      <TransitionGroup name="chart-list" tag="div" class="space-y-6">
        <div v-for="row in chartData" :key="row.id" class="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-center group/row py-2 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/30 px-2 -mx-2">
          <!-- Regime Name and Netto Info -->
          <div class="md:col-span-1 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-start">
            <span class="font-bold text-gray-800 dark:text-gray-200 text-sm tracking-wide">{{ row.name }}</span>
            <span class="text-xs font-semibold text-[#e2af0d] md:mt-0.5">{{ formatCurrency(row.netto) }} <span class="text-[10px] text-gray-400 font-normal">netti</span></span>
          </div>

          <!-- Stacked Bar Column -->
          <div class="md:col-span-3">
            <div class="w-full flex h-8 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-950 p-0.5 shadow-inner border border-gray-200/40 dark:border-gray-800/40 relative">
              <div 
                v-for="(segment, idx) in row.segments" 
                :key="idx"
                :class="['h-full transition-all duration-500 relative group/segment first:rounded-l-lg last:rounded-r-lg cursor-pointer hover:brightness-105 active:scale-[0.99] flex items-center justify-center', segment.color]"
                :style="{ width: segment.percentage + '%' }"
              >
                <!-- Label inside if enough space -->
                <span v-if="segment.percentage > 12" class="text-[9px] font-extrabold text-white truncate px-1 select-none pointer-events-none drop-shadow-sm">
                  {{ formatCurrency(segment.value) }}
                </span>

                <!-- Tooltip -->
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover/segment:flex flex-col items-center z-50 pointer-events-none drop-shadow-lg animate-fade-in">
                  <div class="bg-gray-900 dark:bg-gray-950 text-white text-xs px-3 py-2 rounded-xl text-center leading-normal border border-gray-700/30 shadow-2xl">
                    <span class="font-bold block text-gray-300 text-[10px]">{{ segment.label }}</span>
                    <span class="font-extrabold text-white text-sm block mt-0.5">{{ formatCurrency(segment.value) }}</span>
                    <span class="text-[10px] text-gray-400 font-semibold block mt-0.5">({{ segment.percentage.toFixed(1) }}% del costo)</span>
                  </div>
                  <div class="w-2 h-2 bg-gray-900 dark:bg-gray-950 rotate-45 -mt-1 border-r border-b border-gray-700/30"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Empty State -->
    <div v-else class="py-8 text-center text-gray-400 dark:text-gray-500">
      <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
      <p class="text-sm">Seleziona almeno un regime nei controlli per visualizzare il grafico.</p>
    </div>
  </div>
</template>

<style scoped>
/* Transizioni per l'elenco dei grafici */
.chart-list-move,
.chart-list-enter-active,
.chart-list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.chart-list-enter-from,
.chart-list-leave-to {
  opacity: 0;
  transform: translateY(15px);
}

.chart-list-leave-active {
  position: absolute;
  width: 100%;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, 4px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.15s cubic-bezier(0, 0, 0.2, 1) forwards;
}
</style>
