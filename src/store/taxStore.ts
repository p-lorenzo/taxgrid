import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { FISCAL_RULES_2026, FISCAL_YEAR } from '../fiscal-rules'
import type {
  BusinessFund,
  ContributionRelief,
  EnrollmentStatus,
  FiscalYear,
  PrevidentialFund,
} from '../fiscal-rules'
import {
  calculateAdministratorContributions,
  calculateBusinessContributions,
  calculatePersonalTaxPosition,
  describeProgressiveTax,
} from '../tax-engine'

export interface AtecoCategory {
  id: string
  name: string
  coef: number
}

export interface BreakdownStep {
  label: string
  value: number
  operator?: '+' | '-' | '=' | '*' | '/' | ''
  details?: string
}

export interface ValidationIssue {
  scope: 'forfettario' | 'ordinario' | 'srl' | 'dipendente' | 'global'
  severity: 'info' | 'warning' | 'error'
  message: string
}

export const ATECO_CATEGORIES: AtecoCategory[] = [
  { id: 'professionisti', name: 'Professionisti (78%)', coef: 0.78 },
  { id: 'artigiani_imprese', name: 'Artigiani e Imprese (67%)', coef: 0.67 },
  { id: 'commercio', name: 'Commercio (40%)', coef: 0.40 },
  { id: 'servizi', name: 'Servizi (67%)', coef: 0.67 },
  { id: 'industrie_alimentari', name: 'Industrie alimentari (40%)', coef: 0.40 },
  { id: 'commercio_ambulante_alim', name: 'Commercio ambulante alimentari (40%)', coef: 0.40 },
  { id: 'commercio_ambulante_non_alim', name: 'Commercio ambulante altri prodotti (54%)', coef: 0.54 },
  { id: 'costruzioni_immobiliari', name: 'Costruzioni e immobiliari (86%)', coef: 0.86 },
  { id: 'intermediari', name: 'Intermediari del commercio (62%)', coef: 0.62 },
  { id: 'custom', name: 'Coefficiente personalizzato', coef: 0.78 },
]

export const ALIQUOTA_INPS_DATORE = FISCAL_RULES_2026.employee.estimatedEmployerContributionRate

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

