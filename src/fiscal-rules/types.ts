export type FiscalYear = 2026

export type PrevidentialFund = 'gestione_separata' | 'artigiani' | 'commercianti'
export type BusinessFund = Exclude<PrevidentialFund, 'gestione_separata'>
export type EnrollmentStatus = 'required' | 'not_required' | 'unknown'
export type ContributionRelief = 'none' | 'forfettario_35' | 'pensioner_50' | 'new_entrant_2025_50'

export interface NormativeMetadata {
  fiscalYear: FiscalYear
  source: string
  sourceUrl: string
  updatedAt: string
}

export interface TaxBracket {
  upTo: number
  rate: number
}

export interface BusinessContributionRule {
  minimumIncome: number
  minimumContribution: number
  firstBracketLimit: number
  baseRate: number
  upperRate: number
  maximumIncome: number
}

