import { FISCAL_RULES_2026 } from '../fiscal-rules'
import type { TaxBracket } from '../fiscal-rules'

export function calculateProgressiveTax(income: number, brackets: readonly TaxBracket[] = FISCAL_RULES_2026.irpef.brackets): number {
  const taxableIncome = Math.max(income, 0)
  let lowerBound = 0
  let tax = 0

  for (const bracket of brackets) {
    const taxableInBracket = Math.max(Math.min(taxableIncome, bracket.upTo) - lowerBound, 0)
    tax += taxableInBracket * bracket.rate
    if (taxableIncome <= bracket.upTo) break
    lowerBound = bracket.upTo
  }

  return tax
}

export function describeProgressiveTax(income: number, brackets: readonly TaxBracket[] = FISCAL_RULES_2026.irpef.brackets): string {
  const taxableIncome = Math.max(income, 0)
  if (taxableIncome === 0) return 'Nessun imponibile fiscale'

  const parts: string[] = []
  let lowerBound = 0
  for (const bracket of brackets) {
    const taxableInBracket = Math.max(Math.min(taxableIncome, bracket.upTo) - lowerBound, 0)
    if (taxableInBracket > 0) {
      const range = lowerBound === 0
        ? `primi € ${Math.min(taxableIncome, bracket.upTo).toLocaleString('it-IT')}`
        : `quota da € ${lowerBound.toLocaleString('it-IT')} a € ${Math.min(taxableIncome, bracket.upTo).toLocaleString('it-IT')}`
      parts.push(`${(bracket.rate * 100).toFixed(0)}% sui ${range}`)
    }
    if (taxableIncome <= bracket.upTo) break
    lowerBound = bracket.upTo
  }
  return parts.join(' + ')
}

