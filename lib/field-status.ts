import { Field, FieldUpdate } from "@prisma/client";
import { FieldStage } from "../types";

export type FieldStatus = "active" | "at_risk" | "completed";

// Expected days per crop stage (reasonable defaults)
const STAGE_DURATION_DAYS: Record<FieldStage, number> = {
  [FieldStage.PLANTED]: 14,
  [FieldStage.GROWING]: 60,
  [FieldStage.READY]: 14,
  [FieldStage.HARVESTED]: 0,
};

export function computeFieldStatus(
  field: Field & { updates: FieldUpdate[] }
): FieldStatus {
  // Rule 1: Harvested = Completed
  if (field.stage === FieldStage.HARVESTED) return "completed";

  const now = new Date();
  const plantingDate = new Date(field.plantingDate);
  const daysSincePlanting = Math.floor(
    (now.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Rule 2: Days-since-planting overdue check
  // Sum expected durations up to current stage
  const stageOrder: FieldStage[] = [
    FieldStage.PLANTED,
    FieldStage.GROWING,
    FieldStage.READY,
    FieldStage.HARVESTED,
  ];
  const currentStageIndex = stageOrder.indexOf(field.stage as FieldStage);
  
  if (currentStageIndex > -1) {
    const expectedDaysToCurrentStage = stageOrder
      .slice(0, currentStageIndex + 1)
      .reduce((sum, s) => sum + STAGE_DURATION_DAYS[s], 0);

    if (daysSincePlanting > expectedDaysToCurrentStage * 1.3) {
      // 30% overdue threshold
      return "at_risk";
    }
  }

  // Rule 3: No update in 7+ days = at risk
  const sortedUpdates = [...field.updates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const lastUpdate = sortedUpdates[0];

  if (lastUpdate) {
    const daysSinceUpdate = Math.floor(
      (now.getTime() - new Date(lastUpdate.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (daysSinceUpdate > 7) return "at_risk";
  } else {
    // Never updated and more than 7 days since planting
    if (daysSincePlanting > 7) return "at_risk";
  }

  return "active";
}
