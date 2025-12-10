// /**
//  * Mock API for Vaccine Recommendations
//  *
//  * This simulates the backend API that would be called in production.
//  * In production, replace these calls with actual API calls to your backend.
//  */

// export interface RecommendationRule {
//   id: string;
//   serviceId: string;
//   ruleName: string;
//   criteriaType: "age_min" | "age_max" | "age_exact" | "age_range" | "birth_year_min" | "pregnancy" | "age_and_birth_year";
//   criteriaValue: any;
//   status: "funded" | "fees_apply" | "eligibility_confirmed" | "contraindicated";
//   priority: number;
// }

// export interface VaccineRecommendationInput {
//   age: number;
//   isPregnant: boolean;
//   birthYear: number;
//   pharmacyId?: string;
// }

// export interface RecommendedService {
//   id: string;
//   name: string;
//   description: string;
//   duration_minutes: number;
//   is_medical: boolean;
//   price?: number;
//   price_is_varies: boolean;
//   is_active?: boolean;
//   service_type?: 'vaccination' | 'general';
//   screeningQuestions: any[];
//   recommendations: any[];
//   recommendationStatus: "funded" | "eligibility_confirmed" | "fees_apply";
//   matchedRule: {
//     ruleName: string;
//     criteriaType: string;
//     status: string;
//   };
// }

// export interface VaccineUpsell {
//   primaryServiceId: string;
//   recommendedServiceId: string;
//   title: string;
//   description: string;
//   benefits: string[];
// }

// // Mock recommendation rules database
// // These would come from your backend in production
// const MOCK_RULES: RecommendationRule[] = [
//   // Flu vaccine rules
//   {
//     id: "1",
//     serviceId: "1", // Flu vaccine
//     ruleName: "Age 65+",
//     criteriaType: "age_min",
//     criteriaValue: 65,
//     status: "funded",
//     priority: 1,
//   },
//   {
//     id: "2",
//     serviceId: "1",
//     ruleName: "Pregnancy",
//     criteriaType: "pregnancy",
//     criteriaValue: true,
//     status: "funded",
//     priority: 2,
//   },
//   {
//     id: "3",
//     serviceId: "1",
//     ruleName: "All ages – refer to programme",
//     criteriaType: "age_min",
//     criteriaValue: 0,
//     status: "eligibility_confirmed",
//     priority: 3,
//   },

//   // COVID-19 vaccine rules
//   {
//     id: "4",
//     serviceId: "2", // COVID vaccine
//     ruleName: "Age 30+",
//     criteriaType: "age_min",
//     criteriaValue: 30,
//     status: "funded",
//     priority: 1,
//   },
//   {
//     id: "5",
//     serviceId: "2",
//     ruleName: "Pregnancy",
//     criteriaType: "pregnancy",
//     criteriaValue: true,
//     status: "funded",
//     priority: 2,
//   },
//   {
//     id: "6",
//     serviceId: "2",
//     ruleName: "Age 6 months – 29 yrs",
//     criteriaType: "age_range",
//     criteriaValue: { min: 0.5, max: 29 },
//     status: "eligibility_confirmed",
//     priority: 3,
//   },

//   // Shingles vaccine rules
//   {
//     id: "7",
//     serviceId: "6", // Shingles vaccine
//     ruleName: "Age 65 exactly",
//     criteriaType: "age_exact",
//     criteriaValue: 65,
//     status: "funded",
//     priority: 2,
//   },
//   {
//     id: "8",
//     serviceId: "6",
//     ruleName: "Age 50+",
//     criteriaType: "age_min",
//     criteriaValue: 50,
//     status: "fees_apply",
//     priority: 3,
//   },
//   {
//     id: "9",
//     serviceId: "6",
//     ruleName: "Age 18+",
//     criteriaType: "age_min",
//     criteriaValue: 18,
//     status: "eligibility_confirmed",
//     priority: 4,
//   },

//   // Childhood vaccines
//   {
//     id: "10",
//     serviceId: "7", // Childhood vaccines
//     ruleName: "Age 6 weeks – 12 yrs",
//     criteriaType: "age_range",
//     criteriaValue: { min: 0.115, max: 12 },
//     status: "eligibility_confirmed",
//     priority: 1,
//   },

