import { useMemo } from "react";
import { calculateAge, AgeCalculationResult } from "@/utils/ageCalculation";

export const useAgeCalculation = (day: string, month: string, year: string): AgeCalculationResult => {
  return useMemo(() => {
    return calculateAge(day, month, year);
  }, [day, month, year]);
};
