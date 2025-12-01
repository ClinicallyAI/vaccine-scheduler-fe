import { RecordStatus } from "@/constants";

export interface ServiceRecord {
  id: string;
  patientName: string;
  nhiNumber: string;
  contactNumber: string;
  email?: string | null;
  vaccineType: string; // service name
  isMedical: boolean;
  dueDate: string | null; // ISO date
  status: RecordStatus;
  bookedDate: string | null; // ISO date
  serviceDate: string | null; // ISO date (completed)
  isWalkIn: boolean;
  dob?: Date | null;
}

// Re-export for convenience
export type { RecordStatus };

export type BookingStatus = "Booked" | "Completed" | "Did not Attend" | "Walk-in";
