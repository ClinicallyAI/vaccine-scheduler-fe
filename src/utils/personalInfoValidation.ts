import * as z from "zod";

/**
 * Utility functions for personal information form validation
 */

/**
 * Create dynamic schema based on age and booking type
 * @param age - Patient's age
 * @param bookingType - Type of booking (myself or other)
 * @returns Zod schema with dynamic validation rules
 */
export const createPersonalInfoSchema = (age: number, bookingType: string) => {
  const baseSchema = z.object({
    fullName: z.string().min(1, { message: "Name is required" }),
    dobDay: z.string().min(1, { message: "Day is required" }),
    dobMonth: z.string().min(1, { message: "Month is required" }),
    dobYear: z.string().min(1, { message: "Year is required" }),
    bookingType: z.enum(["myself", "other"], {
      required_error: "Please select who you're booking for",
    }),
    bookerName: z.string().optional(),
    bookerPhone: z.string().optional(),
    bookerEmail: z.string().optional(),
    bookerRelationship: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
    nhiNumber: z.string().optional(),
    gpContact: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    emergencyContactRelationship: z.string().optional(),
    useBookerAsEmergencyContact: z.boolean().optional(),
  });

  return baseSchema
    .refine(
      (data) => {
        // Validate the date is valid
        const day = parseInt(data.dobDay);
        const month = parseInt(data.dobMonth);
        const year = parseInt(data.dobYear);
        
        try {
          const date = new Date(year, month - 1, day);
          return date.getFullYear() === year && 
                date.getMonth() === month - 1 && 
                date.getDate() === day;
        } catch (e) {
          return false;
        }
      },
      {
        message: "Invalid date",
        path: ["dobDay"],
      }
    )
    .refine(
      (data) => {
        // For patients under 16, validate booker info is required
        if (age < 16) {
          return !!data.bookerName && !!data.bookerPhone && !!data.bookerEmail;
        }
        return true;
      },
      {
        message: "Booker information is required for patients under 16",
        path: ["bookerName"],
      }
    )
    .refine(
      (data) => {
        // For booking for other (regardless of age), validate booker info
        if (bookingType === "other") {
          return !!data.bookerName && !!data.bookerPhone && !!data.bookerEmail;
        }
        return true;
      },
      {
        message: "Booker information is required when booking for someone else",
        path: ["bookerName"],
      }
    )
    .refine(
      (data) => {
        // For patients 16+ booking for themselves, validate contact info
        if (age >= 16 && bookingType === "myself") {
          return !!data.phone && !!data.email && !!data.address;
        }
        return true;
      },
      {
        message: "Contact information is required",
        path: ["phone"],
      }
    )
    .refine(
      (data) => {
        // Emergency contact is MANDATORY for ALL users under 16
        if (age < 16) {
          // If using booker details, that's acceptable
          if (data.useBookerAsEmergencyContact && bookingType === "other") {
            return true;
          }
          // Otherwise, emergency contact name and phone are required
          return !!data.emergencyContactName && !!data.emergencyContactPhone;
        }
        
        // For patients 16+, emergency contact is still required
        return !!data.emergencyContactName && !!data.emergencyContactPhone;
      },
      {
        message: "Emergency contact is required",
        path: ["emergencyContactName"],
      }
    );
};

/**
 * Check if a form section has validation errors
 * @param section - Section name to check
 * @param validationResult - Zod validation result
 * @returns true if section has errors, false otherwise
 */
export const sectionHasErrors = (section: string, validationResult: any): boolean => {
  if (validationResult.success) return false;
  
  const errorFields = validationResult.error.errors.map((error: any) => error.path[0]);
  
  switch(section) {
    case "basic-info":
      return errorFields.some((field: string) => ["fullName", "dobDay", "dobMonth", "dobYear", "bookingType"].includes(field));
    case "booker-info":
      return errorFields.some((field: string) => ["bookerName", "bookerPhone", "bookerEmail", "bookerRelationship"].includes(field));
    case "contact-info":
      return errorFields.some((field: string) => ["phone", "email", "address"].includes(field));
    case "emergency-contact":
      return errorFields.some((field: string) => ["emergencyContactName", "emergencyContactPhone", "emergencyContactRelationship"].includes(field));
    case "optional-info":
      return errorFields.some((field: string) => ["nhiNumber", "gpContact"].includes(field));
    default:
      return false;
  }
};