export const useTaxStore = defineStore('taxStore', () => {
  const fiscalYear = ref<FiscalYear>(FISCAL_YEAR)
  const fatturato = ref(50_000)
  const inputMode = ref<'fatturato' | 'ral'>('fatturato')
  const advancedMode = ref(false)
  const costiOperativiReali = ref(5_000)
  const costiFiscalmenteDeducibili = ref(5_000)
  const speseDetraibili = ref(0)
  const atecoCategory = ref('professionisti')
  const atecoCoef = ref(0.78)
  const mesiParagone = ref(12)

  const hasLavoroDipendente = ref(false)
  const ralDipendente = ref(0)
  const redditoDipendentePrecedente = ref(0)
  const dipendenteFullTime = ref(false)
  const aliquotaInpsDipendente = ref<number>(FISCAL_RULES_2026.employee.estimatedContributionRate * 100)
  const aliquotaContributivaDatore = ref<number>(FISCAL_RULES_2026.employee.estimatedEmployerContributionRate * 100)

  const addizionaleRegionale = ref<number>(FISCAL_RULES_2026.localTaxes.estimatedRegionalRate)
  const addizionaleComunale = ref<number>(FISCAL_RULES_2026.localTaxes.estimatedMunicipalRate)
  const massimaleInps = ref<number>(FISCAL_RULES_2026.inps.gestioneSeparata.maximumIncome)
  const businessEnrollment = ref<EnrollmentStatus>('unknown')

  const showForfettario = ref(true)
  const showOrdinario = ref(true)
  const showSrl = ref(true)
  const showDipendente = ref(true)
  const cardOrder = ref<string[]>(['forfettario', 'ordinario', 'srl', 'dipendente'])

  const forfettarioCassa = ref<PrevidentialFund>('gestione_separata')
  const forfettarioStartup = ref(false)
  const forfettarioContributionRelief = ref<ContributionRelief>('none')

  const ordinarioCassa = ref<PrevidentialFund>('gestione_separata')
  const ordinarioContributionRelief = ref<ContributionRelief>('none')

  const srlDistribuzione = ref<'compenso' | 'utili'>('compenso')
  const srlCostiFissi = ref<number>(FISCAL_RULES_2026.srl.estimatedFixedCosts)
  const srlSocioLavoratore = ref(false)
  const srlSocioCassa = ref<BusinessFund>('artigiani')
  const srlContributionRelief = ref<ContributionRelief>('none')

  const expensesMode = computed({
    get: () => advancedMode.value ? 'advanced' : 'simple',
    set: (value: 'simple' | 'advanced') => { advancedMode.value = value === 'advanced' },
  })

  // Alias retrocompatibile: il nuovo codice usa i due campi espliciti.
  const speseDeducibili = computed({
    get: () => advancedMode.value ? costiFiscalmenteDeducibili.value : costiOperativiReali.value,
    set: (value: number) => {
      costiOperativiReali.value = Number(value)
      costiFiscalmenteDeducibili.value = Number(value)
    },
  })

  const forfettarioRiduzione35 = computed({
    get: () => forfettarioContributionRelief.value === 'forfettario_35',
    set: (active: boolean) => { forfettarioContributionRelief.value = active ? 'forfettario_35' : 'none' },
  })
  const forfettarioRiduzione50 = computed({
    get: () => ['pensioner_50', 'new_entrant_2025_50'].includes(forfettarioContributionRelief.value),
    set: (active: boolean) => { forfettarioContributionRelief.value = active ? 'pensioner_50' : 'none' },
  })
  const ordinarioRiduzione50 = computed({
    get: () => ['pensioner_50', 'new_entrant_2025_50'].includes(ordinarioContributionRelief.value),
    set: (active: boolean) => { ordinarioContributionRelief.value = active ? 'pensioner_50' : 'none' },
  })
  const srlRiduzione50 = computed({
    get: () => ['pensioner_50', 'new_entrant_2025_50'].includes(srlContributionRelief.value),
    set: (active: boolean) => { srlContributionRelief.value = active ? 'pensioner_50' : 'none' },
  })
  const srlCassa = computed({
    get: (): PrevidentialFund => srlSocioLavoratore.value ? srlSocioCassa.value : 'gestione_separata',
    set: (fund: PrevidentialFund) => {
      srlSocioLavoratore.value = fund !== 'gestione_separata'
      if (fund !== 'gestione_separata') srlSocioCassa.value = fund
    },
  })

  const employerContributionRate = computed(() => Math.max(aliquotaContributivaDatore.value, 0) / 100)
  const employeeContributionRate = computed(() => Math.max(aliquotaInpsDipendente.value, 0) / 100)
  const effectiveFatturato = computed(() => inputMode.value === 'ral'
    ? fatturato.value * (1 + employerContributionRate.value)
    : fatturato.value)
  const deductibleCosts = computed(() => advancedMode.value
    ? costiFiscalmenteDeducibili.value
    : costiOperativiReali.value)
  const hasJob = computed(() => advancedMode.value && hasLavoroDipendente.value)
  const employeeTaxableIncome = computed(() => hasJob.value
    ? Math.max(ralDipendente.value * (1 - employeeContributionRate.value), 0)
    : 0)
  const genericTaxCredits = computed(() => advancedMode.value
    ? Math.max(speseDetraibili.value, 0) * FISCAL_RULES_2026.irpef.genericExpenseCreditRate
    : 0)
  const regionalRate = computed(() => advancedMode.value ? addizionaleRegionale.value : 0)
  const municipalRate = computed(() => advancedMode.value ? addizionaleComunale.value : 0)
  const contributionCap = computed(() => advancedMode.value
    ? Math.max(massimaleInps.value, 0)
    : FISCAL_RULES_2026.inps.gestioneSeparata.maximumIncome)

  watch(atecoCategory, (categoryId) => {
    if (categoryId === 'custom') return
    const category = ATECO_CATEGORIES.find((item) => item.id === categoryId)
    if (category) atecoCoef.value = category.coef
  })

  watch(forfettarioCassa, (fund) => {
    if (fund === 'gestione_separata') forfettarioContributionRelief.value = 'none'
  })
  watch(forfettarioContributionRelief, (relief) => {
    if (relief !== 'none' && forfettarioCassa.value === 'gestione_separata') forfettarioContributionRelief.value = 'none'
  })
  watch(ordinarioCassa, (fund) => {
    if (fund === 'gestione_separata') ordinarioContributionRelief.value = 'none'
  })
  watch(ordinarioContributionRelief, (relief) => {
    if (relief !== 'none' && ordinarioCassa.value === 'gestione_separata') ordinarioContributionRelief.value = 'none'
  })

  const applyContributionBreakdown = (
    steps: BreakdownStep[],
    fund: PrevidentialFund,
    result: ReturnType<typeof calculateBusinessContributions>,
    relief: ContributionRelief,
  ) => {
    if (fund === 'gestione_separata') {
      steps.push({
        label: `INPS Gestione Separata (${(result.rate * 100).toFixed(2)}%)`,
        value: result.total,
        operator: '-',
        details: hasJob.value
          ? 'Aliquota ridotta al 24% per la presenza di altra copertura previdenziale obbligatoria.'
          : `Contributi calcolati fino al massimale 2026 di € ${result.maximumIncome.toLocaleString('it-IT')}.`,
      })
      return
    }

    const label = fund === 'artigiani' ? 'Artigiani' : 'Commercianti'
    if (businessEnrollment.value === 'not_required') {
      steps.push({ label: `INPS ${label}`, value: 0, operator: '-', details: 'Iscrizione indicata come non dovuta dall’utente.' })
      return
    }
    steps.push({
      label: `INPS ${label} — contributo minimale`,
      value: result.minimumContribution,
      operator: '-',
      details: `Contributo minimo 2026 dovuto fino al reddito minimale di € ${FISCAL_RULES_2026.inps.business[fund].minimumIncome.toLocaleString('it-IT')}.`,
    })
    if (result.firstBracketContribution > 0) {
      steps.push({
        label: `INPS ${label} — eccedenza al ${(FISCAL_RULES_2026.inps.business[fund].baseRate * 100).toFixed(2)}%`,
        value: result.firstBracketContribution,
        operator: '-',
        details: `Quota oltre il minimale e fino a € ${FISCAL_RULES_2026.inps.business[fund].firstBracketLimit.toLocaleString('it-IT')}.`,
      })
    }
    if (result.upperBracketContribution > 0) {
      steps.push({
        label: `INPS ${label} — secondo scaglione al ${(FISCAL_RULES_2026.inps.business[fund].upperRate * 100).toFixed(2)}%`,
        value: result.upperBracketContribution,
        operator: '-',
        details: `Aliquota maggiorata di un punto oltre € ${FISCAL_RULES_2026.inps.business[fund].firstBracketLimit.toLocaleString('it-IT')}.`,
      })
    }
    if (result.reliefAmount > 0) {
      const reliefLabels: Record<Exclude<ContributionRelief, 'none'>, string> = {
        forfettario_35: 'Regime previdenziale forfettario −35%',
        pensioner_50: 'Pensionato INPS over 65 −50%',
        new_entrant_2025_50: 'Neo-iscritto 2025 −50%',
      }
      steps.push({ label: reliefLabels[relief as Exclude<ContributionRelief, 'none'>], value: result.reliefAmount, operator: '+' })
    }
  }

  const forfettarioStatus = computed(() => {
    const revenue = effectiveFatturato.value
    if (revenue > FISCAL_RULES_2026.forfettario.immediateExitThreshold) {
      return { level: 'error' as const, label: 'Uscita immediata dal regime' }
    }
    if (revenue > FISCAL_RULES_2026.forfettario.ordinaryRevenueThreshold) {
      return { level: 'warning' as const, label: 'Superamento soglia ordinaria' }
    }
    return { level: 'ok' as const, label: 'Regime applicabile per soglia ricavi' }
  })

  const forfettarioResult = computed(() => {
    const revenue = Math.max(effectiveFatturato.value, 0)
    const taxableGross = revenue * Math.max(atecoCoef.value, 0)
    const contributions = calculateBusinessContributions({
      income: taxableGross,
      fund: forfettarioCassa.value,
      hasOtherCoverage: hasJob.value,
      enrollment: businessEnrollment.value,
      relief: forfettarioContributionRelief.value,
      maximumIncomeOverride: contributionCap.value,
    })
    const taxableNet = Math.max(taxableGross - contributions.total, 0)
    const taxRate = forfettarioStartup.value
      ? FISCAL_RULES_2026.forfettario.startupRate
      : FISCAL_RULES_2026.forfettario.ordinaryRate
    const taxes = taxableNet * taxRate
    const netBeforeCosts = revenue - contributions.total - taxes
    const net = Math.max(netBeforeCosts - Math.max(costiOperativiReali.value, 0), 0)

    const steps: BreakdownStep[] = [
      { label: 'Fatturato annuo', value: revenue, operator: '+' },
      { label: `Imponibile lordo ATECO (${(atecoCoef.value * 100).toFixed(0)}%)`, value: taxableGross, operator: '*' },
    ]
    applyContributionBreakdown(steps, forfettarioCassa.value, contributions, forfettarioContributionRelief.value)
    steps.push({ label: 'Imponibile fiscale netto', value: taxableNet, operator: '=' })
    steps.push({
      label: `Imposta sostitutiva (${(taxRate * 100).toFixed(0)}%)`,
      value: taxes,
      operator: '-',
      details: forfettarioStartup.value
        ? 'Aliquota 5% applicata sulla base della dichiarazione dell’utente di possedere tutti i requisiti startup.'
        : 'Aliquota ordinaria del regime forfettario.',
    })
    steps.push({ label: 'Netto fiscale prima dei costi reali', value: netBeforeCosts, operator: '=' })
    if (costiOperativiReali.value > 0) {
      steps.push({ label: 'Costi operativi reali (non deducibili)', value: costiOperativiReali.value, operator: '-' })
    }
    steps.push({ label: 'Netto finale', value: net, operator: '=' })

    return {
      inps: contributions.total,
      tasse: taxes,
      netto: net,
      nettoMensile: net / Math.max(mesiParagone.value, 1),
      taxableIncome: taxableNet,
      status: forfettarioStatus.value,
      breakdown: { steps },
    }
  })

  const ordinarioResult = computed(() => {
    const revenue = Math.max(effectiveFatturato.value, 0)
    const realCosts = Math.max(costiOperativiReali.value, 0)
    const fiscalCosts = Math.max(deductibleCosts.value, 0)
    const contributionIncome = Math.max(revenue - fiscalCosts, 0)
    const contributions = calculateBusinessContributions({
      income: contributionIncome,
      fund: ordinarioCassa.value,
      hasOtherCoverage: hasJob.value,
      enrollment: businessEnrollment.value,
      relief: ordinarioContributionRelief.value,
      maximumIncomeOverride: contributionCap.value,
    })
    const businessTaxableIncome = Math.max(contributionIncome - contributions.total, 0)
    const basePosition = calculatePersonalTaxPosition({
      employeeTaxableIncome: employeeTaxableIncome.value,
      genericTaxCredits: genericTaxCredits.value,
      regionalRatePercent: regionalRate.value,
      municipalRatePercent: municipalRate.value,
    })
    const combinedPosition = calculatePersonalTaxPosition({
      employeeTaxableIncome: employeeTaxableIncome.value,
      otherTaxableIncome: businessTaxableIncome,
      genericTaxCredits: genericTaxCredits.value,
      regionalRatePercent: regionalRate.value,
      municipalRatePercent: municipalRate.value,
    })
    const incrementalTaxes = combinedPosition.totalTaxes - basePosition.totalTaxes
    const net = revenue - realCosts - contributions.total - incrementalTaxes

    const steps: BreakdownStep[] = [
      { label: 'Fatturato annuo', value: revenue, operator: '+' },
      { label: 'Costi fiscalmente deducibili', value: fiscalCosts, operator: '-' },
      { label: 'Reddito prima dei contributi', value: contributionIncome, operator: '=' },
    ]
    applyContributionBreakdown(steps, ordinarioCassa.value, contributions, ordinarioContributionRelief.value)
    steps.push({ label: 'Imponibile fiscale P.IVA', value: businessTaxableIncome, operator: '=' })

    if (hasJob.value) {
      steps.push({
        label: 'Imponibile fiscale lavoro dipendente',
        value: employeeTaxableIncome.value,
        operator: '+',
        details: `RAL € ${ralDipendente.value.toLocaleString('it-IT')} meno contributi dipendente stimati al ${aliquotaInpsDipendente.value.toFixed(2)}%.`,
      })
      steps.push({ label: 'Imposte posizione solo dipendente', value: basePosition.totalTaxes, operator: '-' })
      steps.push({ label: 'Imposte posizione complessiva', value: combinedPosition.totalTaxes, operator: '-' })
    } else {
      steps.push({
        label: 'IRPEF lorda',
        value: combinedPosition.grossIrpef,
        operator: '-',
        details: describeProgressiveTax(businessTaxableIncome),
      })
    }
    if (combinedPosition.genericTaxCredits > basePosition.genericTaxCredits) {
      steps.push({
        label: 'Detrazioni 19% utilizzate incrementalmente',
        value: combinedPosition.genericTaxCredits - basePosition.genericTaxCredits,
        operator: '+',
        details: 'La detrazione è applicata alla posizione fiscale complessiva e non attribuita integralmente alla P.IVA.',
      })
    }
    steps.push({
      label: 'Costo fiscale incrementale P.IVA',
      value: incrementalTaxes,
      operator: '=',
      details: 'Differenza tra imposte complessive con e senza reddito P.IVA, incluse detrazioni, trattamento integrativo e addizionali stimate.',
    })
    if (realCosts !== fiscalCosts) steps.push({ label: 'Costi operativi reali', value: realCosts, operator: '-' })
    steps.push({ label: 'Netto in tasca', value: net, operator: '=' })

    return {
      inps: contributions.total,
      tasse: incrementalTaxes,
      netto: net,
      nettoMensile: net / Math.max(mesiParagone.value, 1),
      taxableIncome: businessTaxableIncome,
      baseTaxPosition: basePosition,
      combinedTaxPosition: combinedPosition,
      breakdown: { steps },
    }
  })

  const solveAdministratorGrossCompensation = (availableCompanyCash: number, companyRate: number) => {
    const provisional = availableCompanyCash / (1 + companyRate)
    if (provisional <= contributionCap.value) return provisional
    return Math.max(availableCompanyCash - contributionCap.value * companyRate, 0)
  }

  const srlResult = computed(() => {
    const revenue = Math.max(effectiveFatturato.value, 0)
    const operatingCosts = Math.max(costiOperativiReali.value, 0)
    const fixedCosts = Math.max(srlCostiFissi.value, 0)
    const operatingProfit = Math.max(revenue - operatingCosts - fixedCosts, 0)
    const steps: BreakdownStep[] = [
      { label: 'Fatturato annuo SRL', value: revenue, operator: '+' },
      { label: 'Costi operativi', value: operatingCosts, operator: '-' },
      { label: 'Costi amministrativi SRL stimati', value: fixedCosts, operator: '-' },
      { label: 'Risultato operativo stimato', value: operatingProfit, operator: '=' },
    ]

    const workerContributions = srlSocioLavoratore.value
      ? calculateBusinessContributions({
          income: operatingProfit,
          fund: srlSocioCassa.value,
          enrollment: businessEnrollment.value,
          relief: srlContributionRelief.value,
          maximumIncomeOverride: contributionCap.value,
        })
      : null

    let taxes = 0
    let inps = workerContributions?.total ?? 0
    let net = 0
    let ires = 0
    let irap = 0
    let dividendTax = 0
    let administratorCompanyInps = 0
    let administratorPersonalInps = 0
    let administratorGrossCompensation = 0

    if (srlDistribuzione.value === 'compenso') {
      const administratorRules = FISCAL_RULES_2026.inps.gestioneSeparata.administrator
      const totalRate = hasJob.value ? administratorRules.otherCoverageRate : administratorRules.standardRate
      const companyRate = totalRate * administratorRules.companyShare
      administratorGrossCompensation = solveAdministratorGrossCompensation(operatingProfit, companyRate)
      const administratorContributions = calculateAdministratorContributions(
        administratorGrossCompensation,
        hasJob.value,
        contributionCap.value,
      )
      administratorCompanyInps = administratorContributions.company
      administratorPersonalInps = administratorContributions.administrator
      inps += administratorContributions.total
      const administratorTaxableIncome = Math.max(administratorGrossCompensation - administratorPersonalInps, 0)
      const basePosition = calculatePersonalTaxPosition({
        employeeTaxableIncome: employeeTaxableIncome.value,
        genericTaxCredits: genericTaxCredits.value,
        regionalRatePercent: regionalRate.value,
        municipalRatePercent: municipalRate.value,
      })
      const combinedPosition = calculatePersonalTaxPosition({
        employeeTaxableIncome: employeeTaxableIncome.value + administratorTaxableIncome,
        genericTaxCredits: genericTaxCredits.value,
        regionalRatePercent: regionalRate.value,
        municipalRatePercent: municipalRate.value,
      })
      taxes = combinedPosition.totalTaxes - basePosition.totalTaxes
      net = administratorGrossCompensation - administratorPersonalInps - taxes - (workerContributions?.total ?? 0)

      steps.push({ label: 'Compenso lordo amministratore', value: administratorGrossCompensation, operator: '=' })
      steps.push({
        label: `INPS amministratore — quota SRL (${(administratorContributions.companyRate * 100).toFixed(2)}%)`,
        value: administratorCompanyInps,
        operator: '-',
      })
      steps.push({
        label: `INPS amministratore — quota personale (${(administratorContributions.administratorRate * 100).toFixed(2)}%)`,
        value: administratorPersonalInps,
        operator: '-',
        details: `Aliquota totale Gestione Separata amministratori 2026: ${(administratorContributions.totalRate * 100).toFixed(2)}%.`,
      })
      steps.push({ label: 'Imponibile fiscale compenso', value: administratorTaxableIncome, operator: '=' })
      steps.push({
        label: 'Costo fiscale incrementale compenso',
        value: taxes,
        operator: '-',
        details: 'Differenza fra posizione personale complessiva con e senza compenso amministratore.',
      })
    } else {
      ires = operatingProfit * FISCAL_RULES_2026.srl.iresRate
      irap = operatingProfit * FISCAL_RULES_2026.srl.estimatedIrapRate
      const distributableProfit = Math.max(operatingProfit - ires - irap, 0)
      dividendTax = distributableProfit * FISCAL_RULES_2026.srl.dividendRate
      taxes = ires + irap + dividendTax
      net = distributableProfit - dividendTax - (workerContributions?.total ?? 0)
      steps.push({
        label: `IRES (${(FISCAL_RULES_2026.srl.iresRate * 100).toFixed(0)}%)`,
        value: ires,
        operator: '-',
        details: 'Stima su risultato operativo assunto come base imponibile IRES.',
      })
      steps.push({
        label: `IRAP stimata (${(FISCAL_RULES_2026.srl.estimatedIrapRate * 100).toFixed(1)}%)`,
        value: irap,
        operator: '-',
        details: 'Base IRAP reale non modellata: il risultato operativo è usato come proxy semplificata.',
      })
      steps.push({ label: 'Utile distribuibile stimato', value: distributableProfit, operator: '=' })
      steps.push({ label: 'Imposta dividendi (26%)', value: dividendTax, operator: '-' })
    }

    if (workerContributions) {
      applyContributionBreakdown(steps, srlSocioCassa.value, workerContributions, srlContributionRelief.value)
    }
    steps.push({ label: 'Netto in tasca socio/amministratore', value: net, operator: '=' })

    return {
      inps,
      tasse: taxes,
      netto: net,
      nettoMensile: net / Math.max(mesiParagone.value, 1),
      ires,
      irap,
      dividendTax,
      administratorCompanyInps,
      administratorPersonalInps,
      administratorGrossCompensation,
      operatingProfit,
      breakdown: { steps },
    }
  })

  const dipendenteResult = computed(() => {
    const isRalMode = inputMode.value === 'ral'
    const rateDatore = employerContributionRate.value
    const ral = isRalMode ? Math.max(fatturato.value, 0) : Math.max(fatturato.value, 0) / (1 + rateDatore)
    const inpsDatore = ral * rateDatore
    const fatturatoEquivalente = ral + inpsDatore
    const inpsDipendente = ral * employeeContributionRate.value
    const taxableIncome = Math.max(ral - inpsDipendente, 0)
    const position = calculatePersonalTaxPosition({
      employeeTaxableIncome: taxableIncome,
      genericTaxCredits: genericTaxCredits.value,
      regionalRatePercent: regionalRate.value,
      municipalRatePercent: municipalRate.value,
    })
    const netBeforeCosts = ral - inpsDipendente - position.netIrpef - position.regionalTax
      - position.municipalTax + position.trattamentoIntegrativo
    const net = Math.max(netBeforeCosts - Math.max(costiOperativiReali.value, 0), 0)
    const steps: BreakdownStep[] = []

    if (isRalMode) {
      steps.push({ label: 'RAL (Retribuzione Annua Lorda)', value: ral, operator: '+' })
    } else {
      steps.push({ label: 'Costo contributivo aziendale stimato', value: fatturato.value, operator: '+' })
      steps.push({
        label: `Contributi datore stimati (${aliquotaContributivaDatore.value.toFixed(2)}%)`,
        value: inpsDatore,
        operator: '-',
        details: 'Non include automaticamente TFR, INAIL, fondi, welfare o altri costi indiretti.',
      })
      steps.push({ label: 'RAL calcolata', value: ral, operator: '=' })
    }
    steps.push({ label: `INPS dipendente stimata (${aliquotaInpsDipendente.value.toFixed(2)}%)`, value: inpsDipendente, operator: '-' })
    steps.push({ label: 'Imponibile fiscale', value: taxableIncome, operator: '=' })
    steps.push({ label: 'IRPEF lorda', value: position.grossIrpef, operator: '-', details: describeProgressiveTax(taxableIncome) })
    if (position.employeeTaxCredit > 0) {
      steps.push({ label: 'Detrazione lavoro dipendente', value: position.employeeTaxCredit, operator: '+' })
    }
    if (position.genericTaxCredits > 0) {
      steps.push({ label: 'Detrazioni 19% capienti', value: position.genericTaxCredits, operator: '+' })
    }
    steps.push({ label: 'IRPEF netta', value: position.netIrpef, operator: '=' })
    if (position.trattamentoIntegrativo > 0) {
      steps.push({
        label: 'Trattamento integrativo',
        value: position.trattamentoIntegrativo,
        operator: '+',
        details: 'Credito calcolato secondo capienza e reddito complessivo; incide una sola volta sul netto.',
      })
    }
    if (position.regionalTax > 0) steps.push({ label: 'Addizionale regionale stimata', value: position.regionalTax, operator: '-' })
    if (position.municipalTax > 0) steps.push({ label: 'Addizionale comunale stimata', value: position.municipalTax, operator: '-' })
    if (costiOperativiReali.value > 0) {
      steps.push({ label: 'Costi operativi reali di confronto', value: costiOperativiReali.value, operator: '-' })
    }
    steps.push({ label: 'Netto finale', value: net, operator: '=' })

    return {
      inps: inpsDatore + inpsDipendente,
      inpsDipendente,
      inpsDatore,
      ral,
      tasse: position.netIrpef + position.regionalTax + position.municipalTax - position.trattamentoIntegrativo,
      netto: net,
      nettoMensile: net / Math.max(mesiParagone.value, 1),
      fatturatoEquivalente,
      taxableIncome,
      taxPosition: position,
      breakdown: { steps },
    }
  })

  const validationIssues = computed<ValidationIssue[]>(() => {
    const issues: ValidationIssue[] = []
    if (forfettarioStatus.value.level === 'warning') {
      issues.push({ scope: 'forfettario', severity: 'warning', message: 'Ricavi oltre €85.000: il regime cessa dall’anno successivo.' })
    }
    if (forfettarioStatus.value.level === 'error') {
      issues.push({ scope: 'forfettario', severity: 'error', message: 'Ricavi oltre €100.000: uscita immediata dal regime nell’anno.' })
    }
    if (redditoDipendentePrecedente.value > FISCAL_RULES_2026.forfettario.priorEmploymentIncomeThreshold) {
      issues.push({
        scope: 'forfettario',
        severity: 'error',
        message: 'Reddito di lavoro dipendente/assimilato dell’anno precedente oltre €35.000: verifica la causa ostativa.',
      })
    }
    const usesBusinessFund = [forfettarioCassa.value, ordinarioCassa.value].some((fund) => fund !== 'gestione_separata')
      || srlSocioLavoratore.value
    if (usesBusinessFund && businessEnrollment.value === 'unknown') {
      issues.push({
        scope: 'global',
        severity: 'warning',
        message: 'Obbligo di iscrizione Artigiani/Commercianti non confermato: i contributi sono inclusi prudenzialmente.',
      })
    }
    if (atecoCategory.value === 'professionisti' && [forfettarioCassa.value, ordinarioCassa.value].some((fund) => fund !== 'gestione_separata')) {
      issues.push({ scope: 'global', severity: 'warning', message: 'Categoria ATECO professionisti e gestione Artigiani/Commercianti: verifica la coerenza previdenziale.' })
    }
    return issues
  })

  const stateSnapshot = () => ({
    fiscalYear: fiscalYear.value,
    fatturato: fatturato.value,
    inputMode: inputMode.value,
    advancedMode: advancedMode.value,
    costiOperativiReali: costiOperativiReali.value,
    costiFiscalmenteDeducibili: costiFiscalmenteDeducibili.value,
    speseDetraibili: speseDetraibili.value,
    atecoCategory: atecoCategory.value,
    atecoCoef: atecoCoef.value,
    mesiParagone: mesiParagone.value,
    hasLavoroDipendente: hasLavoroDipendente.value,
    ralDipendente: ralDipendente.value,
    redditoDipendentePrecedente: redditoDipendentePrecedente.value,
    dipendenteFullTime: dipendenteFullTime.value,
    aliquotaInpsDipendente: aliquotaInpsDipendente.value,
    aliquotaContributivaDatore: aliquotaContributivaDatore.value,
    addizionaleRegionale: addizionaleRegionale.value,
    addizionaleComunale: addizionaleComunale.value,
    massimaleInps: massimaleInps.value,
    businessEnrollment: businessEnrollment.value,
    forfettarioCassa: forfettarioCassa.value,
    forfettarioStartup: forfettarioStartup.value,
    forfettarioContributionRelief: forfettarioContributionRelief.value,
    ordinarioCassa: ordinarioCassa.value,
    ordinarioContributionRelief: ordinarioContributionRelief.value,
    srlDistribuzione: srlDistribuzione.value,
    srlCostiFissi: srlCostiFissi.value,
    srlSocioLavoratore: srlSocioLavoratore.value,
    srlSocioCassa: srlSocioCassa.value,
    srlContributionRelief: srlContributionRelief.value,
    showForfettario: showForfettario.value,
    showOrdinario: showOrdinario.value,
    showSrl: showSrl.value,
    showDipendente: showDipendente.value,
    cardOrder: cardOrder.value,
  })

  const applyState = (parsed: Record<string, unknown>) => {
    const oldCosts = Number(parsed.speseDeducibili ?? parsed.spese ?? 5_000)
    fiscalYear.value = FISCAL_YEAR
    fatturato.value = Number(parsed.fatturato ?? fatturato.value)
    inputMode.value = parsed.inputMode === 'ral' ? 'ral' : 'fatturato'
    advancedMode.value = Boolean(parsed.advancedMode ?? (parsed.expensesMode === 'advanced'))
    costiOperativiReali.value = Number(parsed.costiOperativiReali ?? oldCosts)
    costiFiscalmenteDeducibili.value = Number(parsed.costiFiscalmenteDeducibili ?? oldCosts)
    speseDetraibili.value = Number(parsed.speseDetraibili ?? speseDetraibili.value)
    if (parsed.atecoCategory !== undefined) {
      atecoCategory.value = String(parsed.atecoCategory)
    } else if (parsed.atecoCoef !== undefined) {
      atecoCategory.value = ATECO_CATEGORIES.find((category) => category.id !== 'custom' && category.coef === Number(parsed.atecoCoef))?.id ?? 'custom'
    }
    atecoCoef.value = Number(parsed.atecoCoef ?? atecoCoef.value)
    mesiParagone.value = Number(parsed.mesiParagone ?? mesiParagone.value)
    hasLavoroDipendente.value = Boolean(parsed.hasLavoroDipendente ?? hasLavoroDipendente.value)
    ralDipendente.value = Number(parsed.ralDipendente ?? ralDipendente.value)
    redditoDipendentePrecedente.value = Number(parsed.redditoDipendentePrecedente ?? redditoDipendentePrecedente.value)
    dipendenteFullTime.value = Boolean(parsed.dipendenteFullTime ?? dipendenteFullTime.value)
    aliquotaInpsDipendente.value = Number(parsed.aliquotaInpsDipendente ?? aliquotaInpsDipendente.value)
    aliquotaContributivaDatore.value = Number(parsed.aliquotaContributivaDatore ?? aliquotaContributivaDatore.value)
    addizionaleRegionale.value = Number(parsed.addizionaleRegionale ?? addizionaleRegionale.value)
    addizionaleComunale.value = Number(parsed.addizionaleComunale ?? addizionaleComunale.value)
    massimaleInps.value = Number(parsed.massimaleInps ?? massimaleInps.value)
    businessEnrollment.value = ['required', 'not_required'].includes(String(parsed.businessEnrollment))
      ? parsed.businessEnrollment as EnrollmentStatus
      : 'unknown'

    forfettarioCassa.value = ['artigiani', 'commercianti'].includes(String(parsed.forfettarioCassa))
      ? parsed.forfettarioCassa as PrevidentialFund
      : 'gestione_separata'
    forfettarioStartup.value = Boolean(parsed.forfettarioStartup ?? false)
    forfettarioContributionRelief.value = (parsed.forfettarioContributionRelief as ContributionRelief)
      ?? (parsed.forfettarioRiduzione35 ? 'forfettario_35' : parsed.forfettarioRiduzione50 ? 'pensioner_50' : 'none')
    ordinarioCassa.value = ['artigiani', 'commercianti'].includes(String(parsed.ordinarioCassa))
      ? parsed.ordinarioCassa as PrevidentialFund
      : 'gestione_separata'
    ordinarioContributionRelief.value = (parsed.ordinarioContributionRelief as ContributionRelief)
      ?? (parsed.ordinarioRiduzione50 ? 'pensioner_50' : 'none')
    srlDistribuzione.value = parsed.srlDistribuzione === 'utili' ? 'utili' : 'compenso'
    srlCostiFissi.value = Number(parsed.srlCostiFissi ?? srlCostiFissi.value)
    const oldSrlFund = String(parsed.srlCassa ?? '')
    srlSocioLavoratore.value = Boolean(parsed.srlSocioLavoratore ?? ['artigiani', 'commercianti'].includes(oldSrlFund))
    srlSocioCassa.value = (parsed.srlSocioCassa === 'commercianti' || oldSrlFund === 'commercianti') ? 'commercianti' : 'artigiani'
    srlContributionRelief.value = (parsed.srlContributionRelief as ContributionRelief)
      ?? (parsed.srlRiduzione50 ? 'pensioner_50' : 'none')
    showForfettario.value = Boolean(parsed.showForfettario ?? showForfettario.value)
    showOrdinario.value = Boolean(parsed.showOrdinario ?? showOrdinario.value)
    showSrl.value = Boolean(parsed.showSrl ?? showSrl.value)
    showDipendente.value = Boolean(parsed.showDipendente ?? showDipendente.value)
    if (Array.isArray(parsed.cardOrder)) cardOrder.value = parsed.cardOrder.map(String)
  }

  const loadState = () => {
    if (typeof localStorage === 'undefined') return
    const saved = localStorage.getItem('taxgrid_state')
    if (!saved) return
    try { applyState(JSON.parse(saved)) } catch (error) { console.error('Failed to load state', error) }
  }

  const applyUrlState = () => {
    if (typeof window === 'undefined') return
    const encoded = new URLSearchParams(window.location.search).get('data')
    if (!encoded) return
    try {
      const parsed = JSON.parse(atob(encoded)) as Record<string, unknown>
      if (parsed.v === 2) {
        applyState({
          fiscalYear: parsed.y,
          fatturato: parsed.f,
          inputMode: parsed.m,
          advancedMode: parsed.a,
          costiOperativiReali: parsed.cr,
          costiFiscalmenteDeducibili: parsed.cf,
          speseDetraibili: parsed.d,
          atecoCategory: parsed.ac,
          atecoCoef: parsed.ax,
          mesiParagone: parsed.mm,
          hasLavoroDipendente: parsed.h,
          ralDipendente: parsed.r,
          redditoDipendentePrecedente: parsed.rp,
          dipendenteFullTime: parsed.ft,
          aliquotaInpsDipendente: parsed.id,
          aliquotaContributivaDatore: parsed.ed,
          addizionaleRegionale: parsed.ar,
          addizionaleComunale: parsed.am,
          massimaleInps: parsed.mi,
          businessEnrollment: parsed.be,
          forfettarioCassa: parsed.fc,
          forfettarioStartup: parsed.fs,
          forfettarioContributionRelief: parsed.fr,
          ordinarioCassa: parsed.oc,
          ordinarioContributionRelief: parsed.or,
          srlDistribuzione: parsed.sd,
          srlCostiFissi: parsed.sc,
          srlSocioLavoratore: parsed.sl,
          srlSocioCassa: parsed.ss,
          srlContributionRelief: parsed.sr,
          showForfettario: parsed.vf,
          showOrdinario: parsed.vo,
          showSrl: parsed.vs,
          showDipendente: parsed.vd,
          cardOrder: parsed.co,
        })
      } else {
        applyState(parsed)
      }
    } catch (error) { console.error('Failed to parse URL state', error) }
  }

  loadState()
  applyUrlState()

  watch(stateSnapshot, (state) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem('taxgrid_state', JSON.stringify(state))
  }, { deep: true })

  const buildShareUrl = () => {
    if (typeof window === 'undefined') return 'https://taxgrid.it'
    const url = new URL(window.location.href)
    url.search = ''
    const state = stateSnapshot()
    const compactState = {
      v: 2, y: state.fiscalYear, f: state.fatturato, m: state.inputMode, a: state.advancedMode,
      cr: state.costiOperativiReali, cf: state.costiFiscalmenteDeducibili, d: state.speseDetraibili,
      ac: state.atecoCategory, ax: state.atecoCoef, mm: state.mesiParagone,
      h: state.hasLavoroDipendente, r: state.ralDipendente, rp: state.redditoDipendentePrecedente,
      ft: state.dipendenteFullTime, id: state.aliquotaInpsDipendente, ed: state.aliquotaContributivaDatore,
      ar: state.addizionaleRegionale, am: state.addizionaleComunale, mi: state.massimaleInps,
      be: state.businessEnrollment, fc: state.forfettarioCassa, fs: state.forfettarioStartup,
      fr: state.forfettarioContributionRelief, oc: state.ordinarioCassa, or: state.ordinarioContributionRelief,
      sd: state.srlDistribuzione, sc: state.srlCostiFissi, sl: state.srlSocioLavoratore,
      ss: state.srlSocioCassa, sr: state.srlContributionRelief, vf: state.showForfettario,
      vo: state.showOrdinario, vs: state.showSrl, vd: state.showDipendente, co: state.cardOrder,
    }
    url.searchParams.set('data', btoa(JSON.stringify(compactState)))
    return url.toString()
  }

  const convertInputMode = (newMode: 'fatturato' | 'ral') => {
    if (inputMode.value === newMode) return
    const factor = 1 + employerContributionRate.value
    fatturato.value = roundMoney(inputMode.value === 'ral' ? fatturato.value * factor : fatturato.value / factor)
    inputMode.value = newMode
  }

  return {
    fiscalYear,
    fatturato,
    inputMode,
    effectiveFatturato,
    expensesMode,
    advancedMode,
    speseDeducibili,
    costiOperativiReali,
    costiFiscalmenteDeducibili,
    speseDetraibili,
    atecoCategory,
    atecoCoef,
    ATECO_CATEGORIES,
    forfettarioCassa,
    forfettarioStartup,
    forfettarioContributionRelief,
    forfettarioRiduzione35,
    forfettarioRiduzione50,
    ordinarioCassa,
    ordinarioContributionRelief,
    ordinarioRiduzione50,
    srlDistribuzione,
    srlCostiFissi,
    srlSocioLavoratore,
    srlSocioCassa,
    srlContributionRelief,
    srlCassa,
    srlRiduzione50,
    forfettarioResult,
    ordinarioResult,
    srlResult,
    dipendenteResult,
    forfettarioStatus,
    validationIssues,
    mesiParagone,
    hasLavoroDipendente,
    ralDipendente,
    redditoDipendentePrecedente,
    dipendenteFullTime,
    aliquotaInpsDipendente,
    aliquotaContributivaDatore,
    addizionaleRegionale,
    addizionaleComunale,
    massimaleInps,
    businessEnrollment,
    showForfettario,
    showOrdinario,
    showSrl,
    showDipendente,
    cardOrder,
    buildShareUrl,
    convertInputMode,
  }
})
