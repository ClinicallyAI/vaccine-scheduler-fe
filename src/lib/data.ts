import { Pharmacy, Service, ScreeningQuestion, VaccineRecommendation } from "./types";
import { addDays, format } from "date-fns";

// Generate availability for the next 30 days based on business hours
const generateAvailability = (startDate: Date = new Date(), businessHours: { start: number; end: number } = { start: 9, end: 17 }) => {
  const availability = [];

  for (let i = 0; i < 30; i++) {
    const currentDate = addDays(startDate, i);
    const dateStr = format(currentDate, "yyyy-MM-dd");

    // Generate time slots based on provided business hours with 15 minute intervals
    const timeSlots = [];
    const startHour = businessHours.start;
    const endHour = businessHours.end;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const startHourStr = hour.toString().padStart(2, "0");
        const startMinuteStr = minute.toString().padStart(2, "0");
        const endMinute = minute + 15;
        const endHourCalc = endMinute >= 60 ? hour + 1 : hour;
        const endMinuteCalc = endMinute >= 60 ? 0 : endMinute;
        const endHourStr = endHourCalc.toString().padStart(2, "0");
        const endMinuteStr = endMinuteCalc.toString().padStart(2, "0");

        // Don't add slots that would end after business hours
        if (endHourCalc <= endHour) {
          timeSlots.push({
            startTime: `${dateStr}T${startHourStr}:${startMinuteStr}:00`,
            endTime: `${dateStr}T${endHourStr}:${endMinuteStr}:00`,
            available: Math.random() > 0.3, // 70% chance of availability
          });
        }
      }
    }

    availability.push({
      date: dateStr,
      timeSlots,
    });
  }

  return availability;
};

// Vaccine recommendation mappings
export const vaccineRecommendations: VaccineRecommendation[] = [
  {
    primaryServiceId: "1", // Flu
    recommendedServiceId: "2", // COVID
    title: "Complete Your Protection with COVID-19 Vaccine",
    description: "Get both vaccines in one convenient visit",
    benefits: ["Save time with one appointment", "Complete protection against respiratory viruses", "Recommended by health professionals"],
  },
  {
    primaryServiceId: "2", // COVID
    recommendedServiceId: "1", // Flu
    title: "Add Flu Vaccination for Complete Protection",
    description: "Protect yourself against both COVID-19 and seasonal flu",
    benefits: ["Save time with one appointment", "Double protection in flu season", "Safe to receive both vaccines together"],
  },
  {
    primaryServiceId: "8", // Boostrix
    recommendedServiceId: "1", // Flu
    title: "Add Flu Vaccination for Comprehensive Protection",
    description: "Protect yourself against tetanus, diphtheria, pertussis and seasonal flu",
    benefits: ["Save time with one appointment", "Comprehensive respiratory and bacterial protection", "Recommended during flu season"],
  },
  {
    primaryServiceId: "6", // Shingles
    recommendedServiceId: "1", // Flu
    title: "Add Flu Vaccination for Complete Protection",
    description: "Protect yourself against shingles and seasonal flu",
    benefits: ["Save time with one appointment", "Double protection for older adults", "Both vaccines recommended for 65+ age group"],
  },
];

// In-memory store for pharmacy data (in a real app, this would be a database)
let pharmacyDataStore: Pharmacy[] = [
  {
    id: "1",
    slug: "your-pharmacy-name",
    name: "Your Pharmacy Name",
    logo: "",
    address: "123 Main Street",
    city: "Your City",
    state: "Your State",
    zipCode: "12345",
    phone: "(123) 456-7890",
    email: "info@yourpharmacy.com",
    services: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], // All services
    availability: generateAvailability(new Date(), { start: 9, end: 19 }), // 9 AM to 7 PM
    businessHours: {
      weekdays: "9:00 AM – 7:00 PM",
      weekends: "10:00 AM – 6:00 PM",
    },
  },
];

export const pharmacies: Pharmacy[] = pharmacyDataStore;

