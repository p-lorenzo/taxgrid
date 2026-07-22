import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTaxStore } from './taxStore'

const localStorageMock = (() => {
  let values: Record<string, string> = {}
  return {
    getItem: (key: string) => values[key] ?? null,
    setItem: (key: string, value: string) => { values[key] = String(value) },
    clear: () => { values = {} },
    removeItem: (key: string) => { delete values[key] },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })
Object.defineProperty(globalThis, 'window', {
  value: { location: new URL('https://taxgrid.it/') },
  writable: true,
  configurable: true,
})

const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('TaxStore 2026 fiscal engine', () => {
  beforeEach(() => {
    localStorage.clear()
    window.location = new URL('https://taxgrid.it/') as unknown as Location
    setActivePinia(createPinia())
  })

  it('initializes the explicit 2026 fiscal year and current INPS cap', () => {
    const store = useTaxStore()
    expect(store.fiscalYear).toBe(2026)
    expect(store.massimaleInps).toBe(122_295)
    expect(store.forfettarioStartup).toBe(false)
  })

  it('keeps ATECO category and coefficient synchronized', async () => {
    const store = useTaxStore()
    store.atecoCategory = 'commercio'
    await nextTick()
    expect(store.atecoCoef).toBe(0.4)

    store.atecoCategory = 'custom'
    store.atecoCoef = 0.71
    await nextTick()
    expect(store.atecoCoef).toBe(0.71)
  })

  it('migrates legacy expense and ATECO state', () => {
    localStorage.setItem('taxgrid_state', JSON.stringify({ speseDeducibili: 8_000, atecoCoef: 0.54 }))
    const store = useTaxStore()
    expect(store.costiOperativiReali).toBe(8_000)
    expect(store.costiFiscalmenteDeducibili).toBe(8_000)
    expect(store.atecoCategory).toBe('commercio_ambulante_non_alim')
  })

  it('uses the employee taxable income rather than RAL in combined positions', () => {
    const store = useTaxStore()
    store.advancedMode = true
    store.hasLavoroDipendente = true
    store.ralDipendente = 30_000
    store.aliquotaInpsDipendente = 9.19
    store.costiOperativiReali = 0
    store.costiFiscalmenteDeducibili = 0
    expect(store.ordinarioResult.baseTaxPosition.taxableIncome).toBeCloseTo(27_243, 2)
    expect(store.ordinarioResult.combinedTaxPosition.taxableIncome).toBeCloseTo(
      27_243 + store.ordinarioResult.taxableIncome,
      2,
    )
  })

  it('calculates ordinary tax as the full incremental personal tax cost', () => {
    const store = useTaxStore()
    store.advancedMode = true
    store.hasLavoroDipendente = true
    store.ralDipendente = 30_000
    store.speseDetraibili = 10_000
    const expected = store.ordinarioResult.combinedTaxPosition.totalTaxes
      - store.ordinarioResult.baseTaxPosition.totalTaxes
    expect(store.ordinarioResult.tasse).toBeCloseTo(expected, 8)
    expect(store.ordinarioResult.baseTaxPosition.genericTaxCredits).toBe(1_900)
    expect(store.ordinarioResult.combinedTaxPosition.genericTaxCredits).toBe(1_900)
  })

  it('counts trattamento integrativo exactly once in employee net pay', () => {
    const store = useTaxStore()
    store.inputMode = 'ral'
    store.fatturato = 12_000
    store.costiOperativiReali = 0
    const result = store.dipendenteResult
    expect(result.taxPosition.trattamentoIntegrativo).toBe(1_200)
    const expectedNet = result.ral - result.inpsDipendente - result.taxPosition.netIrpef
      - result.taxPosition.regionalTax - result.taxPosition.municipalTax + 1_200
    expect(result.netto).toBeCloseTo(expectedNet, 8)
  })

  it('separates 2026 artisan and merchant minimum contributions', () => {
    const store = useTaxStore()
    store.fatturato = 10_000
    store.atecoCoef = 0.78
    store.businessEnrollment = 'required'
    store.forfettarioCassa = 'artigiani'
    expect(store.forfettarioResult.inps).toBeCloseTo(4_521.36, 2)
    store.forfettarioCassa = 'commercianti'
    expect(store.forfettarioResult.inps).toBeCloseTo(4_611.64, 2)
  })

  it('does not infer Artigiani or Commercianti exemption from full-time employment', () => {
    const store = useTaxStore()
    store.advancedMode = true
    store.hasLavoroDipendente = true
    store.dipendenteFullTime = true
    store.businessEnrollment = 'required'
    store.forfettarioCassa = 'artigiani'
    expect(store.forfettarioResult.inps).toBeGreaterThan(0)
    store.businessEnrollment = 'not_required'
    expect(store.forfettarioResult.inps).toBe(0)
  })

  it('models contribution reliefs explicitly and exclusively', () => {
    const store = useTaxStore()
    store.businessEnrollment = 'required'
    store.forfettarioCassa = 'artigiani'
    const fullContribution = store.forfettarioResult.inps
    store.forfettarioContributionRelief = 'forfettario_35'
    expect(store.forfettarioResult.inps).toBeCloseTo(fullContribution * 0.65, 2)
    store.forfettarioContributionRelief = 'pensioner_50'
    expect(store.forfettarioResult.inps).toBeCloseTo(fullContribution * 0.5, 2)
  })

  it('resets business reliefs when switching to Gestione Separata', async () => {
    const store = useTaxStore()
    store.forfettarioCassa = 'artigiani'
    store.forfettarioContributionRelief = 'forfettario_35'
    store.forfettarioCassa = 'gestione_separata'
    await nextTick()
    expect(store.forfettarioContributionRelief).toBe('none')
  })

  it('uses the 2026 administrator rate and configurable SRL costs', () => {
    const store = useTaxStore()
    store.costiOperativiReali = 0
    store.srlCostiFissi = 4_000
    const firstProfit = store.srlResult.operatingProfit
    const totalAdministratorInps = store.srlResult.administratorCompanyInps + store.srlResult.administratorPersonalInps
    expect(totalAdministratorInps).toBeCloseTo(store.srlResult.administratorGrossCompensation * 0.3503, 2)
    store.srlCostiFissi = 7_000
    expect(store.srlResult.operatingProfit).toBe(firstProfit - 3_000)
  })

  it('keeps administrator and working-shareholder roles separate', () => {
    const store = useTaxStore()
    const administratorOnly = store.srlResult.inps
    store.srlSocioLavoratore = true
    store.srlSocioCassa = 'commercianti'
    store.businessEnrollment = 'required'
    expect(store.srlResult.inps).toBeGreaterThan(administratorOnly)
  })

  it.each([
    [85_000, 'ok'],
    [90_000, 'warning'],
    [100_001, 'error'],
  ])('classifies the forfettario revenue threshold at %s', (revenue, expectedLevel) => {
    const store = useTaxStore()
    store.fatturato = revenue
    expect(store.forfettarioStatus.level).toBe(expectedLevel)
  })

  it('validates prior-year employment income independently from current RAL', () => {
    const store = useTaxStore()
    store.advancedMode = true
    store.ralDipendente = 80_000
    store.redditoDipendentePrecedente = 30_000
    expect(store.validationIssues.some((issue) => issue.message.includes('causa ostativa'))).toBe(false)
    store.redditoDipendentePrecedente = 36_000
    expect(store.validationIssues.some((issue) => issue.message.includes('causa ostativa'))).toBe(true)
  })

  it('serializes fiscal year and all new assumptions in a compact share URL', () => {
    const store = useTaxStore()
    const url = new URL(store.buildShareUrl())
    const decoded = JSON.parse(atob(url.searchParams.get('data')!))
    expect(decoded).toMatchObject({ v: 2, y: 2026, mi: 122_295 })
    expect(decoded).toHaveProperty('cr')
    expect(decoded).toHaveProperty('cf')
    expect(decoded).toHaveProperty('be')
  })

  it('converts RAL and revenue using the configurable employer assumption', () => {
    const store = useTaxStore()
    store.fatturato = 50_000
    store.aliquotaContributivaDatore = 25
    store.convertInputMode('ral')
    expect(store.fatturato).toBe(40_000)
    store.convertInputMode('fatturato')
    expect(store.fatturato).toBe(50_000)
  })
})
