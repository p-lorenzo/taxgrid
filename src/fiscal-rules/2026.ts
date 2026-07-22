import type { BusinessContributionRule, NormativeMetadata, TaxBracket } from './types'

const updatedAt = '2026-07-22'

export const FISCAL_YEAR = 2026 as const

export const RULE_METADATA = {
  irpef: {
    fiscalYear: FISCAL_YEAR,
    source: 'Legge 30 dicembre 2025, n. 199, art. 1, comma 3',
    sourceUrl: 'https://www.gazzettaufficiale.it/eli/id/2025/12/30/25G00212/SG',
    updatedAt,
  },
  gestioneSeparata: {
    fiscalYear: FISCAL_YEAR,
    source: 'INPS, circolare 3 febbraio 2026, n. 8',
    sourceUrl: 'https://www.inps.it/it/it/inps-comunica/atti/circolari-messaggi-e-normativa/dettaglio.circolari-e-messaggi.2026.02.circolare-numero-8-del-03-02-2026_15153.html',
    updatedAt,
  },
  artisansAndMerchants: {
    fiscalYear: FISCAL_YEAR,
    source: 'INPS, circolare 9 febbraio 2026, n. 14',
    sourceUrl: 'https://www.inps.it/it/it/inps-comunica/atti/circolari-messaggi-e-normativa/dettaglio.circolari-e-messaggi.2026.02.circolare-numero-14-del-09-02-2026_15162.html',
    updatedAt,
  },
  forfettario: {
    fiscalYear: FISCAL_YEAR,
    source: 'Legge 23 dicembre 2014, n. 190, commi 54-89, e Legge 30 dicembre 2025, n. 199',
    sourceUrl: 'https://www.normattiva.it/atto/caricaDettaglioAtto?atto.codiceRedazionale=25G00212&atto.dataPubblicazioneGazzetta=2025-12-30',
    updatedAt,
  },
} satisfies Record<string, NormativeMetadata>

export const IRPEF_BRACKETS_2026: TaxBracket[] = [
  { upTo: 28_000, rate: 0.23 },
  { upTo: 50_000, rate: 0.33 },
  { upTo: Number.POSITIVE_INFINITY, rate: 0.43 },
]

export const FISCAL_RULES_2026 = {
  fiscalYear: FISCAL_YEAR,
  irpef: {
    brackets: IRPEF_BRACKETS_2026,
    employeeTaxCredit: {
      firstThreshold: 15_000,
      secondThreshold: 28_000,
      maximumThreshold: 50_000,
      firstAmount: 1_955,
      secondBaseAmount: 1_910,
      secondVariableAmount: 1_190,
      secondRange: 13_000,
      thirdRange: 22_000,
      additionalCredit: 65,
      additionalCreditFrom: 25_000,
      additionalCreditTo: 35_000,
    },
    genericExpenseCreditRate: 0.19,
    treatmentIntegrativo: {
      maximumAmount: 1_200,
      fullIncomeThreshold: 15_000,
      conditionalIncomeThreshold: 28_000,
      employeeCreditAdjustment: 75,
    },
  },
  inps: {
    gestioneSeparata: {
      maximumIncome: 122_295,
      professional: {
        standardRate: 0.2607,
        otherCoverageRate: 0.24,
      },
      administrator: {
        standardRate: 0.3503,
        otherCoverageRate: 0.24,
        companyShare: 2 / 3,
        administratorShare: 1 / 3,
      },
    },
    business: {
      artigiani: {
        minimumIncome: 18_808,
        minimumContribution: 4_521.36,
        firstBracketLimit: 56_224,
        baseRate: 0.24,
        upperRate: 0.25,
        maximumIncome: 122_295,
      } satisfies BusinessContributionRule,
      commercianti: {
        minimumIncome: 18_808,
        minimumContribution: 4_611.64,
        firstBracketLimit: 56_224,
        baseRate: 0.2448,
        upperRate: 0.2548,
        maximumIncome: 122_295,
      } satisfies BusinessContributionRule,
    },
    relief: {
      forfettario35Multiplier: 0.65,
      fiftyPercentMultiplier: 0.5,
    },
  },
  employee: {
    estimatedContributionRate: 0.0919,
    estimatedEmployerContributionRate: 0.2381,
  },
  localTaxes: {
    estimatedRegionalRate: 1.73,
    estimatedMunicipalRate: 0.8,
  },
  forfettario: {
    ordinaryRevenueThreshold: 85_000,
    immediateExitThreshold: 100_000,
    priorEmploymentIncomeThreshold: 35_000,
    startupRate: 0.05,
    ordinaryRate: 0.15,
  },
  srl: {
    estimatedFixedCosts: 4_000,
    iresRate: 0.24,
    estimatedIrapRate: 0.039,
    dividendRate: 0.26,
  },
} as const

