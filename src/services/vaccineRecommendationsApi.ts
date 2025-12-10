/**
 * Vaccine Recommendations API
 * Integrates with the backend vaccine recommendation endpoints
 */

import api from "@/services/axios";

// Type definitions
export interface RecommendationRule {
  id: string;
  serviceId: string;
  ruleName: string;
  criteriaType: "age_min" | "age_max" | "age_exact" | "age_range" | "birth_year_min" | "pregnancy" | "age_and_birth_year";
  criteriaValue: any;
  status: "funded" | "fees_apply" | "eligibility_confirmed" | "contraindicated";
  priority: number;
}

export interface RecommendedService {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  is_medical: boolean;
  price?: number;
  price_is_varies: boolean;
  is_active?: boolean;
  service_type?: 'vaccination' | 'general';
  screeningQuestions: any[];
  recommendations: any[];
  recommendationStatus: "funded" | "eligibility_confirmed" | "fees_apply";
  matchedRule: {
    ruleName: string;
    criteriaType: string;
    status: string;
  };
}

export interface VaccineUpsell {
  primaryServiceId: string;
  recommendedServiceId: string;
  title: string;
  description: string;
  benefits: string[];
}

/**
 * Get vaccine recommendations based on patient criteria
 * POST /:tenantId/vaccine-recommendations
 */
export async function getVaccineRecommendations(
  tenantId: string,
  dateOfBirth: string | Date | null,
  isPregnant: boolean
): Promise<{ recommended: RecommendedService[]; others: any[] }> {
  if (!dateOfBirth) {
    // Return empty recommendations if no date of birth provided
    return { recommended: [], others: [] };
  }

  const response = await api.post(`/${tenantId}/vaccine-recommendations`, {
    dateOfBirth,
    isPregnant,
  });

  // Backend typically returns { data: { recommended: [...], others: [...] } }
  // or it might be response.data directly depending on backend structure
  const result = response.data.data || response.data;

  return result;
}

/**
 * Get vaccine upsell recommendations based on selected services
 * POST /vaccine-upsells
 */
export async function getVaccineUpsells(
  selectedServiceIds: string[]
): Promise<{ upsells: VaccineUpsell[] }> {
  const response = await api.post(`/vaccine-upsells`, {
    selectedServiceIds,
  });

  // Backend typically returns { data: { upsells: [...] } }
  // or it might be response.data directly depending on backend structure
  const result = response.data.data || response.data;

  return result;
}

/**
 * Helper: Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Return fractional age for infants
  if (age === 0) {
    const months = monthDiff < 0 ? 12 + monthDiff : monthDiff;
    return months / 12;
  }

  return age;
}

/**
 * Helper: Extract birth year from date of birth
 */
export function getBirthYear(dateOfBirth: Date): number {
  return new Date(dateOfBirth).getFullYear();
}
