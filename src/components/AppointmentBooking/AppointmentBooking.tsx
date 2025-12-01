import React, { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { BookingFormData, TimeSlot, Pharmacy, Service } from "@/lib/types";
import { flagLunchAsUnavailable } from "@/utils/availabilityOverride";
import { formatNZTime } from "@/utils/time";
import api from "@/services/axios";
import { MULTIPLE_VACCINE_SERVICE_IDS } from "@/constants";
import AppointmentTypeSelector from "./AppointmentTypeSelector";
import DateSelector from "./DateSelector";
import TimeSlotSelector from "./TimeSlotSelector";
import WalkInInfo from "./WalkInInfo";
import AppointmentSummary from "./AppointmentSummary";

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

  const isMultipleVaccines = selectedServices.length > 1 && selectedServices.every((service) =>
    MULTIPLE_VACCINE_SERVICE_IDS.includes(String(service.id) as any)
  );

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


  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-2">Book Appointment</h2>
      <p className="text-gray-500 text-center mb-6">
        Choose how you'd like to book your appointment
        {selectedServices.length > 1 && ` (${totalDuration} minutes total)`}
      </p>

      <AppointmentTypeSelector
        appointmentType={appointmentType}
        onTypeChange={handleAppointmentTypeChange}
        pharmacyId={Number(pharmacy.id)}
      />

      {appointmentType === "scheduled" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <DateSelector
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            isDateDisabled={isDateDisabled}
            getBusinessHours={getBusinessHoursForDate}
          />

          <TimeSlotSelector
            selectedDate={selectedDate}
            selectedTimeSlot={selectedTimeSlot}
            timeSlots={timeSlots}
            loading={loadingAvailability}
            onTimeSlotSelect={handleTimeSlotSelect}
          />
        </div>
      ) : (
        <WalkInInfo
          businessHours={getBusinessHours()}
          totalDuration={totalDuration}
          isPharmacyOpen={isPharmacyOpen()}
          validationMessage={getWalkInValidationMessage()}
        />
      )}

      {/* Appointment Summary and Navigation */}
      <div className="mt-8">
        <AppointmentSummary
          selectedDate={selectedDate}
          selectedTimeSlot={selectedTimeSlot}
          totalDuration={totalDuration}
          selectedServices={selectedServices}
          isMultipleVaccines={isMultipleVaccines}
        />

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