//   // Boostrix (Tdap) vaccine rules
//   {
//     id: "11",
//     serviceId: "8", // Boostrix
//     ruleName: "Age 65+",
//     criteriaType: "age_min",
//     criteriaValue: 65,
//     status: "funded",
//     priority: 1,
//   },
//   {
//     id: "12",
//     serviceId: "8",
//     ruleName: "Pregnancy",
//     criteriaType: "pregnancy",
//     criteriaValue: true,
//     status: "funded",
//     priority: 2,
//   },
//   {
//     id: "13",
//     serviceId: "8",
//     ruleName: "Age 11 exactly",
//     criteriaType: "age_exact",
//     criteriaValue: 11,
//     status: "funded",
//     priority: 3,
//   },
//   {
//     id: "14",
//     serviceId: "8",
//     ruleName: "Age 45+",
//     criteriaType: "age_min",
//     criteriaValue: 45,
//     status: "eligibility_confirmed",
//     priority: 4,
//   },

//   // MMR vaccine rules
//   {
//     id: "15",
//     serviceId: "5", // MMR
//     ruleName: "Pregnancy",
//     criteriaType: "pregnancy",
//     criteriaValue: true,
//     status: "contraindicated",
//     priority: 1,
//   },
//   {
//     id: "16",
//     serviceId: "5",
//     ruleName: "Age 13+",
//     criteriaType: "age_min",
//     criteriaValue: 13,
//     status: "funded",
//     priority: 2,
//   },
//   {
//     id: "17",
//     serviceId: "5",
//     ruleName: "Born 1968 or later",
//     criteriaType: "birth_year_min",
//     criteriaValue: 1968,
//     status: "funded",
//     priority: 2,
//   },

//   // HPV vaccine rules
//   {
//     id: "18",
//     serviceId: "3", // HPV
//     ruleName: "Pregnancy",
//     criteriaType: "pregnancy",
//     criteriaValue: true,
//     status: "contraindicated",
//     priority: 1,
//   },
//   {
//     id: "19",
//     serviceId: "3",
//     ruleName: "Age 9–26 funded",
//     criteriaType: "age_range",
//     criteriaValue: { min: 9, max: 26 },
//     status: "funded",
//     priority: 2,
//   },
//   {
//     id: "20",
//     serviceId: "3",
//     ruleName: "Age 27–45 unfunded",
//     criteriaType: "age_range",
//     criteriaValue: { min: 27, max: 45 },
//     status: "fees_apply",
//     priority: 3,
//   },

//   // Meningococcal vaccine rules
//   {
//     id: "21",
//     serviceId: "9", // Meningococcal
//     ruleName: "Age 13–25",
//     criteriaType: "age_range",
//     criteriaValue: { min: 13, max: 25 },
//     status: "eligibility_confirmed",
//     priority: 1,
//   },
// ];

// // Mock upsell recommendations
// const MOCK_UPSELLS: VaccineUpsell[] = [
//   {
//     primaryServiceId: "1", // Flu
//     recommendedServiceId: "2", // COVID
//     title: "Complete Your Protection with COVID-19 Vaccine",
//     description: "Get both vaccines in one convenient visit",
//     benefits: [
//       "Save time with one appointment",
//       "Complete protection against respiratory viruses",
//       "Recommended by health professionals",
//       "Both vaccines can be administered safely together",
//     ],
//   },
//   {
//     primaryServiceId: "2", // COVID
//     recommendedServiceId: "1", // Flu
//     title: "Add Flu Vaccine for Complete Protection",
//     description: "Protect yourself against both viruses in one visit",
//     benefits: [
//       "Convenient single appointment",
//       "Double your protection this season",
//       "Safe to receive both vaccines together",
//       "Recommended during flu season",
//     ],
//   },
//   {
//     primaryServiceId: "8", // Boostrix
//     recommendedServiceId: "1", // Flu
//     title: "Add Flu Vaccination for Comprehensive Protection",
//     description: "Protect yourself against tetanus, diphtheria, pertussis and seasonal flu",
//     benefits: [
//       "Save time with one appointment",
//       "Comprehensive respiratory and bacterial protection",
//       "Recommended during flu season",
//       "Both vaccines can be administered together",
//     ],
//   },
//   {
//     primaryServiceId: "6", // Shingles
//     recommendedServiceId: "1", // Flu
//     title: "Add Flu Vaccination for Complete Protection",
//     description: "Protect yourself against shingles and seasonal flu",
//     benefits: [
//       "Save time with one appointment",
//       "Double protection for older adults",
//       "Both vaccines recommended for 65+ age group",
//       "Safe to receive both vaccines together",
//     ],
//   },
// ];

