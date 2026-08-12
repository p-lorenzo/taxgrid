import { describe, expect, it } from 'vitest'
import { buildDeadlines, type DeadlineInput } from './deadlines'

const baseInput: DeadlineInput = {
  regime: 'forfettario',
  annualTax: 6_000,
  previousYearTax: 5_000,
  expectedTax: 6_000,
  accontoMethod: 'storico',
  contributionAmount: 0,
  contributionFund: 'gestione_separata',
  regionalTax: 0,
  municipalTax: 0,
}

describe('buildDeadlines 2026', () => {
  it('produces saldo 2025 + 2 acconti + saldo 2026 for the monthly (professionisti) regime', () => {
    const events = buildDeadlines(baseInput)
    expect(events).toHaveLength(4)
    expect(events.map((e) => e.date)).toEqual([
      '2026-06-30', // saldo 2025
      '2026-06-30', // 1° acconto
      '2026-11-30', // 2° acconto
      '2027-06-30', // saldo 2026
    ])
    const saldo2025 = events.find((e) => e.label.includes('Saldo imposta 2025'))
    const primoAcconto = events.find((e) => e.label.includes('1° acconto'))
    const secondoAcconto = events.find((e) => e.label.includes('2° acconto'))
    const saldo2026 = events.find((e) => e.label.includes('Saldo imposta 2026'))
    expect(saldo2025?.amount).toBe(5_000)
    expect(primoAcconto?.amount).toBe(2_500) // storico: metà di 5.000
    expect(secondoAcconto?.amount).toBe(2_500)
    expect(saldo2026?.amount).toBe(6_000 - 2_500 - 2_500)
  })

  it('uses the previsionale method with expected tax override', () => {
    const events = buildDeadlines({
      ...baseInput,
      accontoMethod: 'previsionale',
      expectedTax: 8_000,
    })
    const primoAcconto = events.find((e) => e.label.includes('1° acconto'))
    expect(primoAcconto?.amount).toBe(4_000) // metà di 8.000 prevista
  })

  it('splits Gestione Separata contributions into two 50% instalments', () => {
    const events = buildDeadlines({
      ...baseInput,
      contributionAmount: 13_035,
      contributionFund: 'gestione_separata',
    })
    const first = events.find((e) => e.label.includes('1° rata'))
    const second = events.find((e) => e.label.includes('2° rata'))
    expect(first?.amount).toBeCloseTo(6_517.5, 2)
    expect(second?.amount).toBeCloseTo(6_517.5, 2)
    expect(first?.date).toBe('2026-06-30')
    expect(second?.date).toBe('2026-11-30')
  })

  it('applies 40/30/30 instalments for Artigiani/Commercianti with the 18/05 acconto date', () => {
    const events = buildDeadlines({
      ...baseInput,
      contributionAmount: 10_000,
      contributionFund: 'artigiani',
    })
    const acconto = events.find((e) => e.label.includes('acconto (40%)'))
    const saldo1 = events.find((e) => e.label.includes('saldo (30%)'))
    const saldo2 = events.find((e) => e.label.includes('2° saldo (30%)'))
    expect(acconto?.date).toBe('2026-05-18')
    expect(acconto?.amount).toBe(4_000)
    expect(saldo1?.amount).toBe(3_000)
    expect(saldo2?.amount).toBe(3_000)
  })

  it('adds addizionali acconto/saldo only for the ordinario regime', () => {
    const events = buildDeadlines({
      ...baseInput,
      regime: 'ordinario',
      regionalTax: 865,
      municipalTax: 400,
    })
    const acconto = events.find((e) => e.label.includes('acconto (30%)'))
    const saldo = events.find((e) => e.label.includes('saldo (70%)'))
    expect(acconto?.amount).toBeCloseTo((865 + 400) * 0.3, 2)
    expect(saldo?.amount).toBeCloseTo((865 + 400) * 0.7, 2)
    expect(acconto?.date).toBe('2026-11-30')
    expect(saldo?.date).toBe('2027-06-30')

    const forfettarioEvents = buildDeadlines(baseInput)
    expect(forfettarioEvents.some((e) => e.type === 'addizionali')).toBe(false)
  })

  it('sorts events chronologically', () => {
    const events = buildDeadlines({
      ...baseInput,
      contributionAmount: 10_000,
      contributionFund: 'artigiani',
      regime: 'ordinario',
      regionalTax: 500,
      municipalTax: 200,
    })
    const dates = events.map((e) => e.date)
    expect([...dates].sort()).toEqual(dates)
  })

  it('handles zero previous-year tax (first-year activity)', () => {
    const events = buildDeadlines({
      ...baseInput,
      previousYearTax: 0,
      annualTax: 6_000,
    })
    expect(events.some((e) => e.label.includes('Saldo imposta 2025'))).toBe(false)
    // In assenza di storico, gli acconti restano 0 con metodo storico.
    expect(events.some((e) => e.type === 'acconto')).toBe(false)
    expect(events.find((e) => e.label.includes('Saldo imposta 2026'))?.amount).toBe(6_000)
  })
})
