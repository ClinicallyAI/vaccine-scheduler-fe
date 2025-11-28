
import { useMemo } from 'react';
import { format, isAfter, addHours } from 'date-fns';
import { TimeSlot, Pharmacy } from '@/lib/types';

/**
 * Custom hook to filter and process time slots for appointment booking
 * @param selectedDate - The selected appointment date
 * @param pharmacy - Pharmacy data containing availability
 * @returns Available time slots for the selected date
 */
export const useTimeSlots = (selectedDate: Date | undefined, pharmacy: Pharmacy): TimeSlot[] => {
  return useMemo(() => {
    if (!selectedDate) {
      return [];
    }
    
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const availabilityForDate = pharmacy.availability.find(a => a.date === dateStr);
    
    if (!availabilityForDate) {
      return [];
    }
    
    const now = new Date();
    const oneHourFromNow = addHours(now, 1);
    const isToday = format(selectedDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");
    
    // Filter slots that are available and in the future
    const validSlots = availabilityForDate.timeSlots.filter(slot => {
      if (!slot.available) {
        return false;
      }
      
      // Parse the slot time (assuming local time format)
      const slotDateTime = new Date(`${slot.startTime}`);
      
      // If it's today, only show slots that are more than 1 hour from now
      if (isToday) {
        return isAfter(slotDateTime, oneHourFromNow);
      }
      
      // For future dates, all available slots are valid
      return true;
    });
    
    // Sort slots from earliest to latest
    return validSlots.sort((a, b) => {
      const timeA = new Date(`${a.startTime}`).getTime();
      const timeB = new Date(`${b.startTime}`).getTime();
      return timeA - timeB;
    });
  }, [selectedDate, pharmacy.availability]);
};