// /**
//  * Evaluate if a rule matches the user criteria
//  */
// function evaluateRule(rule: RecommendationRule, age: number, isPregnant: boolean, birthYear: number): boolean {
//   const { criteriaType, criteriaValue } = rule;

//   switch (criteriaType) {
//     case "age_min":
//       return age >= criteriaValue;

//     case "age_max":
//       return age <= criteriaValue;

//     case "age_exact":
//       return Math.floor(age) === criteriaValue;

//     case "age_range":
//       return age >= criteriaValue.min && age <= criteriaValue.max;

//     case "birth_year_min":
//       return birthYear >= criteriaValue;

//     case "pregnancy":
//       return isPregnant === criteriaValue;

//     case "age_and_birth_year":
//       const ageMatch = age >= criteriaValue.age;
//       const birthYearMatch = birthYear < criteriaValue.birthYear;
//       return ageMatch && birthYearMatch;

//     default:
//       return false;
//   }
// }

// /**
//  * Get vaccine recommendations based on user criteria
//  * This mocks the backend API endpoint: get-vaccine-recommendations
//  */
// export async function getVaccineRecommendations(
//   input: VaccineRecommendationInput,
//   services: any[]
// ): Promise<{ recommended: RecommendedService[]; others: any[] }> {
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 300));

//   const { age, isPregnant, birthYear } = input;

//   // Only process vaccination services
//   const vaccinationServices = services.filter((s) => s.service_type === "vaccination" || s.name?.toLowerCase().includes("vaccine"));

//   const serviceRecommendations: Map<string, RecommendedService> = new Map();
//   const contraindicatedServices: Set<string> = new Set();

//   // Evaluate rules for each service
//   for (const service of vaccinationServices) {
//     const serviceRules = MOCK_RULES.filter((rule) => rule.serviceId === service.id).sort((a, b) => a.priority - b.priority); // Lower priority number = higher priority

//     // Find the highest priority matching rule
//     for (const rule of serviceRules) {
//       if (evaluateRule(rule, age, isPregnant, birthYear)) {
//         if (rule.status === "contraindicated") {
//           contraindicatedServices.add(service.id);
//           break;
//         } else {
//           serviceRecommendations.set(service.id, {
//             ...service,
//             recommendationStatus: rule.status,
//             matchedRule: {
//               ruleName: rule.ruleName,
//               criteriaType: rule.criteriaType,
//               status: rule.status,
//             },
//           });
//           break; // Only use the highest priority matching rule
//         }
//       }
//     }
//   }

//   // Sort recommended services by status priority
//   const statusPriority = { funded: 1, eligibility_confirmed: 2, fees_apply: 3 };
//   const recommended = Array.from(serviceRecommendations.values()).sort((a, b) => {
//     const aPriority = statusPriority[a.recommendationStatus];
//     const bPriority = statusPriority[b.recommendationStatus];
//     return aPriority - bPriority;
//   });

//   // Other services (not recommended or contraindicated)
//   const recommendedIds = new Set(recommended.map((s) => s.id));
//   const others = vaccinationServices.filter((s) => !recommendedIds.has(s.id) && !contraindicatedServices.has(s.id));

//   return { recommended, others };
// }

// /**
//  * Get vaccine upsell recommendations
//  * This mocks the backend API endpoint: get-vaccine-upsells
//  */
// export async function getVaccineUpsells(selectedServiceIds: string[]): Promise<{ upsells: VaccineUpsell[] }> {
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 200));

//   const upsells = MOCK_UPSELLS.filter((upsell) => selectedServiceIds.includes(upsell.primaryServiceId));

//   return { upsells };
// }

// /**
//  * Helper: Calculate age from date of birth
//  */
// export function calculateAge(dateOfBirth: Date): number {
//   const today = new Date();
//   const birthDate = new Date(dateOfBirth);
//   let age = today.getFullYear() - birthDate.getFullYear();
//   const monthDiff = today.getMonth() - birthDate.getMonth();

//   if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//     age--;
//   }

//   // Return fractional age for infants
//   if (age === 0) {
//     const months = monthDiff < 0 ? 12 + monthDiff : monthDiff;
//     return months / 12;
//   }

//   return age;
// }

// /**
//  * Helper: Extract birth year from date of birth
//  */
// export function getBirthYear(dateOfBirth: Date): number {
//   return new Date(dateOfBirth).getFullYear();
// }
