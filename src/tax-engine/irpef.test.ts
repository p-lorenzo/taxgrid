import { describe, expect, it } from 'vitest'
import { calculateProgressiveTax } from './irpef'

describe('IRPEF golden fiscal tests 2026', () => {
  // Anno fiscale 2026 — Legge 30 dicembre 2025, n. 199 — aggiornato 2026-07-22.
  it.each([
    ['2026_IRPEF_20K', 20_000, 4_600],
    ['2026_IRPEF_30K', 30_000, 7_100],
    ['2026_IRPEF_50K', 50_000, 13_700],
    ['2026_IRPEF_60K', 60_000, 18_000],
  ])('%s', (_name, income, expectedTax) => {
    expect(calculateProgressiveTax(income)).toBeCloseTo(expectedTax, 2)
  })
})

