import React from "react";
import { Button } from "@/components/ui/button";
import { TimeSlot } from "@/lib/types";
import { formatNZTime } from "@/utils/time";

interface TimeSlotSelectorProps {
  selectedDate: Date | undefined;
  selectedTimeSlot: TimeSlot | null;
  timeSlots: TimeSlot[];
  loading: boolean;
  onTimeSlotSelect: (timeSlot: TimeSlot) => void;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  selectedDate,
  selectedTimeSlot,
  timeSlots,
  loading,
  onTimeSlotSelect,
}) => {
  if (!selectedDate) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">2. Select a time</h3>
        <div className="border rounded-md p-8 text-center">
          <p className="text-gray-500">Please select a date to see available time slots.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">2. Select a time</h3>
        <div className="border rounded-md p-8 text-center">
          <p className="text-gray-500">Loading available time slots...</p>
        </div>
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">2. Select a time</h3>
        <div className="border rounded-md p-8 text-center">
          <p className="text-gray-500">No available appointments on this date. Please select another date.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">2. Select a time</h3>
      <div className="border rounded-md p-4 grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
        {timeSlots.map((timeSlot, index) => (
          <Button
            key={index}
            variant={selectedTimeSlot === timeSlot ? "default" : "outline"}
            className={selectedTimeSlot === timeSlot ? "border-2 border-primary" : ""}
            onClick={() => onTimeSlotSelect(timeSlot)}
          >
            {formatNZTime(timeSlot.startTime)}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TimeSlotSelector;
