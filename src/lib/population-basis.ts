import type { ClientInputs, PopulationBasis } from '@/types';

/** Average covered members (employee + dependents) per employee. */
export const MEMBERS_PER_EMPLOYEE = 2.2;

/** Number of covered members implied by an employee count. */
export function employeesToMembers(employeeCount: number): number {
  return employeeCount * MEMBERS_PER_EMPLOYEE;
}

/** The population every calculation runs against, based on the selected basis. */
export function getAnalysisPopulation(
  inputs: Pick<ClientInputs, 'employeeCount' | 'populationBasis'>
): number {
  return inputs.populationBasis === 'members'
    ? employeesToMembers(inputs.employeeCount)
    : inputs.employeeCount;
}

/**
 * Share of the analysis population that is adult. Employees are all adults,
 * so the adult-percentage input only applies to total membership.
 */
export function getEffectiveAdultPercentage(
  inputs: Pick<ClientInputs, 'adultPercentage' | 'populationBasis'>
): number {
  return inputs.populationBasis === 'members' ? inputs.adultPercentage : 1;
}

export interface PopulationLabels {
  /** "employees" | "covered members" */
  plural: string;
  /** "Employees" | "Total Covered Members" */
  title: string;
  /** "Adult employees" | "Adult members" — used in denominator labels */
  adultTitle: string;
  /** "Total employees" | "Total members" */
  totalTitle: string;
}

export function getPopulationLabels(basis: PopulationBasis): PopulationLabels {
  return basis === 'members'
    ? {
        plural: 'covered members',
        title: 'Total Covered Members',
        adultTitle: 'Adult members',
        totalTitle: 'Total members',
      }
    : {
        plural: 'employees',
        title: 'Employees',
        adultTitle: 'Employees',
        totalTitle: 'Employees',
      };
}
