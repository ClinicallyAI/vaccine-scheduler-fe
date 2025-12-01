import React from "react";
import { format } from "date-fns";
import { TimeSlot, Service } from "@/lib/types";
import { formatNZTime } from "@/utils/time";

interface AppointmentSummaryProps {
  selectedDate: Date | undefined;
  selectedTimeSlot: TimeSlot | null;
  totalDuration: number;
  selectedServices: Service[];
  isMultipleVaccines: boolean;
}

const AppointmentSummary: React.FC<AppointmentSummaryProps> = ({
  selectedDate,
  selectedTimeSlot,
  totalDuration,
  selectedServices,
  isMultipleVaccines,
}) => {
  if (!selectedDate || !selectedTimeSlot) return null;

  return (
    <div className="bg-primary/10 p-4 rounded-md mb-6">
      <h3 className="font-medium text-primary mb-2">Your selected appointment</h3>
      <p>
        <span className="font-semibold">Date:</span> {format(selectedDate, "EEEE, MMMM d, yyyy")}
      </p>
      <p>
        <span className="font-semibold">Time:</span> {formatNZTime(selectedTimeSlot.startTime)} - {formatNZTime(selectedTimeSlot.endTime)}
      </p>

      <p>
        <span className="font-semibold">Duration:</span> {totalDuration} minutes
      </p>
      {selectedServices.length > 1 && (
        <p>
          <span className="font-semibold">Services:</span> {selectedServices.map((s) => s.name).join(" + ")}
        </p>
      )}
      {isMultipleVaccines && <p className="text-sm text-gray-600 mt-1">Both vaccines can be administered in one 15-minute appointment</p>}
    </div>
  );
};

export default AppointmentSummary;
