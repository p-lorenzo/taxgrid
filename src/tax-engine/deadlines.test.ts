import { describe, expect, it } from 'vitest'
import { FISCAL_RULES_2026 } from '../fiscal-rules'
import { calculateBusinessContributions } from './contributions'
import { buildDeadlines, type DeadlineInput } from './deadlines'

const baseInput: DeadlineInput = {
  regime: 'forfettario',
  activityStartDate: '2024-01-01',
  ordinaryIsaEligible: false,
  annualTax: 6_000,
  previousYearTax: 5_000,
  previousTaxAdvanceBase: 5_000,
  previousTaxAdvancesPaid: 0,
  previousTaxCreditsWithholdings: 0,
  expectedTax: 0,
  useCalculatedExpectedTax: true,
  accontoMethod: 'storico',
  contributionAmount: 0,
  contributionFund: 'gestione_separata',
  contributionRelief: 'none',
  hasOtherCoverage: false,
  previousContributionIncome: 0,
  previousYearContributions: 0,
  previousContributionAdvancesPaid: 0,
}

const find = (events: ReturnType<typeof buildDeadlines>, label: string) => events.find((event) => event.label.includes(label))

describe('buildDeadlines 2026', () => {
  it('uses real prior liability for forfettario balance and 50/50 advances on 20 July', () => {
    const events = buildDeadlines({
      ...baseInput,
      previousTaxAdvancesPaid: 1_500,
      previousTaxCreditsWithholdings: 500,
    })
    expect(find(events, 'Saldo imposta 2025')).toMatchObject({ date: '2026-07-20', amount: 3_000 })
    expect(find(events, '1° acconto imposta')).toMatchObject({ date: '2026-07-20', amount: 2_500 })
    expect(find(events, '2° acconto imposta')).toMatchObject({ date: '2026-11-30', amount: 2_500 })
    expect(find(events, 'Saldo imposta 2026')).toMatchObject({ date: '2027-06-30', amount: 1_000 })
  })

  it('floors prior balances after advances and credits at zero', () => {
    const events = buildDeadlines({ ...baseInput, previousTaxAdvancesPaid: 4_000, previousTaxCreditsWithholdings: 2_000 })
    expect(find(events, 'Saldo imposta 2025')).toBeUndefined()
  })

  it.each([
    [51.65, 0, 0],
    [206, 0, 206],
    [206.01, 103.01, 103],
  ])('applies forfettario/ISA threshold to %s', (previousYearTax, first, second) => {
    const events = buildDeadlines({ ...baseInput, previousYearTax, previousTaxAdvanceBase: previousYearTax })
    expect(find(events, '1° acconto imposta')?.amount ?? 0).toBe(first)
    expect((find(events, '2° acconto imposta') ?? find(events, 'unica soluzione'))?.amount ?? 0).toBe(second)
  })

  it.each([
    [51.65, 0, 0],
    [257.51, 0, 257.51],
    [257.52, 103.01, 154.51],
  ])('applies ordinary non-ISA threshold and 40/60 split to %s', (previousYearTax, first, second) => {
    const events = buildDeadlines({ ...baseInput, regime: 'ordinario', previousYearTax, previousTaxAdvanceBase: previousYearTax })
    expect(find(events, '1° acconto imposta')?.amount ?? 0).toBe(first)
    expect((find(events, '2° acconto imposta') ?? find(events, 'unica soluzione'))?.amount ?? 0).toBe(second)
    if (first > 0) expect(find(events, '1° acconto imposta')?.date).toBe('2026-06-30')
  })

  it('uses ISA timing and split for eligible ordinary activity', () => {
    const events = buildDeadlines({ ...baseInput, regime: 'ordinario', ordinaryIsaEligible: true, previousYearTax: 1_000, previousTaxAdvanceBase: 1_000 })
    expect(find(events, '1° acconto imposta')).toMatchObject({ date: '2026-07-20', amount: 500 })
  })

  it('uses expected tax only for previsionale and keeps first-year advances at zero', () => {
    const forecast = buildDeadlines({ ...baseInput, accontoMethod: 'previsionale', expectedTax: 8_000, useCalculatedExpectedTax: false })
    expect(find(forecast, '1° acconto imposta')?.amount).toBe(4_000)

    const firstYear = buildDeadlines({ ...baseInput, activityStartDate: '2026-03-10', accontoMethod: 'previsionale', expectedTax: 8_000, useCalculatedExpectedTax: false })
    expect(firstYear.some((event) => event.type === 'acconto')).toBe(false)
    expect(find(firstYear, 'Saldo imposta 2025')).toBeUndefined()
    expect(find(firstYear, 'Saldo imposta 2026')?.amount).toBe(6_000)
  })

  it('accepts zero as an explicit previsionale estimate', () => {
    const events = buildDeadlines({
      ...baseInput,
      accontoMethod: 'previsionale',
      useCalculatedExpectedTax: false,
      expectedTax: 0,
    })
    expect(events.some((event) => event.type === 'acconto')).toBe(false)
    expect(find(events, 'Saldo imposta 2026')?.amount).toBe(6_000)
  })

  it('calculates Gestione Separata saldo and advances from 80% prior income', () => {
    const events = buildDeadlines({
      ...baseInput,
      previousContributionIncome: 50_000,
      previousYearContributions: 12_000,
      previousContributionAdvancesPaid: 9_000,
      contributionAmount: 13_035,
    })
    expect(find(events, 'Saldo contributi INPS 2025')?.amount).toBe(3_000)
    const totalAdvance = 50_000 * 0.8 * FISCAL_RULES_2026.inps.gestioneSeparata.professional.standardRate
    expect(find(events, 'Gestione Separata — 1° acconto')?.amount).toBeCloseTo(totalAdvance / 2, 2)
    expect(find(events, 'Gestione Separata — 2° acconto')?.amount).toBeCloseTo(totalAdvance / 2, 2)
    expect(find(events, 'Saldo contributi INPS 2026')?.amount).toBeCloseTo(13_035 - totalAdvance, 2)
  })

  it('creates no Gestione Separata 2026 payments for first-year activity', () => {
    const events = buildDeadlines({ ...baseInput, activityStartDate: '2026-02-01', annualTax: 0, contributionAmount: 10_000 })
    expect(events.filter((event) => event.type === 'contributi')).toEqual([
      expect.objectContaining({ date: '2027-06-30', amount: 10_000 }),
    ])
  })

  it('uses four statutory fixed installments and prior-income excess advances for Artigiani', () => {
    const projected = calculateBusinessContributions({ income: 60_000, fund: 'artigiani' }).total
    const events = buildDeadlines({
      ...baseInput,
      contributionFund: 'artigiani',
      contributionAmount: projected,
      previousContributionIncome: 60_000,
    })
    const fixed = events.filter((event) => event.label.includes('minimale rata'))
    expect(fixed.map((event) => event.date)).toEqual(['2026-05-18', '2026-08-20', '2026-11-17', '2027-02-16'])
    expect(fixed.reduce((sum, event) => sum + event.amount, 0)).toBe(FISCAL_RULES_2026.inps.business.artigiani.minimumContribution)
    const expectedExcess = projected - FISCAL_RULES_2026.inps.business.artigiani.minimumContribution
    expect(find(events, 'eccedenza minimale — 1° acconto')?.amount).toBeCloseTo(expectedExcess / 2, 2)
    expect(find(events, 'eccedenza minimale — 2° acconto')?.amount).toBeCloseTo(expectedExcess / 2, 2)
  })

  it('prorates first-year business minimum by active months and has no excess advance', () => {
    const fullMinimum = FISCAL_RULES_2026.inps.business.commercianti.minimumContribution
    const events = buildDeadlines({
      ...baseInput,
      activityStartDate: '2026-07-12',
      annualTax: 0,
      contributionFund: 'commercianti',
      contributionAmount: fullMinimum,
      previousContributionIncome: 80_000,
    })
    const fixed = events.filter((event) => event.label.includes('minimale rata'))
    expect(fixed.map((event) => event.date)).toEqual(['2026-08-20', '2026-11-17', '2027-02-16'])
    expect(fixed.reduce((sum, event) => sum + event.amount, 0)).toBeCloseTo(fullMinimum * 6 / 12, 2)
    expect(find(events, 'eccedenza minimale')).toBeUndefined()
    expect(fixed[0].detail).toContain('6 mesi')
  })

  it('returns no forecast for missing/invalid opening date and sorts valid events', () => {
    expect(buildDeadlines({ ...baseInput, activityStartDate: '' })).toEqual([])
    const events = buildDeadlines({ ...baseInput, contributionFund: 'artigiani', contributionAmount: 10_000, previousContributionIncome: 60_000 })
    const dates = events.map((event) => event.date)
    expect(dates).toEqual([...dates].sort())
    expect(events.some((event) => event.type === 'addizionali')).toBe(false)
  })
})
