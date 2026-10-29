import { z } from 'zod/v4';

export const clientInputsSchema = z.object({
  clientName: z.string().max(200).default(''),
  totalCoveredMembers: z
    .number()
    .int()
    .min(1, 'Must be at least 1')
    .max(10_000_000, 'Maximum 10,000,000 members'),
  analysisYear: z
    .number()
    .int()
    .min(2020)
    .max(2030),
  adultPercentage: z
    .number()
    .min(0, 'Cannot be negative')
    .max(1, 'Cannot exceed 100%'),
  employerPaidShare: z
    .number()
    .min(0, 'Cannot be negative')
    .max(1, 'Cannot exceed 100%'),
  bhTreatmentRate: z
    .number()
    .min(0)
    .max(1)
    .nullable(),
  selectedCostBenchmarkId: z.string(),
  recoverableCostPercentage: z
    .number()
    .min(0, 'Cannot be negative')
    .max(1, 'Cannot exceed 100%')
    .nullable(),
});

export const scenarioAssumptionsSchema = z.object({
  outreachRate: z.number().min(0).max(1),
  initiationRate: z.number().min(0).max(1),
  completionRate: z.number().min(0).max(1),
  averageVisits: z.number().min(0).max(100),
  costPerVisit: z.number().min(0).max(10000),
  additionalAdminCostPerMember: z.number().min(0).max(50000),
  savingsPerTreatedMember: z.number().min(0).max(100000).nullable(),
  recoverablePercentage: z.number().min(0).max(1).nullable(),
});

export const scenarioSetSchema = z.object({
  conservative: scenarioAssumptionsSchema,
  base: scenarioAssumptionsSchema,
  optimistic: scenarioAssumptionsSchema,
});

export type ClientInputsSchema = z.infer<typeof clientInputsSchema>;
export type ScenarioAssumptionsSchema = z.infer<typeof scenarioAssumptionsSchema>;
