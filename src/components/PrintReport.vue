<script setup lang="ts">
import { useTaxStore } from '../store/taxStore'
import { computed } from 'vue'
import QrcodeVue from 'qrcode.vue'

const store = useTaxStore()

const formatCurrency = (val: number | string) => {
  if (typeof val === 'string') return val
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val)
}

const formattedDate = computed(() => {
  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(new Date())
})

// Helper methods to calculate values for the comparison table
const getAddizionaliOrd = () => {
  const imponibileBase = Math.max(store.effectiveFatturato - store.speseDeducibili, 0)
  const imponibilePivaFiscale = Math.max(imponibileBase - store.ordinarioResult.inps, 0)
  const regVal = store.advancedMode ? store.addizionaleRegionale : 0
  const comVal = store.advancedMode ? store.addizionaleComunale : 0
  return imponibilePivaFiscale * (regVal + comVal) / 100
}

const getAddizionaliSrl = () => {
  if (store.srlDistribuzione !== 'compenso') return 0
  const utileLordoOperativo = Math.max(store.effectiveFatturato - store.speseDeducibili - 4000, 0)
  const aliquotaGsAzienda = (store.advancedMode && store.hasLavoroDipendente) ? 0.16 : 0.2239
  const compensoLordo = utileLordoOperativo / (1 + aliquotaGsAzienda)
  const capInps = store.advancedMode ? store.massimaleInps : 119650
  const aliquotaGsAmministratore = (store.advancedMode && store.hasLavoroDipendente) ? 0.08 : 0.1120
  const inpsAmministratore = Math.min(compensoLordo, capInps) * aliquotaGsAmministratore
  const imponibileFiscale = Math.max(compensoLordo - inpsAmministratore, 0)
  const regVal = store.advancedMode ? store.addizionaleRegionale : 0
  const comVal = store.advancedMode ? store.addizionaleComunale : 0
  return imponibileFiscale * (regVal + comVal) / 100
}

const getAddizionaliDip = () => {
  const inpsDip = store.dipendenteResult.inpsDipendente || 0
  const imponibileFiscale = store.dipendenteResult.ral - inpsDip
  const regVal = store.advancedMode ? store.addizionaleRegionale : 0
  const comVal = store.advancedMode ? store.addizionaleComunale : 0
  return imponibileFiscale * (regVal + comVal) / 100
}

const getDetrazioniSrl = () => {
  if (store.srlDistribuzione !== 'compenso') return 0
  const utileLordoOperativo = Math.max(store.effectiveFatturato - store.speseDeducibili - 4000, 0)
  const aliquotaGsAzienda = (store.advancedMode && store.hasLavoroDipendente) ? 0.16 : 0.2239
  const aliquotaGsAmministratore = (store.advancedMode && store.hasLavoroDipendente) ? 0.08 : 0.1120
  const compensoLordo = utileLordoOperativo / (1 + aliquotaGsAzienda)
  const capInps = store.advancedMode ? store.massimaleInps : 119650
  const inpsAmministratore = Math.min(compensoLordo, capInps) * aliquotaGsAmministratore
  const imponibileFiscale = Math.max(compensoLordo - inpsAmministratore, 0)
  
  const ral = store.hasLavoroDipendente ? store.ralDipendente : 0
  const imponibileFiscaleTotal = imponibileFiscale + ral
  
  const calcolaDetrazioniDipendente = (imponibile: number) => {
    if (imponibile <= 15000) return 1955
    if (imponibile <= 28000) return 1910 + 1190 * ((28000 - imponibile) / 13000)
    if (imponibile <= 50000) return 1910 * ((50000 - imponibile) / 22000)
    return 0
  }
  const detrazioniTotale = calcolaDetrazioniDipendente(imponibileFiscaleTotal)
  const detrazioniSuRal = ral > 0 ? calcolaDetrazioniDipendente(ral) : 0
  const detrazioniImpresa = Math.max(detrazioniTotale - detrazioniSuRal, 0)
  
  const scontoDetraibili = store.speseDetraibili * 0.19
  return detrazioniImpresa + (store.advancedMode ? scontoDetraibili : 0)
}

