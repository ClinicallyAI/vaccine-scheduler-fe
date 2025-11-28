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

export type RecordStatus = "Reminder Scheduled" | "Sent" | "Overdue" | "Booked" | "Completed" | "Did not Attend" | "Walk-in";

export type BookingStatus = "Booked" | "Completed" | "Did not Attend" | "Walk-in";
