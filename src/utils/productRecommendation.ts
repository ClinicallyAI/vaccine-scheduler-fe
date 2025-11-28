import { BookingFormData, Pharmacy } from "@/lib/types";

export interface ProductRecommendationPayload {
  patient: {
    fullName: string;
    phone: string;
    email: string;
    dateOfBirth: Date | null;
  };
  appointment: {
    date: string;
    timeSlot: string;
    services: string[];
  };
  pharmacy: {
    name: string;
    email: string;
    phone: string;
  };
  recommendation: {
    interests: string[];
    specificRequests?: string;
    requestedAt: string;
  };
}

export const submitProductRecommendationRequest = async (
  formData: BookingFormData,
  pharmacy: Pharmacy,
  interests: string[],
  specificRequests?: string
): Promise<void> => {
  const payload: ProductRecommendationPayload = {
    patient: {
      fullName: formData.personalInfo.fullName,
      phone: formData.personalInfo.phone,
      email: formData.personalInfo.email,
      dateOfBirth: formData.personalInfo.dateOfBirth,
    },
    appointment: {
      date: formData.appointment.date,
      timeSlot: formData.appointment.timeSlot
        ? `${formData.appointment.timeSlot.startTime} - ${formData.appointment.timeSlot.endTime}`
        : "",
      services: formData.services,
    },
    pharmacy: {
      name: pharmacy.name,
      email: pharmacy.email,
      phone: pharmacy.phone,
    },
    recommendation: {
      interests,
      specificRequests,
      requestedAt: new Date().toISOString(),
    },
  };

  // TODO: Replace with actual API endpoint when backend is ready
  console.log("Product recommendation request payload:", payload);

  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Product recommendation request sent successfully");
      resolve();
    }, 1000);
  });
};

export const trackRecommendationClick = (serviceType: string, pharmacyName: string): void => {
  // Analytics tracking
  console.log("Product recommendation click tracked:", {
    event: "product_recommendation_click",
    serviceType,
    pharmacyName,
    timestamp: new Date().toISOString(),
  });
};
