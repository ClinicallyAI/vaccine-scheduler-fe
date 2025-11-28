export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface PharmacyAvailability {
  date: string;
  timeSlots: TimeSlot[];
}

export interface BusinessHours {
  weekdays: string;
  weekends?: string;
  saturday?: string;
  sunday?: string;
}

export type Recommendation = {
  serviceId: number;
};

export interface Pharmacy {
  id: string;
  name: string;
  logo: string;
  address: string;
  phone_number: string;
  email: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  is_medical: boolean;
  price?: number;
  price_is_varies: boolean;
  is_active?: boolean;
  screeningQuestions: ScreeningQuestion[];
  recommendations: Recommendation[];
}

export interface ScreeningQuestion {
  id: string;
  question: string;
  type: "radio" | "checkbox" | "text";
  options?: string[];
  required: boolean;
  warningType?: "passthrough" | "stop" | "pregnancy" | "none";
  conditionalLogic?: {
    serviceId?: string;
    gender?: "male" | "female";
    minAge?: number;
    maxAge?: number;
  };
}

export interface VoucherInfo {
  hasVoucher: boolean;
  file?: File;
  fileName?: string;
  fileSize?: number;
  uploadedAt?: string;
  fileDataUrl?: string;
}

export interface VaccineRecommendation {
  primaryServiceId: string;
  recommendedServiceId: string;
  title: string;
  description: string;
  benefits: string[];
}

export interface ProductRecommendationRequest {
  interests: string[];
  specificRequests?: string;
  requestedAt: string;
}

export interface BookingFormData {
  services: string[]; // Changed from serviceId to support multiple services
  pharmacyId: string;
  recommendedServiceId?: string;
  recommendationAccepted: boolean;
  calculatedAge: number;
  personalInfo: {
    fullName: string;
    dateOfBirth: Date | null;
    phone: string;
    email: string;
    address: string;
    nhiNumber?: string;
    gpContact?: string;
    bookingType: "myself" | "other";
    bookerInfo?: {
      name: string;
      phone: string;
      email: string;
      relationship: string;
    };
    isPregnantOrBreastfeeding: boolean;
    isPregnantOrPlanningPregnancy: boolean;
    privacyConsentGiven: boolean;
  };
  appointment: {
    date: string;
    timeSlot: TimeSlot | null;
    type: "scheduled" | "walk-in";
  };
  productRecommendation?: ProductRecommendationRequest;
}
