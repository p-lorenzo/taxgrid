import type { PrevidentialFund } from '../fiscal-rules'

export type DeadlineRegime = 'forfettario' | 'ordinario'
export type AccontoMethod = 'storico' | 'previsionale'
export type DeadlineType = 'saldo' | 'acconto' | 'contributi' | 'addizionali'

export interface TaxDeadline {
  date: string
  label: string
  amount: number
  type: DeadlineType
  detail?: string
}

export interface DeadlineInput {
  regime: DeadlineRegime
  /** Imposta (sostitutiva o IRPEF incrementale) stimata per il 2026. */
  annualTax: number
  /** Imposta/saldo dovuto per l'anno precedente (2025). */
  previousYearTax: number
  /** Base imposta prevista per il 2026, usata con metodo previsionale. */
  expectedTax: number
  accontoMethod: AccontoMethod
  /** Contributi INPS annui stimati dal regime. */
  contributionAmount: number
  contributionFund: PrevidentialFund
  /** Addizionali regionali + comunali incrementali annue (solo ordinario). */
  regionalTax: number
  municipalTax: number
}

const MONTHLY_DEADLINE_FIRST = '2026-06-30'
const MONTHLY_DEADLINE_SECOND = '2026-11-30'
const SALDO_2026 = '2027-06-30'
const BUSINESS_ACCONTO = '2026-05-18' // 16/05/2026 è sabato
const ADDIZIONALI_ACCONTO = '2026-11-30'
const ADDIZIONALI_SALDO = '2027-06-30'

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

/**
 * Calcola il calendario di cassa (saldo + acconti) per un regime P.IVA nel 2026.
 *
 * Modello dettagliato semplificato:
 * - Imposta (sostitutiva forfettario / IRPEF ordinario): saldo anno precedente entro
 *   30/06/2026, 1° acconto (50%) entro 30/06/2026, 2° acconto (50%) entro 30/11/2026,
 *   saldo 2026 entro 30/06/2027 al netto degli acconti.
 * - Metodo acconto: storico (base = imposta 2025) o previsionale (base = imposta
 *   prevista 2026, con override).
 * - INPS Gestione Separata: 2 rate 50/50 (30/06 e 30/11).
 * - INPS Artigiani/Commercianti: acconto 40% (16/05 → 18/05 per festività), saldo 30/06
 *   e 2° acconto 30/11 (ripartizione semplificata; la prassi prevede 4 rate).
 * - Addizionali regionali/comunali (solo ordinario): acconto 30% entro 30/11/2026,
 *   saldo 70% entro 30/06/2027.
 *
 * Gli importi sono stime orientative, non sostituiscono il calendario ufficiale.
 */
export function buildDeadlines(input: DeadlineInput): TaxDeadline[] {
  const events: TaxDeadline[] = []
  const annualTax = Math.max(input.annualTax, 0)
  const previousYearTax = Math.max(input.previousYearTax, 0)
  const expectedTax = Math.max(input.expectedTax, 0)
  const contributions = Math.max(input.contributionAmount, 0)

  const accontoBase = input.accontoMethod === 'previsionale'
    ? (expectedTax > 0 ? expectedTax : annualTax)
    : previousYearTax
  const firstAcconto = roundMoney(accontoBase / 2)
  const secondAcconto = roundMoney(accontoBase / 2)

  // Saldo anno precedente
  if (previousYearTax > 0) {
    events.push({
      date: MONTHLY_DEADLINE_FIRST,
      label: 'Saldo imposta 2025',
      amount: previousYearTax,
      type: 'saldo',
      detail: 'Imposta dovuta per l’anno precedente, in acconto a giugno.',
    })
  }

  // 1° acconto imposta
  if (firstAcconto > 0) {
    events.push({
      date: MONTHLY_DEADLINE_FIRST,
      label: `1° acconto imposta 2026 (${input.accontoMethod === 'previsionale' ? 'previsionale' : 'storico'})`,
      amount: firstAcconto,
      type: 'acconto',
      detail: input.accontoMethod === 'previsionale'
        ? 'Metodo previsionale: metà dell’imposta che prevedi di dovere per il 2026.'
        : 'Metodo storico: metà dell’acconto, pari al 100% dell’imposta 2025.',
    })
  }

  // 2° acconto imposta
  if (secondAcconto > 0) {
    events.push({
      date: MONTHLY_DEADLINE_SECOND,
      label: '2° acconto imposta 2026',
      amount: secondAcconto,
      type: 'acconto',
      detail: 'Seconda rata dell’acconto imposta 2026.',
    })
  }

  // Contributi previdenziali
  if (contributions > 0) {
    if (input.contributionFund === 'gestione_separata') {
      events.push({
        date: MONTHLY_DEADLINE_FIRST,
        label: 'INPS Gestione Separata — 1° rata (50%)',
        amount: roundMoney(contributions / 2),
        type: 'contributi',
        detail: 'Prima rata annuale dei contributi professionisti.',
      })
      events.push({
        date: MONTHLY_DEADLINE_SECOND,
        label: 'INPS Gestione Separata — 2° rata (50%)',
        amount: roundMoney(contributions / 2),
        type: 'contributi',
        detail: 'Seconda rata annuale dei contributi professionisti.',
      })
    } else {
      events.push({
        date: BUSINESS_ACCONTO,
        label: 'INPS Artigiani/Commercianti — acconto (40%)',
        amount: roundMoney(contributions * 0.4),
        type: 'contributi',
        detail: 'Acconto contributivo dovuto entro il 16/05 (spostato al 18/05 per il weekend).',
      })
      events.push({
        date: MONTHLY_DEADLINE_FIRST,
        label: 'INPS Artigiani/Commercianti — saldo (30%)',
        amount: roundMoney(contributions * 0.3),
        type: 'contributi',
        detail: 'Primo saldo annuale dei contributi.',
      })
      events.push({
        date: MONTHLY_DEADLINE_SECOND,
        label: 'INPS Artigiani/Commercianti — 2° saldo (30%)',
        amount: roundMoney(contributions * 0.3),
        type: 'contributi',
        detail: 'Ripartizione semplificata: la prassi prevede 4 rate (maggio, giugno, settembre, novembre).',
      })
    }
  }

  // Addizionali regionali/comunali (solo ordinario, quando configurate)
  const addizionali = Math.max(input.regionalTax + input.municipalTax, 0)
  if (input.regime === 'ordinario' && addizionali > 0) {
    events.push({
      date: ADDIZIONALI_ACCONTO,
      label: 'Addizionali regionali/comunali — acconto (30%)',
      amount: roundMoney(addizionali * 0.3),
      type: 'addizionali',
      detail: 'Acconto delle addizionali locali sul reddito 2026.',
    })
    events.push({
      date: ADDIZIONALI_SALDO,
      label: 'Addizionali regionali/comunali — saldo (70%)',
      amount: roundMoney(addizionali * 0.7),
      type: 'addizionali',
      detail: 'Saldo delle addizionali locali, dovuto a giugno 2027.',
    })
  }

  // Saldo 2026 (a conguaglio, al netto degli acconti versati)
  const saldo2026 = roundMoney(Math.max(annualTax - firstAcconto - secondAcconto, 0))
  if (saldo2026 > 0) {
    events.push({
      date: SALDO_2026,
      label: 'Saldo imposta 2026 (a conguaglio)',
      amount: saldo2026,
      type: 'saldo',
      detail: 'Differenza tra imposta 2026 e acconti già versati nel corso dell’anno.',
    })
  }

  return events.sort((a, b) => a.date.localeCompare(b.date))
}