export const services: Service[] = [
  // Vaccination Services
  {
    id: "1",
    title: "Flu Vaccination",
    description: "Protect yourself against seasonal influenza with our flu vaccination service.",
    duration: 15,
    screeningQuestions: [
      {
        id: "flu1",
        question: "Have you had a flu vaccination before?",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
        conditionalLogic: {
          serviceId: "1",
        },
      },
    ],
  },
  {
    id: "2",
    title: "COVID-19 Vaccination",
    description: "Get vaccinated against COVID-19 with our safe and efficient service.",
    duration: 15,
    screeningQuestions: [
      {
        id: "covid1",
        question: "Have you had a previous COVID-19 vaccination?",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
        conditionalLogic: {
          serviceId: "2",
        },
      },
      {
        id: "covid2",
        question: "Have you ever had myocarditis or pericarditis?",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
        conditionalLogic: {
          serviceId: "2",
        },
      },
    ],
  },
  {
    id: "3",
    title: "HPV Vaccination",
    description: "Human papillomavirus vaccination for protection against cervical cancer and other HPV-related conditions.",
    duration: 15,
    screeningQuestions: [
      {
        id: "hpv1",
        question: "Have you had an HPV vaccination before?",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
        conditionalLogic: {
          serviceId: "3",
        },
      },
    ],
  },
  {
    id: "5",
    title: "MMR Vaccination",
    description: "Combined measles, mumps, and rubella vaccination for comprehensive protection.",
    duration: 15,
    screeningQuestions: [
      {
        id: "mmr1",
        question: "Have you had an MMR vaccination before?",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
        conditionalLogic: {
          serviceId: "5",
        },
      },
    ],
  },
  {
    id: "6",
    title: "Shingles Vaccination",
    description: "Protect against shingles (herpes zoster) with our vaccination service.",
    duration: 15,
    screeningQuestions: [
      {
        id: "shingles1",
        question: "Have you had shingles before?",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
        conditionalLogic: {
          serviceId: "6",
        },
      },
    ],
  },
  {
    id: "7",
    title: "Childhood Vaccination",
    description: "Essential childhood vaccinations including DTP, polio, and others as recommended.",
    duration: 20,
    screeningQuestions: [
      {
        id: "childhood1",
        question: "Is this for catch-up vaccinations?",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
        conditionalLogic: {
          serviceId: "7",
        },
      },
    ],
  },
  {
    id: "8",
    title: "Boostrix Vaccination",
    description: "Tetanus, diphtheria, and pertussis (whooping cough) booster vaccination.",
    duration: 15,
    screeningQuestions: [
      {
        id: "boostrix1",
        question: "When did you last have a tetanus vaccination?",
        type: "radio",
        options: ["Less than 5 years ago", "5-10 years ago", "More than 10 years ago", "Never/Don't know"],
        required: true,
        conditionalLogic: {
          serviceId: "8",
        },
      },
    ],
  },
  {
    id: "9",
    title: "Meningococcal Vaccination",
    description: "Protection against meningococcal disease and bacterial meningitis.",
    duration: 15,
    screeningQuestions: [
      {
        id: "meningo1",
        question: "Have you had a meningococcal vaccination before?",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
        conditionalLogic: {
          serviceId: "9",
        },
      },
    ],
  },
  // General Pharmacy Services
  {
    id: "4",
    title: "Ear Piercing",
    description: "Professional ear piercing service in a safe and clean environment.",
    duration: 15,
    price: 35,
    screeningQuestions: [
      {
        id: "ear1",
        question: "Do you have any allergies to metals?",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
        conditionalLogic: {
          serviceId: "4",
        },
      },
    ],
  },
  {
    id: "10",
    title: "Passport Photo",
    description: "Professional passport photos taken to official standards and specifications.",
    duration: 10,
    price: 15,
    screeningQuestions: [
      {
        id: "passport1",
        question: "Do you need photos for a specific country?",
        type: "radio",
        options: ["New Zealand", "Australia", "UK", "USA", "Other"],
        required: true,
        conditionalLogic: {
          serviceId: "10",
        },
      },
    ],
  },
];

export const healthScreeningQuestions: ScreeningQuestion[] = [
  {
    id: "vaccination4Weeks",
    question: "I've had another vaccination in the last 4 weeks",
    type: "checkbox",
    required: false,
    warningType: "passthrough",
  },
  {
    id: "severeReaction",
    question: "I've ever had a severe reaction to a vaccine",
    type: "checkbox",
    required: false,
    warningType: "stop",
  },
  {
    id: "allergies",
    question: "I am seriously allergic to egg, rubber latex, neomycin or gelatin",
    type: "checkbox",
    required: false,
    warningType: "stop",
  },
  {
    id: "bloodThinners",
    question: "I'm taking blood thinners or have bleeding problems",
    type: "checkbox",
    required: false,
    warningType: "passthrough",
  },
  {
    id: "pregnant",
    question: "I am or could be pregnant",
    type: "checkbox",
    required: false,
    warningType: "pregnancy",
  },
  {
    id: "breastfeeding",
    question: "I'm currently breastfeeding",
    type: "checkbox",
    required: false,
    warningType: "passthrough",
  },
  {
    id: "none",
    question: "None of these apply to me",
    type: "checkbox",
    required: false,
    warningType: "none",
  },
];

export function getPharmacyBySlug(slug: string): Pharmacy | undefined {
  return pharmacyDataStore.find((pharmacy) => pharmacy.slug === slug);
}

export function getServiceById(id: string): Service | undefined {
  return services.find((service) => service.id === id);
}

export function getServicesForPharmacy(pharmacyId: string): Service[] {
  const pharmacy = pharmacyDataStore.find((p) => p.id === pharmacyId);
  if (!pharmacy) return [];

  return services.filter((service) => pharmacy.services.includes(service.id));
}

export function getVaccineRecommendation(primaryServiceId: string): VaccineRecommendation | undefined {
  return vaccineRecommendations.find((rec) => rec.primaryServiceId === primaryServiceId);
}

export function getMultipleServicesById(serviceIds: string[]): Service[] {
  return services.filter((service) => serviceIds.includes(service.id));
}

export function calculateTotalDuration(serviceIds: string[]): number {
  const selectedServices = getMultipleServicesById(serviceIds);
  return selectedServices.reduce((total, service) => total + service.duration_minutes, 0);
}

// Functions to update pharmacy data (simulating database operations)
export function updatePharmacyData(pharmacyId: string, data: Partial<Pharmacy>): boolean {
  const index = pharmacyDataStore.findIndex((p) => p.id === pharmacyId);
  if (index === -1) return false;

  pharmacyDataStore[index] = { ...pharmacyDataStore[index], ...data };
  return true;
}

export function getAllPharmacies(): Pharmacy[] {
  return [...pharmacyDataStore];
}
