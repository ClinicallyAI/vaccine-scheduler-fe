import React from "react";
import { Calendar } from "@/components/ui/calendar";

interface DateSelectorProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  isDateDisabled: (date: Date) => boolean;
  getBusinessHours: (date: Date | undefined) => string;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateSelect,
  isDateDisabled,
  getBusinessHours,
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">1. Select a date</h3>
      <div className="border rounded-md p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          disabled={isDateDisabled}
          className="pointer-events-auto"
        />
      </div>
      {selectedDate && (
        <div className="mt-2 text-sm text-gray-500">
          Business hours: {getBusinessHours(selectedDate)}
        </div>
      )}
    </div>
  );
};

export default DateSelector;
