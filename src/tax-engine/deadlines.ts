import { FISCAL_RULES_2026 } from '../fiscal-rules'
import type { ContributionRelief, PrevidentialFund } from '../fiscal-rules'
import { calculateBusinessContributions } from './contributions'

export type DeadlineRegime = 'forfettario' | 'ordinario'
export type AccontoMethod = 'storico' | 'previsionale'
export type DeadlineType = 'saldo' | 'acconto' | 'contributi' | 'addizionali'

export interface TaxDeadline {
  date: string
  label: string
  amount: number
  type: DeadlineType
  detail?: string
}

export interface DeadlineInput {
  regime: DeadlineRegime
  activityStartDate: string
  ordinaryIsaEligible: boolean
  /** Imposta 2026 stimata, incluse eventuali addizionali del risultato annuale. */
  annualTax: number
  /** Imposta netta dovuta per il 2025, prima degli acconti già versati. */
  previousYearTax: number
  /** Importo della dichiarazione 2025 usato specificamente come base acconti. */
  previousTaxAdvanceBase: number
  previousTaxAdvancesPaid: number
  previousTaxCreditsWithholdings: number
  expectedTax: number
  useCalculatedExpectedTax: boolean
  accontoMethod: AccontoMethod
  /** Contributi 2026 stimati dal simulatore. */
  contributionAmount: number
  contributionFund: PrevidentialFund
  contributionRelief: ContributionRelief
  hasOtherCoverage: boolean
  maximumContributionIncome?: number
  previousContributionIncome: number
  previousYearContributions: number
  previousContributionAdvancesPaid: number
}

const STANDARD_FIRST_DEADLINE = '2026-06-30'
const DEFERRED_FIRST_DEADLINE = '2026-07-20'
const SECOND_DEADLINE = '2026-11-30'
const NEXT_YEAR_BALANCE = '2027-06-30'
const BUSINESS_FIXED_DATES = ['2026-05-18', '2026-08-20', '2026-11-17', '2027-02-16'] as const

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100
const nonNegative = (value: number) => Number.isFinite(value) ? Math.max(value, 0) : 0

const parseActivityStart = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date
}

const reliefMultiplier = (relief: ContributionRelief) => {
  if (relief === 'forfettario_35') return FISCAL_RULES_2026.inps.relief.forfettario35Multiplier
  if (relief === 'pensioner_50' || relief === 'new_entrant_2025_50') return FISCAL_RULES_2026.inps.relief.fiftyPercentMultiplier
  return 1
}

const activeMonthsIn2026 = (opening: Date) => {
  if (opening.getUTCFullYear() < 2026) return 12
  if (opening.getUTCFullYear() > 2026) return 0
  return 12 - opening.getUTCMonth()
}

function taxAdvanceSplit(base: number, isaStyle: boolean) {
  const normalized = nonNegative(base)
  if (normalized <= 51.65) return { first: 0, second: 0 }
  const soleThreshold = isaStyle ? 206 : 257.52
  if ((isaStyle && normalized <= soleThreshold) || (!isaStyle && normalized < soleThreshold)) {
    return { first: 0, second: roundMoney(normalized) }
  }
  const firstRate = isaStyle ? 0.5 : 0.4
  const first = roundMoney(normalized * firstRate)
  return { first, second: roundMoney(normalized - first) }
}