const getDetrazioniDip = () => {
  const inpsDip = store.dipendenteResult.inpsDipendente || 0
  const imponibileFiscale = store.dipendenteResult.ral - inpsDip
  
  const calcolaDetrazioniDipendente = (imponibile: number) => {
    if (imponibile <= 15000) return 1955
    if (imponibile <= 28000) return 1910 + 1190 * ((28000 - imponibile) / 13000)
    if (imponibile <= 50000) return 1910 * ((50000 - imponibile) / 22000)
    return 0
  }
  return calcolaDetrazioniDipendente(imponibileFiscale)
}

const activeColumns = computed(() => {
  const cols = []
  if (store.showForfettario) cols.push({ id: 'forfettario', name: 'Regime Forfettario' })
  if (store.showOrdinario) cols.push({ id: 'ordinario', name: 'Regime Ordinario' })
  if (store.showSrl) cols.push({ id: 'srl', name: `S.R.L. (${store.srlDistribuzione === 'compenso' ? 'Compenso' : 'Utili'})` })
  if (store.showDipendente) cols.push({ id: 'dipendente', name: 'Lavoro Dipendente' })
  return cols
})

const rows = computed(() => {
  const result: any[] = []

  // Row 1: Lordo / Costo Azienda
  result.push({
    label: 'Fatturato Lordo / Costo Azienda',
    forfettario: formatCurrency(store.effectiveFatturato),
    ordinario: formatCurrency(store.effectiveFatturato),
    srl: formatCurrency(store.effectiveFatturato),
    dipendente: formatCurrency(store.effectiveFatturato),
  })

  // Row 2: Coefficiente ATECO
  result.push({
    label: 'Coefficiente ATECO',
    forfettario: `${(store.atecoCoef * 100).toFixed(0)}%`,
    ordinario: 'N/A',
    srl: 'N/A',
    dipendente: 'N/A',
  })

  // Row 3: Spese Deducibili / Costi Gestione
  result.push({
    label: 'Spese Deducibili / Costi Gestione',
    forfettario: `${formatCurrency(store.effectiveFatturato * (1 - store.atecoCoef))} (Forfettarie)`,
    ordinario: formatCurrency(store.speseDeducibili),
    srl: `${formatCurrency(store.speseDeducibili)} (Op.) + ${formatCurrency(4000)} (Fissi SRL)`,
    dipendente: '—',
  })

  // Row 4: INPS a Carico Azienda
  let inpsAziendaSrl = 0
  if (store.srlDistribuzione === 'compenso') {
    const utileLordoOperativo = Math.max(store.effectiveFatturato - store.speseDeducibili - 4000, 0)
    const aliquotaGsAzienda = (store.advancedMode && store.hasLavoroDipendente) ? 0.16 : 0.2239
    const compensoLordo = utileLordoOperativo / (1 + aliquotaGsAzienda)
    const capInps = store.advancedMode ? store.massimaleInps : 119650
    inpsAziendaSrl = Math.min(compensoLordo, capInps) * aliquotaGsAzienda
  }
  const inpsDatoreDip = store.dipendenteResult.inpsDatore || 0

  result.push({
    label: 'INPS a carico Azienda / Datore',
    forfettario: '—',
    ordinario: '—',
    srl: formatCurrency(inpsAziendaSrl),
    dipendente: formatCurrency(inpsDatoreDip),
  })

  // Row 5: RAL / Retribuzione Lorda
  let compensoLordoSrl = 0
  if (store.srlDistribuzione === 'compenso') {
    const utileLordoOperativo = Math.max(store.effectiveFatturato - store.speseDeducibili - 4000, 0)
    const aliquotaGsAzienda = (store.advancedMode && store.hasLavoroDipendente) ? 0.16 : 0.2239
    compensoLordoSrl = utileLordoOperativo / (1 + aliquotaGsAzienda)
  }
  const ralDip = store.dipendenteResult.ral || 0

  result.push({
    label: 'RAL / Compenso Lordo',
    forfettario: '—',
    ordinario: '—',
    srl: compensoLordoSrl > 0 ? formatCurrency(compensoLordoSrl) : '— (Distribuzione Utili)',
    dipendente: formatCurrency(ralDip),
  })

  // Row 6: INPS a Carico Lavoratore / Titolare
  let inpsPersSrl = 0
  if (store.srlDistribuzione === 'compenso') {
    const utileLordoOperativo = Math.max(store.effectiveFatturato - store.speseDeducibili - 4000, 0)
    const aliquotaGsAzienda = (store.advancedMode && store.hasLavoroDipendente) ? 0.16 : 0.2239
    const aliquotaGsAmministratore = (store.advancedMode && store.hasLavoroDipendente) ? 0.08 : 0.1120
    const compensoLordo = utileLordoOperativo / (1 + aliquotaGsAzienda)
    const capInps = store.advancedMode ? store.massimaleInps : 119650
    inpsPersSrl = Math.min(compensoLordo, capInps) * aliquotaGsAmministratore
  }
  const inpsDip = store.dipendenteResult.inpsDipendente || 0

  result.push({
    label: 'INPS a carico Lavoratore / Titolare',
    forfettario: formatCurrency(store.forfettarioResult.inps),
    ordinario: formatCurrency(store.ordinarioResult.inps),
    srl: formatCurrency(inpsPersSrl),
    dipendente: formatCurrency(inpsDip),
  })

  // Row 7: Imponibile Fiscale
  let imponibileFiscaleSrl = 0
  const utileLordoOperativo = Math.max(store.effectiveFatturato - store.speseDeducibili - 4000, 0)
  if (store.srlDistribuzione === 'compenso') {
    const aliquotaGsAzienda = (store.advancedMode && store.hasLavoroDipendente) ? 0.16 : 0.2239
    const aliquotaGsAmministratore = (store.advancedMode && store.hasLavoroDipendente) ? 0.08 : 0.1120
    const compensoLordo = utileLordoOperativo / (1 + aliquotaGsAzienda)
    const capInps = store.advancedMode ? store.massimaleInps : 119650
    const inpsAmministratore = Math.min(compensoLordo, capInps) * aliquotaGsAmministratore
    imponibileFiscaleSrl = Math.max(compensoLordo - inpsAmministratore, 0)
  } else {
    imponibileFiscaleSrl = utileLordoOperativo
  }

  const imponibileForf = Math.max(store.effectiveFatturato * store.atecoCoef - store.forfettarioResult.inps, 0)
  const imponibileBaseOrd = Math.max(store.effectiveFatturato - store.speseDeducibili, 0)
  const imponibileOrd = Math.max(imponibileBaseOrd - store.ordinarioResult.inps, 0)
  const imponibileDip = store.dipendenteResult.ral - inpsDip

  result.push({
    label: 'Imponibile Fiscale Netto',
    forfettario: formatCurrency(imponibileForf),
    ordinario: formatCurrency(imponibileOrd),
    srl: formatCurrency(imponibileFiscaleSrl),
    dipendente: formatCurrency(imponibileDip),
  })

  // Row 8: Imposta di Riferimento / Tasse
  result.push({
    label: 'Imposte Principali (IRPEF / IRES / Sostitutiva)',
    forfettario: formatCurrency(store.forfettarioResult.tasse),
    ordinario: formatCurrency(store.ordinarioResult.tasse - (store.advancedMode ? getAddizionaliOrd() : 0)),
    srl: formatCurrency(store.srlResult.tasse - (store.advancedMode ? getAddizionaliSrl() : 0)),
    dipendente: formatCurrency(store.dipendenteResult.tasse - (store.advancedMode ? getAddizionaliDip() : 0)),
  })

  // Row 9: Addizionali Locali
  if (store.advancedMode) {
    result.push({
      label: 'Addizionali Locali (Regionale & Comunale)',
      forfettario: '—',
      ordinario: formatCurrency(getAddizionaliOrd()),
      srl: formatCurrency(getAddizionaliSrl()),
      dipendente: formatCurrency(getAddizionaliDip()),
    })
  }

  // Row 10: Detrazioni
  if (store.advancedMode) {
    result.push({
      label: 'Detrazioni d\'Imposta / Spese Detraibili 19%',
      forfettario: '—',
      ordinario: formatCurrency(store.speseDetraibili * 0.19),
      srl: formatCurrency(getDetrazioniSrl()),
      dipendente: formatCurrency(getDetrazioniDip()),
    })
  }

  // Row 11: Netto Annuo in Tasca
  result.push({
    label: 'Netto Annuo in Tasca',
    forfettario: formatCurrency(store.forfettarioResult.netto),
    ordinario: formatCurrency(store.ordinarioResult.netto),
    srl: formatCurrency(store.srlResult.netto),
    dipendente: formatCurrency(store.dipendenteResult.netto),
    isBold: true,
  })

  // Row 12: Numero di Mensilità
  result.push({
    label: 'Mensilità di Riferimento',
    forfettario: `${store.mesiParagone}`,
    ordinario: `${store.mesiParagone}`,
    srl: `${store.mesiParagone}`,
    dipendente: `${store.mesiParagone}`,
  })

  // Row 13: Paragone Mensile
  result.push({
    label: 'Paragone Netto Mensile',
    forfettario: formatCurrency(store.forfettarioResult.nettoMensile),
    ordinario: formatCurrency(store.ordinarioResult.nettoMensile),
    srl: formatCurrency(store.srlResult.nettoMensile),
    dipendente: formatCurrency(store.dipendenteResult.nettoMensile),
    isBold: true,
  })

  return result
})
</script>

