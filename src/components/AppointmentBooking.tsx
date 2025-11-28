import React, { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { BookingFormData, TimeSlot, Pharmacy, Service } from "@/lib/types";
import { flagLunchAsUnavailable } from "@/utils/availabilityOverride";
import { formatNZTime } from "@/utils/time";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import api from "@/services/axios";

interface AppointmentBookingProps {
  formData: BookingFormData;
  pharmacy: Pharmacy;
  allServices: Service[];
  updateFormData: (data: Partial<BookingFormData>) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

interface DailyAvailability {
  date: string;
  timeSlots: AvailabilitySlot[];
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  formData,
  pharmacy,
  allServices,
  updateFormData,
  onNextStep,
  onPrevStep,
}) => {
  const [appointmentType, setAppointmentType] = useState<"scheduled" | "walk-in">(formData.appointment.type || "scheduled");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    formData.appointment.date ? new Date(formData.appointment.date) : undefined
  );

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(formData.appointment.timeSlot);

  const [rawAvailability, setRawAvailability] = useState<DailyAvailability[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState<boolean>(true);

  const selectedServices = allServices.filter((s) => formData.services.includes(String(s.id)));

  const isMultipleVaccines = selectedServices.length > 1 && selectedServices.every((service) => ["1", "2"].includes(String(service.id))); // IDs likely numeric, coerced to string

  const totalDuration = selectedServices[0]?.duration_minutes ?? 15;

  useEffect(() => {
    let cancelled = false;
    const fetchAvailability = async () => {
      try {
        setLoadingAvailability(true);
        let response;
        if (Number(pharmacy.id) === 2) {
          response = await api.post(`/tenants/${pharmacy.id}/service/availability`, { serviceId: selectedServices[0]?.id });
        } else {
          response = await api.get(`/tenants/${pharmacy.id}/availability`);
        }
        if (!cancelled) {
          setRawAvailability(response.data?.data?.availability ?? []);
        }
      } catch (err) {
        console.error("Failed to load availability:", err);
        if (!cancelled) setRawAvailability([]);
      } finally {
        if (!cancelled) setLoadingAvailability(false);
      }
    };

    fetchAvailability();
    return () => {
      cancelled = true;
    };
  }, [pharmacy.id]);

  const availability = React.useMemo(() => {
    const serviceId = selectedServices[0]?.id;
    if (!serviceId) return rawAvailability; // until selection is ready
    // Use pharmacy.id consistently
    return flagLunchAsUnavailable(rawAvailability, pharmacy.id, serviceId) || [];
  }, [rawAvailability, pharmacy.id, selectedServices]);

  const availableDates = availability.map((a) => new Date(a.date));

  const getTimeSlotsForDate = (date: Date | undefined): TimeSlot[] => {
    if (!date) return [];
    const dateStr = format(date, "yyyy-MM-dd");
    const dayAvailability = availability.find((a) => a.date === dateStr);
    return (dayAvailability?.timeSlots || []).filter((slot) => slot.available);
  };

  const getTodayDateStr = () => format(new Date(), "yyyy-MM-dd");

  const timeSlots = getTimeSlotsForDate(selectedDate);

  const getBusinessHours = (): string => {
    // Walk-in should reflect store hours (raw), not service-filtered availability
    const source = rawAvailability;
    if (!source || source.length === 0) return "Closed";

    const todayStr = getTodayDateStr();
    const dayAvailability = source.find((a) => a.date === todayStr);
    const slots = dayAvailability?.timeSlots || [];
    if (slots.length === 0) return "Closed";

    // first/last slot of the day defines business hours
    const first = new Date(slots[0].startTime);
    const last = new Date(slots[slots.length - 1].endTime);

    return `${formatNZTime(first)} – ${formatNZTime(last)}`;
  };

  const getBusinessHoursForDate = (date: Date | undefined): string => {
    if (!date) return "";

    const dateStr = format(date, "yyyy-MM-dd");
    const dayAvailability = availability.find((a) => a.date === dateStr);
    const slots = dayAvailability?.timeSlots || [];

    if (slots.length === 0) return "Closed";

    const first = new Date(slots[0].startTime);
    const last = new Date(slots[slots.length - 1].endTime);

    return `${formatNZTime(first)} – ${formatNZTime(last)}`;
  };

  const getWalkInValidationMessage = (): string | null => {
    if (!isPharmacyOpen()) {
      return "Pharmacy is currently closed";
    }
    return null;
  };

  const isPharmacyOpen = (): boolean => {
    // For walk-in, use raw store hours (ignore per-service filtering and slot.available)
    if (appointmentType === "walk-in") {
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const day = rawAvailability.find((a) => a.date === todayStr);
      const slots = day?.timeSlots || [];
      if (slots.length === 0) return false;

      const now = Date.now();
      const firstStart = new Date(slots[0].startTime).getTime();
      const lastEnd = new Date(slots[slots.length - 1].endTime).getTime();
      return now >= firstStart && now < lastEnd; // open if within store hours, even through lunch
    }

    // Scheduled: keep your existing behavior (respect service-filtered availability)
    if (!availability || availability.length === 0) return false;
    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");
    const dayAvailability = availability.find((a) => a.date === todayStr);
    if (!dayAvailability || !dayAvailability.timeSlots?.length) return false;

    return dayAvailability.timeSlots.some((slot) => {
      if (!slot.available) return false;
      const start = new Date(slot.startTime).getTime();
      const end = new Date(slot.endTime).getTime();
      const t = now.getTime();
      return t >= start && t < end;
    });
  };

  /**
   * Handle appointment type selection
   */
  const handleAppointmentTypeChange = (type: "scheduled" | "walk-in") => {
    setAppointmentType(type);
    if (type === "walk-in") {
      setSelectedDate(undefined);
      setSelectedTimeSlot(null);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleSubmit = () => {
    if (appointmentType === "walk-in") {
      // For walk-in, record current time as the booking time
      const now = new Date();
      const walkInTimeSlot = {
        startTime: now.toISOString(),
        // Not used - but include anyways for now
        endTime: new Date(now.getTime() + totalDuration * 60 * 1000).toISOString(),
        available: true,
      };
      updateFormData({
        appointment: {
          type: appointmentType,
          date: format(now, "yyyy-MM-dd"),
          timeSlot: walkInTimeSlot,
        },
      });
      onNextStep();
    } else if (selectedDate && selectedTimeSlot) {
      updateFormData({
        appointment: {
          type: appointmentType,
          date: format(selectedDate!, "yyyy-MM-dd"),
          timeSlot: selectedTimeSlot,
        },
      });
      onNextStep();
    }
  };

  const isDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ninetyThreeDaysFromNow = addDays(today, 93);

    return (
      date < today || date > ninetyThreeDaysFromNow || !availableDates.some((d) => format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))
    );
  };

  const renderTimeSlots = () => {
    if (!selectedDate) {
      return (
        <div className="border rounded-md p-8 text-center">
          <p className="text-gray-500">Please select a date to see available time slots.</p>
        </div>
      );
    }

    if (loadingAvailability) {
      return (
        <div className="border rounded-md p-8 text-center">
          <p className="text-gray-500">Loading available time slots...</p>
        </div>
      );
    }

    if (timeSlots.length === 0) {
      return (
        <div className="border rounded-md p-8 text-center">
          <p className="text-gray-500">No available appointments on this date. Please select another date.</p>
        </div>
      );
    }

    return (
      <div className="border rounded-md p-4 grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
        {timeSlots.map((timeSlot, index) => (
          <Button
            key={index}
            variant={selectedTimeSlot === timeSlot ? "default" : "outline"}
            className={selectedTimeSlot === timeSlot ? "border-2 border-primary" : ""}
            onClick={() => handleTimeSlotSelect(timeSlot)}
          >
            {formatNZTime(timeSlot.startTime)}
          </Button>
        ))}
      </div>
    );
  };

  const renderAppointmentSummary = () => {
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

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-2">Book Appointment</h2>
      <p className="text-gray-500 text-center mb-6">
        Choose how you'd like to book your appointment
        {selectedServices.length > 1 && ` (${totalDuration} minutes total)`}
      </p>

      {/* Appointment Type Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Choose appointment type</h3>
        <RadioGroup value={appointmentType} onValueChange={handleAppointmentTypeChange} className="space-y-4">
          <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="scheduled" id="scheduled" />
            <Label htmlFor="scheduled" className="flex-1 cursor-pointer">
              <div className="font-medium">Select date and time</div>
              <div className="text-sm text-muted-foreground">Schedule your appointment for a guaranteed time slot</div>
            </Label>
          </div>
          {[1, 2, 4].includes(Number(pharmacy.id)) && (
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="walk-in" id="walk-in" />
              <Label htmlFor="walk-in" className="flex-1 cursor-pointer">
                <div className="font-medium">Walk-in (Select only if you are at the Pharmacy)</div>
                <div className="text-sm text-muted-foreground">Come in during business hours - no appointment needed</div>
              </Label>
            </div>
          )}
        </RadioGroup>
      </div>

      {appointmentType === "scheduled" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Date Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">1. Select a date</h3>
            <div className="border rounded-md p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                className="pointer-events-auto"
              />
            </div>
            {selectedDate && <div className="mt-2 text-sm text-gray-500">Business hours: {getBusinessHoursForDate(selectedDate)}</div>}
          </div>

          {/* Time Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">2. Select a time</h3>
            {renderTimeSlots()}
          </div>
        </div>
      ) : (
        <div className="mb-8 p-6 border rounded-lg bg-accent/20">
          <h3 className="text-lg font-semibold mb-3">Walk-in Information</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Business Hours:</span> {getBusinessHours()}
            </p>
            <p>
              <span className="font-medium">Expected Duration:</span> {totalDuration} minutes
            </p>
            <p>
              <span className="font-medium">Current Status:</span>
              <span className={isPharmacyOpen() ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {isPharmacyOpen() ? " Open now" : " Currently closed"}
              </span>
            </p>
            {getWalkInValidationMessage() && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-xs">
                {getWalkInValidationMessage()}
              </div>
            )}
            <p className="text-muted-foreground">
              No appointment necessary. Please arrive during business hours and our team will assist you as soon as possible.
            </p>
          </div>
        </div>
      )}

      {/* Appointment Summary and Navigation */}
      <div className="mt-8">
        {renderAppointmentSummary()}

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onPrevStep}>
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              (appointmentType === "scheduled" && (!selectedDate || !selectedTimeSlot)) ||
              (appointmentType === "walk-in" && !!getWalkInValidationMessage())
            }
          >
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;