/** Build statutory cash deadlines from explicit prior-year facts and current projections. */
export function buildDeadlines(input: DeadlineInput): TaxDeadline[] {
  const opening = parseActivityStart(input.activityStartDate)
  if (!opening || opening > new Date('2026-12-31T00:00:00Z')) return []

  const events: TaxDeadline[] = []
  const firstYear = opening.getUTCFullYear() === 2026
  const firstDeadline = input.regime === 'forfettario' || input.ordinaryIsaEligible
    ? DEFERRED_FIRST_DEADLINE
    : STANDARD_FIRST_DEADLINE
  const annualTax = nonNegative(input.annualTax)
  const priorTax = firstYear ? 0 : nonNegative(input.previousYearTax)
  const priorTaxBalance = firstYear ? 0 : roundMoney(Math.max(
    priorTax - nonNegative(input.previousTaxAdvancesPaid) - nonNegative(input.previousTaxCreditsWithholdings),
    0,
  ))

  if (priorTaxBalance > 0) {
    events.push({
      date: firstDeadline,
      label: 'Saldo imposta 2025',
      amount: priorTaxBalance,
      type: 'saldo',
      detail: 'Imposta 2025 al netto di acconti, crediti e ritenute indicati.',
    })
  }

  const advanceBase = firstYear
    ? 0
    : input.accontoMethod === 'previsionale'
      ? (input.useCalculatedExpectedTax ? annualTax : nonNegative(input.expectedTax))
      : nonNegative(input.previousTaxAdvanceBase)
  const taxAdvances = taxAdvanceSplit(advanceBase, input.regime === 'forfettario' || input.ordinaryIsaEligible)

  if (taxAdvances.first > 0) {
    events.push({
      date: firstDeadline,
      label: `1° acconto imposta 2026 (${input.accontoMethod})`,
      amount: taxAdvances.first,
      type: 'acconto',
      detail: input.regime === 'forfettario' || input.ordinaryIsaEligible
        ? 'Prima rata del 50% secondo regole forfettario/ISA.'
        : 'Prima rata del 40% secondo regole ordinarie non ISA.',
    })
  }
  if (taxAdvances.second > 0) {
    events.push({
      date: SECOND_DEADLINE,
      label: taxAdvances.first > 0 ? '2° acconto imposta 2026' : 'Acconto imposta 2026 in unica soluzione',
      amount: taxAdvances.second,
      type: 'acconto',
      detail: taxAdvances.first > 0 ? 'Seconda rata dell’acconto 2026.' : 'Importo sotto la soglia prevista per la rateazione in due scadenze.',
    })
  }

  const priorContributionBalance = firstYear ? 0 : roundMoney(Math.max(
    nonNegative(input.previousYearContributions) - nonNegative(input.previousContributionAdvancesPaid),
    0,
  ))
  if (priorContributionBalance > 0) {
    events.push({
      date: firstDeadline,
      label: 'Saldo contributi INPS 2025',
      amount: priorContributionBalance,
      type: 'contributi',
      detail: 'Contributi 2025 dovuti al netto degli acconti già versati.',
    })
  }

  const projectedContributions = nonNegative(input.contributionAmount)
  let contributionAdvances = 0
  let fixedContributions = 0

  if (input.contributionFund === 'gestione_separata') {
    if (!firstYear) {
      const rules = FISCAL_RULES_2026.inps.gestioneSeparata
      const rate = input.hasOtherCoverage ? rules.professional.otherCoverageRate : rules.professional.standardRate
      const maximum = nonNegative(input.maximumContributionIncome ?? rules.maximumIncome)
      contributionAdvances = roundMoney(Math.min(nonNegative(input.previousContributionIncome) * 0.8, maximum) * rate)
      const first = roundMoney(contributionAdvances / 2)
      const second = roundMoney(contributionAdvances - first)
      if (first > 0) events.push({ date: firstDeadline, label: 'INPS Gestione Separata — 1° acconto', amount: first, type: 'contributi', detail: '50% dell’acconto calcolato con aliquota 2026 sull’80% del reddito previdenziale 2025.' })
      if (second > 0) events.push({ date: SECOND_DEADLINE, label: 'INPS Gestione Separata — 2° acconto', amount: second, type: 'contributi', detail: 'Seconda metà dell’acconto contributivo 2026.' })
    }
  } else if (projectedContributions > 0) {
    const rules = FISCAL_RULES_2026.inps.business[input.contributionFund]
    const multiplier = reliefMultiplier(input.contributionRelief)
    const fullFixed = roundMoney(rules.minimumContribution * multiplier)
    fixedContributions = roundMoney(fullFixed * activeMonthsIn2026(opening) / 12)
    const openingIso = input.activityStartDate
    const paymentDates = firstYear
      ? BUSINESS_FIXED_DATES.filter((date) => date >= openingIso)
      : [...BUSINESS_FIXED_DATES]
    const installment = roundMoney(fixedContributions / paymentDates.length)
    paymentDates.forEach((date, index) => {
      const amount = index === paymentDates.length - 1
        ? roundMoney(fixedContributions - installment * (paymentDates.length - 1))
        : installment
      if (amount > 0) events.push({
        date,
        label: `INPS ${input.contributionFund === 'artigiani' ? 'Artigiani' : 'Commercianti'} — minimale rata ${index + 1}/${paymentDates.length}`,
        amount,
        type: 'contributi',
        detail: firstYear
          ? `Minimale riproporzionato a ${activeMonthsIn2026(opening)} mesi e distribuito sulle scadenze successive all’apertura; verifica gli F24 emessi da INPS.`
          : 'Rata trimestrale del contributo minimale 2026.',
      })
    })

    if (!firstYear) {
      const priorIncomeContribution = calculateBusinessContributions({
        income: nonNegative(input.previousContributionIncome),
        fund: input.contributionFund,
        relief: input.contributionRelief,
        maximumIncomeOverride: input.maximumContributionIncome,
      })
      contributionAdvances = roundMoney(Math.max(priorIncomeContribution.total - fullFixed, 0))
      const first = roundMoney(contributionAdvances / 2)
      const second = roundMoney(contributionAdvances - first)
      if (first > 0) events.push({ date: firstDeadline, label: 'INPS eccedenza minimale — 1° acconto', amount: first, type: 'contributi', detail: 'Prima metà dell’acconto sull’eccedenza, calcolato dal reddito previdenziale 2025.' })
      if (second > 0) events.push({ date: SECOND_DEADLINE, label: 'INPS eccedenza minimale — 2° acconto', amount: second, type: 'contributi', detail: 'Seconda metà dell’acconto sull’eccedenza.' })
    }
  }

  const taxBalance2026 = roundMoney(Math.max(annualTax - taxAdvances.first - taxAdvances.second, 0))
  if (taxBalance2026 > 0) events.push({
    date: NEXT_YEAR_BALANCE,
    label: 'Saldo imposta 2026 (a conguaglio)',
    amount: taxBalance2026,
    type: 'saldo',
    detail: 'Imposta annuale stimata, incluse addizionali, al netto degli acconti 2026.',
  })

  const fullFixedForFund = input.contributionFund === 'gestione_separata'
    ? 0
    : FISCAL_RULES_2026.inps.business[input.contributionFund].minimumContribution * reliefMultiplier(input.contributionRelief)
  const projectedContributionLiability = input.contributionFund === 'gestione_separata'
    ? projectedContributions
    : Math.max(projectedContributions - fullFixedForFund + fixedContributions, 0)
  const contributionBalance2026 = roundMoney(Math.max(projectedContributionLiability - fixedContributions - contributionAdvances, 0))
  if (contributionBalance2026 > 0) events.push({
    date: NEXT_YEAR_BALANCE,
    label: 'Saldo contributi INPS 2026 (stimato)',
    amount: contributionBalance2026,
    type: 'contributi',
    detail: 'Contributi 2026 stimati al netto di minimale e acconti pagati nel 2026.',
  })

  return events.sort((a, b) => a.date.localeCompare(b.date))
}