<template>
  <div class="print-report">
    <!-- Intestazione Formale -->
    <div class="border-b-2 border-gray-900 pb-4 mb-8">
      <div class="flex justify-between items-baseline">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 font-serif">Simulazione Fiscale — TaxGrid</h1>
        <p class="text-sm font-semibold text-gray-700 font-sans">Normativa Fiscale 2025</p>
      </div>
      <div class="mt-2 flex justify-between text-xs text-gray-500 font-sans">
        <p>Report comparativo ufficiale generato per uso analitico.</p>
        <p>Data Simulazione: {{ formattedDate }}</p>
      </div>
    </div>

    <!-- Parametri di Configurazione -->
    <div class="mb-8 p-4 bg-gray-55 border border-gray-300 rounded-lg print:break-inside-avoid font-sans">
      <h2 class="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">Parametri di Input della Simulazione</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-6 text-xs text-gray-700">
        <div>
          <span class="font-semibold block text-gray-500 text-[10px] uppercase">Fatturato Annuo / Costo Azienda</span>
          <span class="font-bold text-sm text-gray-900">{{ formatCurrency(store.effectiveFatturato) }}</span>
        </div>
        <div>
          <span class="font-semibold block text-gray-500 text-[10px] uppercase">Spese Deducibili / Operative</span>
          <span class="font-bold text-sm text-gray-900">{{ formatCurrency(store.speseDeducibili) }}</span>
        </div>
        <div v-if="store.advancedMode">
          <span class="font-semibold block text-gray-500 text-[10px] uppercase">Spese Detraibili (19%)</span>
          <span class="font-bold text-sm text-gray-900">{{ formatCurrency(store.speseDetraibili) }}</span>
        </div>
        <div>
          <span class="font-semibold block text-gray-500 text-[10px] uppercase">Codice ATECO (Coefficiente)</span>
          <span class="font-bold text-sm text-gray-900">{{ store.atecoCategory }} ({{ (store.atecoCoef * 100).toFixed(0) }}%)</span>
        </div>
        <div v-if="store.advancedMode && store.hasLavoroDipendente">
          <span class="font-semibold block text-gray-500 text-[10px] uppercase">Cumulo Dipendente (RAL)</span>
          <span class="font-bold text-sm text-gray-900">{{ formatCurrency(store.ralDipendente) }} {{ store.dipendenteFullTime ? '(Full-Time)' : '' }}</span>
        </div>
        <div v-if="store.advancedMode">
          <span class="font-semibold block text-gray-500 text-[10px] uppercase">Addizionali Locali</span>
          <span class="font-bold text-sm text-gray-900">Reg: {{ store.addizionaleRegionale }}%, Com: {{ store.addizionaleComunale }}%</span>
        </div>
        <div v-if="store.advancedMode">
          <span class="font-semibold block text-gray-500 text-[10px] uppercase">Massimale INPS</span>
          <span class="font-bold text-sm text-gray-900">{{ formatCurrency(store.massimaleInps) }}</span>
        </div>
        <div>
          <span class="font-semibold block text-gray-500 text-[10px] uppercase">Mensilità Paragone</span>
          <span class="font-bold text-sm text-gray-900">{{ store.mesiParagone }} mensilità</span>
        </div>
      </div>
    </div>

    <!-- Tabella Comparativa Principale -->
    <div class="mb-10 print:break-inside-avoid font-sans">
      <h2 class="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Tabella Comparativa dei Regimi</h2>
      <table class="w-full border-collapse border border-gray-400 text-xs text-left">
        <thead>
          <tr class="bg-gray-100 text-gray-800 font-bold border-b-2 border-gray-400">
            <th class="p-3 border border-gray-400 w-1/3">Dettaglio Voce Calcolata</th>
            <th 
              v-for="col in activeColumns" 
              :key="col.id" 
              class="p-3 border border-gray-400 text-right font-bold w-1/6"
            >
              {{ col.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(row, idx) in rows" 
            :key="idx" 
            :class="[
              row.isBold ? 'bg-gray-100 font-bold border-t-2 border-b-2 border-gray-900 text-sm' : 'border-b border-gray-300',
              idx % 2 === 0 && !row.isBold ? 'bg-gray-50/50' : ''
            ]"
          >
            <td class="p-2.5 border border-gray-400 font-medium text-gray-800">{{ row.label }}</td>
            <td 
              v-for="col in activeColumns" 
              :key="col.id" 
              class="p-2.5 border border-gray-400 text-right font-mono text-gray-900"
              :class="{'font-bold text-gray-900': row.isBold}"
            >
              {{ row[col.id as 'forfettario' | 'ordinario' | 'srl' | 'dipendente'] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Spaccato Matematico di Ciascun Regime -->
    <div class="mt-8 font-sans">
      <h2 class="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider print:break-after-avoid">Dettaglio Analitico dei Calcoli</h2>
      
      <div class="space-y-8">
        <div 
          v-for="col in activeColumns" 
          :key="col.id" 
          class="border border-gray-300 rounded-lg p-5 print:break-inside-avoid"
        >
          <h3 class="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-2 mb-3">
            Sviluppo Formula: {{ col.name }}
          </h3>
          
          <table class="w-full text-[11px] text-left">
            <thead>
              <tr class="text-gray-500 font-semibold border-b border-gray-300">
                <th class="pb-1 w-10 text-center">Op</th>
                <th class="pb-1">Descrizione Voce</th>
                <th class="pb-1 text-right w-32">Importo</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(step, sIdx) in (col.id === 'forfettario' ? store.forfettarioResult.breakdown.steps : 
                                      col.id === 'ordinario' ? store.ordinarioResult.breakdown.steps : 
                                      col.id === 'srl' ? store.srlResult.breakdown.steps : 
                                      store.dipendenteResult.breakdown.steps)" 
                :key="sIdx"
                class="border-b border-gray-200 py-1.5"
                :class="{'font-bold bg-gray-50/70': step.operator === '='}"
              >
                <td class="py-2 text-center text-gray-700 font-bold font-mono">
                  {{ step.operator || ' ' }}
                </td>
                <td class="py-2 text-gray-850">
                  <span class="font-semibold text-gray-800">{{ step.label }}</span>
                  <p v-if="step.details" class="text-[10px] text-gray-500 mt-0.5 font-normal leading-normal italic">
                    {{ step.details }}
                  </p>
                </td>
                <td class="py-2 text-right font-mono text-gray-900 font-medium">
                  {{ formatCurrency(step.value) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- QR Code e Disclaimer Legale -->
    <div class="mt-12 pt-8 border-t-2 border-gray-400 flex flex-col md:flex-row items-center justify-between gap-6 print:break-inside-avoid font-sans">
      <div class="text-[10px] text-gray-500 max-w-xl">
        <p class="font-bold text-gray-700 mb-1 uppercase tracking-wider text-[9px]">Disclaimer Legale</p>
        <p class="leading-relaxed">
          Questo documento contiene una simulazione puramente indicativa basata sulle disposizioni normative vigenti in Italia per l'anno fiscale 2025. I risultati esposti non costituiscono parere professionale o consulenza finanziaria/societaria/fiscale. Si raccomanda di validare ogni calcolo e strategia previdenziale o societaria con un dottore commercialista o un professionista abilitato.
        </p>
      </div>
      <div class="flex items-center gap-4 border border-gray-300 p-3.5 bg-gray-50 rounded-lg">
        <qrcode-vue 
          :value="store.buildShareUrl()" 
          :size="70" 
          level="H"
          render-as="svg"
          :margin="1"
        />
        <div class="text-[10px] text-gray-700 max-w-[200px]">
          <p class="font-bold text-gray-900 text-xs mb-1">TaxGrid.it</p>
          <p class="leading-normal">Scansiona questo QR Code per ricaricare la simulazione interattiva ed effettuare nuove prove direttamente su TaxGrid.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .print-report {
    background-color: #ffffff !important;
    color: #000055 !important;
  }
}
</style>
