export interface DaySchedule {
  isOpen: boolean;
  startTime: string; // Format: "09:00"
  endTime: string; // Format: "17:00"
}

export interface OpeningHours {
  "1": DaySchedule;
  "2": DaySchedule;
  "3": DaySchedule;
  "4": DaySchedule;
  "5": DaySchedule;
  "6": DaySchedule;
  "7": DaySchedule;
}

export interface PharmacyConfig {
  openingHours: OpeningHours;
  lastUpdated: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  schedule: OpeningHours; // Individual staff schedule
  serviceAssignments: string[]; // @deprecated - Staff assignments now managed via Service.staff_ids. This field is maintained for backward compatibility but not used.
}

export interface StaffConfig {
  staff: Staff[];
  lastUpdated: string;
}

export interface Service {
  id: string;
  name: string;
  category: "vaccination" | "general";
  duration: number; // in minutes
  pricing: {
    type: "fixed" | "free" | "medication_additional";
    amount?: number; // for fixed pricing
  };
  description: string;
  isActive: boolean;
}

export interface ServiceConfig {
  services: Service[];
  lastUpdated: string;
}

// Staff-Service Assignments
export interface StaffServiceAssignment {
  id: string;
  staffId: string;
  serviceId: string;
  isActive: boolean;
}

export interface AssignmentConfig {
  assignments: StaffServiceAssignment[];
  lastUpdated: string;
}

export const PREDEFINED_SERVICES: Omit<Service, "id" | "isActive">[] = [
  // Vaccinations
  {
    name: "COVID-19 Vaccination",
    category: "vaccination",
    duration: 15,
    pricing: { type: "fixed", amount: 25 },
    description: "COVID-19 vaccination service",
  },
  {
    name: "Flu Vaccination",
    category: "vaccination",
    duration: 15,
    pricing: { type: "fixed", amount: 20 },
    description: "Annual flu vaccination",
  },
  {
    name: "Travel Vaccinations",
    category: "vaccination",
    duration: 30,
    pricing: { type: "fixed", amount: 50 },
    description: "Vaccinations for international travel",
  },
  {
    name: "HPV Vaccination",
    category: "vaccination",
    duration: 15,
    pricing: { type: "fixed", amount: 150 },
    description: "Human Papillomavirus vaccination",
  },
  {
    name: "Meningococcal B",
    category: "vaccination",
    duration: 15,
    pricing: { type: "fixed", amount: 120 },
    description: "Meningococcal B vaccination",
  },
  {
    name: "Measles, Mumps and Rubella - MMR",
    category: "vaccination",
    duration: 15,
    pricing: { type: "fixed", amount: 45 },
    description: "MMR vaccination",
  },
  {
    name: "Whooping Cough",
    category: "vaccination",
    duration: 15,
    pricing: { type: "fixed", amount: 35 },
    description: "Whooping cough vaccination",
  },
  {
    name: "Shingles Vaccination",
    category: "vaccination",
    duration: 15,
    pricing: { type: "medication_additional" },
    description: "Shingles vaccination",
  },
  {
    name: "Childhood vaccinations (or catch up)",
    category: "vaccination",
    duration: 20,
    pricing: { type: "fixed", amount: 30 },
    description: "Childhood vaccination program",
  },

  // General Services
  {
    name: "Acne Treatment",
    category: "general",
    duration: 20,
    pricing: { type: "medication_additional" },
    description: "Acne consultation and treatment",
  },
  {
    name: "Conjunctivitis Treatment",
    category: "general",
    duration: 15,
    pricing: { type: "fixed", amount: 25 },
    description: "Pink eye consultation and treatment",
  },
  {
    name: "Emergency Contraception",
    category: "general",
    duration: 15,
    pricing: { type: "fixed", amount: 30 },
    description: "Emergency contraceptive consultation",
  },
  {
    name: "Ear Piercing",
    category: "general",
    duration: 20,
    pricing: { type: "fixed", amount: 40 },
    description: "Professional ear piercing service",
  },
  {
    name: "INR Testing",
    category: "general",
    duration: 10,
    pricing: { type: "fixed", amount: 15 },
    description: "International Normalized Ratio blood test",
  },
  {
    name: "Passport Photos",
    category: "general",
    duration: 10,
    pricing: { type: "fixed", amount: 15 },
    description: "Official passport photography",
  },
  {
    name: "Sick Leave Certificates",
    category: "general",
    duration: 15,
    pricing: { type: "fixed", amount: 25 },
    description: "Medical certificate for sick leave",
  },
  {
    name: "UTI Antibiotics",
    category: "general",
    duration: 15,
    pricing: { type: "medication_additional" },
    description: "Urinary tract infection consultation",
  },
  {
    name: "Vitamin B12 Injections",
    category: "general",
    duration: 15,
    pricing: { type: "fixed", amount: 30 },
    description: "Vitamin B12 injection service",
  },
  {
    name: "Sore Throat Screening (Under 19)",
    category: "general",
    duration: 15,
    pricing: { type: "fixed", amount: 20 },
    description: "Sore throat consultation for under 19s",
  },
  {
    name: "Erectile Dysfunction",
    category: "general",
    duration: 20,
    pricing: { type: "medication_additional" },
    description: "ED consultation and treatment",
  },
  {
    name: "Weight Loss Consultation",
    category: "general",
    duration: 30,
    pricing: { type: "fixed", amount: 50 },
    description: "Weight management consultation",
  },
  {
    name: "Skin Infections",
    category: "general",
    duration: 20,
    pricing: { type: "medication_additional" },
    description: "Skin infection consultation and treatment",
  },
];

export const DEFAULT_OPENING_HOURS: OpeningHours = {
  "1": { isOpen: true, startTime: "09:00", endTime: "17:00" },
  "2": { isOpen: true, startTime: "09:00", endTime: "17:00" },
  "3": { isOpen: true, startTime: "09:00", endTime: "17:00" },
  "4": { isOpen: true, startTime: "09:00", endTime: "17:00" },
  "5": { isOpen: true, startTime: "09:00", endTime: "17:00" },
  "6": { isOpen: true, startTime: "09:00", endTime: "13:00" },
  "7": { isOpen: false, startTime: "09:00", endTime: "17:00" },
};
