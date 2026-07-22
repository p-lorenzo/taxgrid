import { describe, expect, it } from 'vitest'
import { calculateAdministratorContributions, calculateBusinessContributions } from './contributions'

describe('INPS golden fiscal tests 2026', () => {
  // Anno fiscale 2026 — circolari INPS n. 8 e n. 14/2026 — aggiornato 2026-07-22.
  it('2026_GS_PROFESSIONAL_NO_OTHER_INSURANCE', () => {
    expect(calculateBusinessContributions({ income: 50_000, fund: 'gestione_separata' }).total).toBeCloseTo(13_035, 2)
  })

  it('2026_GS_PROFESSIONAL_WITH_EMPLOYMENT', () => {
    expect(calculateBusinessContributions({ income: 50_000, fund: 'gestione_separata', hasOtherCoverage: true }).total).toBeCloseTo(12_000, 2)
  })

  it('2026_GS_MASSIMALE', () => {
    const atCap = calculateBusinessContributions({ income: 122_295, fund: 'gestione_separata' }).total
    const aboveCap = calculateBusinessContributions({ income: 200_000, fund: 'gestione_separata' }).total
    expect(aboveCap).toBeCloseTo(atCap, 2)
  })

  it.each([
    ['2026_ARTISAN_MINIMUM', 'artigiani' as const, 10_000, 4_521.36],
    ['2026_MERCHANT_MINIMUM', 'commercianti' as const, 10_000, 4_611.64],
    ['2026_ARTISAN_ABOVE_FIRST_BRACKET', 'artigiani' as const, 60_000, 4_521.36 + (56_224 - 18_808) * 0.24 + (60_000 - 56_224) * 0.25],
    ['2026_MERCHANT_ABOVE_FIRST_BRACKET', 'commercianti' as const, 60_000, 4_611.64 + (56_224 - 18_808) * 0.2448 + (60_000 - 56_224) * 0.2548],
  ])('%s', (_name, fund, income, expected) => {
    expect(calculateBusinessContributions({ income, fund, enrollment: 'required' }).total).toBeCloseTo(expected, 2)
  })

  it('2026_SRL_ADMIN_NO_OTHER_COVERAGE', () => {
    const result = calculateAdministratorContributions(50_000, false)
    expect(result.totalRate).toBeCloseTo(0.3503, 6)
    expect(result.company + result.administrator).toBeCloseTo(17_515, 2)
  })

  it('2026_SRL_ADMIN_WITH_OTHER_COVERAGE', () => {
    const result = calculateAdministratorContributions(50_000, true)
    expect(result.totalRate).toBe(0.24)
    expect(result.company).toBeCloseTo(8_000, 2)
    expect(result.administrator).toBeCloseTo(4_000, 2)
  })
})

