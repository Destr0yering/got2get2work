import { PilotMetrics } from "./models";

export interface PilotEconomics {
  enrollmentRate: number;
  recoveryRate: number;
  estimatedEmployerValue: number;
  estimatedPilotCost: number;
  estimatedNetValue: number;
}

export function calculatePilotEconomics(metrics: PilotMetrics): PilotEconomics {
  const enrollmentRate = metrics.eligibleEmployees > 0
    ? metrics.enrolledEmployees / metrics.eligibleEmployees
    : 0;
  const recoveryRate = metrics.recoveryAttempts > 0
    ? metrics.successfulRecoveries / metrics.recoveryAttempts
    : 0;
  const estimatedEmployerValue = metrics.estimatedAvoidedAbsences * metrics.valuePerAvoidedAbsence;
  const estimatedPilotCost = metrics.monthlyPlatformFee + metrics.monthlySubsidyBudget;
  return {
    enrollmentRate,
    recoveryRate,
    estimatedEmployerValue,
    estimatedPilotCost,
    estimatedNetValue: estimatedEmployerValue - estimatedPilotCost
  };
}
