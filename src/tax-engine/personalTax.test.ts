import { describe, expect, it } from 'vitest'
import { calculatePersonalTaxPosition } from './personalTax'

describe('Personal tax position 2026', () => {
  it('recalculates employee credits against total combined income', () => {
    const employeeOnly = calculatePersonalTaxPosition({ employeeTaxableIncome: 27_243 })
    const combined = calculatePersonalTaxPosition({ employeeTaxableIncome: 27_243, otherTaxableIncome: 20_000 })
    expect(combined.employeeTaxCredit).toBeLessThan(employeeOnly.employeeTaxCredit)
  })

  it('consumes generic 19% credits in the overall position', () => {
    const employeeOnly = calculatePersonalTaxPosition({ employeeTaxableIncome: 27_243, genericTaxCredits: 1_900 })
    const combined = calculatePersonalTaxPosition({ employeeTaxableIncome: 27_243, otherTaxableIncome: 20_000, genericTaxCredits: 1_900 })
    expect(employeeOnly.genericTaxCredits).toBe(1_900)
    expect(combined.genericTaxCredits).toBe(1_900)
  })

  it('recognizes the full low-income treatment without capping it at net IRPEF', () => {
    const position = calculatePersonalTaxPosition({ employeeTaxableIncome: 10_897.2 })
    expect(position.trattamentoIntegrativo).toBe(1_200)
    expect(position.totalTaxes).toBe(position.netIrpef - 1_200)
  })
})
