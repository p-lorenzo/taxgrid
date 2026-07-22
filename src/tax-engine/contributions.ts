import { FISCAL_RULES_2026 } from '../fiscal-rules'
import type { BusinessFund, ContributionRelief, EnrollmentStatus, PrevidentialFund } from '../fiscal-rules'

export interface ContributionResult {
  total: number
  grossTotal: number
  minimumContribution: number
  firstBracketContribution: number
  upperBracketContribution: number
  reliefAmount: number
  rate: number
  maximumIncome: number
}

export interface BusinessContributionInput {
  income: number
  fund: PrevidentialFund
  hasOtherCoverage?: boolean
  enrollment?: EnrollmentStatus
  relief?: ContributionRelief
  maximumIncomeOverride?: number
}

const emptyResult = (maximumIncome: number): ContributionResult => ({
  total: 0,
  grossTotal: 0,
  minimumContribution: 0,
  firstBracketContribution: 0,
  upperBracketContribution: 0,
  reliefAmount: 0,
  rate: 0,
  maximumIncome,
})

export function calculateBusinessContributions(input: BusinessContributionInput): ContributionResult {
  const income = Math.max(input.income, 0)
  const relief = input.relief ?? 'none'

  if (input.fund === 'gestione_separata') {
    const rules = FISCAL_RULES_2026.inps.gestioneSeparata
    const maximumIncome = input.maximumIncomeOverride ?? rules.maximumIncome
    const rate = input.hasOtherCoverage ? rules.professional.otherCoverageRate : rules.professional.standardRate
    const total = Math.min(income, maximumIncome) * rate
    return { ...emptyResult(maximumIncome), total, grossTotal: total, firstBracketContribution: total, rate }
  }

  const rules = FISCAL_RULES_2026.inps.business[input.fund as BusinessFund]
  const maximumIncome = input.maximumIncomeOverride ?? rules.maximumIncome
  if (input.enrollment === 'not_required') return emptyResult(maximumIncome)

  const cappedIncome = Math.min(income, maximumIncome)
  const firstBracketIncome = Math.max(Math.min(cappedIncome, rules.firstBracketLimit) - rules.minimumIncome, 0)
  const upperBracketIncome = Math.max(cappedIncome - rules.firstBracketLimit, 0)
  const firstBracketContribution = firstBracketIncome * rules.baseRate
  const upperBracketContribution = upperBracketIncome * rules.upperRate
  const grossTotal = rules.minimumContribution + firstBracketContribution + upperBracketContribution

  let multiplier = 1
  if (relief === 'forfettario_35') multiplier = FISCAL_RULES_2026.inps.relief.forfettario35Multiplier
  if (relief === 'pensioner_50' || relief === 'new_entrant_2025_50') {
    multiplier = FISCAL_RULES_2026.inps.relief.fiftyPercentMultiplier
  }
  const total = grossTotal * multiplier

  return {
    total,
    grossTotal,
    minimumContribution: rules.minimumContribution,
    firstBracketContribution,
    upperBracketContribution,
    reliefAmount: grossTotal - total,
    rate: rules.baseRate,
    maximumIncome,
  }
}

export interface AdministratorContributionResult {
  total: number
  company: number
  administrator: number
  totalRate: number
  companyRate: number
  administratorRate: number
  taxableCompensation: number
}

export function calculateAdministratorContributions(
  grossCompensation: number,
  hasOtherCoverage: boolean,
  maximumIncomeOverride?: number,
): AdministratorContributionResult {
  const rules = FISCAL_RULES_2026.inps.gestioneSeparata
  const totalRate = hasOtherCoverage ? rules.administrator.otherCoverageRate : rules.administrator.standardRate
  const companyRate = totalRate * rules.administrator.companyShare
  const administratorRate = totalRate * rules.administrator.administratorShare
  const taxableCompensation = Math.min(Math.max(grossCompensation, 0), maximumIncomeOverride ?? rules.maximumIncome)
  const company = taxableCompensation * companyRate
  const administrator = taxableCompensation * administratorRate
  return { total: company + administrator, company, administrator, totalRate, companyRate, administratorRate, taxableCompensation }
}

