/**
 * Vaccine Recommendations API
 * Integrates with the backend vaccine recommendation endpoints
 *
 * API Contract Changes (Updated):
 * ================================
 *
 * 1. New Recommendation Status: "not_recommended"
 *    - Services with this status appear in "others" array without recommendationStatus/matchedRule
 *    - Use case: Age ranges where service is available but not recommended (e.g., Shingles for under 18)
 *
 * 2. Updated Service Filtering Logic:
 *    - Contraindicated: Completely hidden (not in recommended or others)
 *    - Recommended (funded/eligibility_confirmed/fees_apply): In "recommended" with status and rule
 *    - Not Recommended: In "others" WITHOUT status or rule
 *    - No Matching Rule: In "others" WITHOUT status or rule
 *
 * 3. New Rule Criteria Types:
 *    - age_max: age <= value (e.g., contraindications for infants)
 *    - birth_year_range: birthYear >= min && birthYear <= max
 *    - age_and_birth_year_min: age >= age && birthYear >= birthYear (differs from age_and_birth_year which uses birthYear < X)
 */

import api from "@/services/axios";

/**
 * Type definitions
 */

/**
 * Recommendation rule for vaccine eligibility
 * Defines the criteria and status for vaccine recommendations
 */
export interface RecommendationRule {
  id: string;
  serviceId: string;
  ruleName: string;
  /**
   * Criteria type for the recommendation rule:
   * - age_min: Minimum age requirement (age >= value)
   * - age_max: Maximum age requirement (age <= value)
   * - age_exact: Exact age requirement (age === value)
   * - age_range: Age range requirement (age >= min && age <= max)
   * - birth_year_min: Minimum birth year (birthYear >= value)
   * - birth_year_range: Birth year range (birthYear >= min && birthYear <= max)
   * - pregnancy: Pregnancy status requirement
   * - age_and_birth_year: Age AND birth year requirement (age >= age && birthYear < birthYear)
   * - age_and_birth_year_min: Age AND minimum birth year (age >= age && birthYear >= birthYear)
   */
  criteriaType:
    | "age_min"
    | "age_max"
    | "age_exact"
    | "age_range"
    | "birth_year_min"
    | "birth_year_range"
    | "pregnancy"
    | "age_and_birth_year"
    | "age_and_birth_year_min";
  criteriaValue: any;
  /**
   * Status of the recommendation:
   * - funded: Service is free for the user
   * - eligibility_confirmed: User meets basic criteria, vaccinator will confirm eligibility
   * - fees_apply: Service requires payment
   * - contraindicated: Service is not safe for the user (completely hidden from response)
   * - not_recommended: Service doesn't match user's profile but should still be visible in "others"
   */
  status: "funded" | "fees_apply" | "eligibility_confirmed" | "contraindicated" | "not_recommended";
  priority: number;
}

/**
 * Recommended service with recommendation details
 * NOTE: This interface represents services in the "recommended" array only.
 * Services in the "others" array will NOT have recommendationStatus or matchedRule fields.
 */
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
  /**
   * Recommendation status for this service
   * NOTE: Only appears for services in "recommended" array
   * Values: "funded" | "eligibility_confirmed" | "fees_apply"
   * Services with "not_recommended" status go to "others" without this field
   */
  recommendationStatus: "funded" | "eligibility_confirmed" | "fees_apply";
  /**
   * The rule that matched for this recommendation
   * NOTE: Only appears for services in "recommended" array
   */
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
 *
 * Response Structure:
 * - recommended: Services with status "funded", "eligibility_confirmed", or "fees_apply"
 *   - Each service includes recommendationStatus and matchedRule
 *   - NOTE: Frontend sorts by priority: funded → fees_apply → eligibility_confirmed
 *
 * - others: Services that don't match user's profile OR have "not_recommended" status
 *   - NO recommendationStatus or matchedRule fields
 *   - Includes both:
 *     1. Services with "not_recommended" status (visible but not recommended)
 *     2. Services with no matching rule
 *
 * - hidden: Services with "contraindicated" status (NOT included in response at all)
 *   - Example: MMR/HPV vaccines during pregnancy
 *
 * @param tenantId - The tenant/pharmacy ID
 * @param dateOfBirth - Patient's date of birth
 * @param isPregnant - Whether the patient is pregnant
 * @returns Object with recommended and others arrays
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
