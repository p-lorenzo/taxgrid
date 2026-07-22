import { FISCAL_RULES_2026 } from '../fiscal-rules'
import { calculateProgressiveTax } from './irpef'

export interface PersonalTaxPositionInput {
  employeeTaxableIncome?: number
  otherTaxableIncome?: number
  genericTaxCredits?: number
  eligibleTreatmentDeductions?: number
  regionalRatePercent?: number
  municipalRatePercent?: number
}

export interface PersonalTaxPosition {
  taxableIncome: number
  grossIrpef: number
  employeeTaxCredit: number
  genericTaxCredits: number
  netIrpef: number
  regionalTax: number
  municipalTax: number
  treatmentIntegrativo: number
  totalTaxes: number
}

export function calculateEmployeeTaxCredit(totalIncome: number, hasEmployeeIncome = true): number {
  if (!hasEmployeeIncome || totalIncome <= 0) return 0
  const rules = FISCAL_RULES_2026.irpef.employeeTaxCredit
  let credit = 0

  if (totalIncome <= rules.firstThreshold) {
    credit = rules.firstAmount
  } else if (totalIncome <= rules.secondThreshold) {
    credit = rules.secondBaseAmount
      + rules.secondVariableAmount * ((rules.secondThreshold - totalIncome) / rules.secondRange)
  } else if (totalIncome <= rules.maximumThreshold) {
    credit = rules.secondBaseAmount * ((rules.maximumThreshold - totalIncome) / rules.thirdRange)
  }

  if (totalIncome > rules.additionalCreditFrom && totalIncome <= rules.additionalCreditTo) {
    credit += rules.additionalCredit
  }
  return Math.max(credit, 0)
}

export function calculateTreatmentIntegrativo(
  totalIncome: number,
  employeeTaxableIncome: number,
  employeeTaxCredit: number,
  eligibleTreatmentDeductions = 0,
): number {
  if (employeeTaxableIncome <= 0) return 0
  const rules = FISCAL_RULES_2026.irpef.treatmentIntegrativo
  const grossTaxOnEmployeeIncome = calculateProgressiveTax(employeeTaxableIncome)

  if (totalIncome <= rules.fullIncomeThreshold) {
    const adjustedEmployeeCredit = Math.max(employeeTaxCredit - rules.employeeCreditAdjustment, 0)
    return grossTaxOnEmployeeIncome > adjustedEmployeeCredit ? rules.maximumAmount : 0
  }

  if (totalIncome <= rules.conditionalIncomeThreshold) {
    const qualifyingDeductions = employeeTaxCredit + Math.max(eligibleTreatmentDeductions, 0)
    return Math.min(Math.max(qualifyingDeductions - grossTaxOnEmployeeIncome, 0), rules.maximumAmount)
  }

  return 0
}

export function calculatePersonalTaxPosition(input: PersonalTaxPositionInput): PersonalTaxPosition {
  const employeeIncome = Math.max(input.employeeTaxableIncome ?? 0, 0)
  const otherIncome = Math.max(input.otherTaxableIncome ?? 0, 0)
  const taxableIncome = employeeIncome + otherIncome
  const grossIrpef = calculateProgressiveTax(taxableIncome)
  const employeeTaxCredit = Math.min(calculateEmployeeTaxCredit(taxableIncome, employeeIncome > 0), grossIrpef)
  const availableAfterEmployeeCredit = Math.max(grossIrpef - employeeTaxCredit, 0)
  const genericTaxCredits = Math.min(Math.max(input.genericTaxCredits ?? 0, 0), availableAfterEmployeeCredit)
  const netIrpef = Math.max(grossIrpef - employeeTaxCredit - genericTaxCredits, 0)
  const regionalTax = taxableIncome * Math.max(input.regionalRatePercent ?? 0, 0) / 100
  const municipalTax = taxableIncome * Math.max(input.municipalRatePercent ?? 0, 0) / 100
  const treatmentIntegrativo = calculateTreatmentIntegrativo(
    taxableIncome,
    employeeIncome,
    employeeTaxCredit,
    input.eligibleTreatmentDeductions,
  )

  return {
    taxableIncome,
    grossIrpef,
    employeeTaxCredit,
    genericTaxCredits,
    netIrpef,
    regionalTax,
    municipalTax,
    treatmentIntegrativo,
    totalTaxes: netIrpef + regionalTax + municipalTax - treatmentIntegrativo,
  }
}

