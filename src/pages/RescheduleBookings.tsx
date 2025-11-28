import React, { useState, useEffect, useRef } from "react";
import { useParams, Navigate, useLocation } from "react-router-dom";
import { TimeSlot, Pharmacy, Service, Recommendation } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";

import { Calendar } from "@/components/ui/calendar";

import { format, addDays } from "date-fns";
import { flagLunchAsUnavailable } from "@/utils/availabilityOverride";

import { Button } from "@/components/ui/button";
import { formatNZTime } from "@/utils/time";
import api from "@/services/axios";

interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

interface DailyAvailability {
  date: string;
  timeSlots: AvailabilitySlot[];
}

const RescheduleBookings = () => {
  const [loading, setLoading] = useState(false);

  const { token } = useParams<{ token: string }>();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>();
  const [prevSlot, setPrevSlot] = useState<Date | undefined>(undefined);

  const [availability, setAvailability] = useState<DailyAvailability[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState<boolean>(true);

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await api.get(`/bookings/availability/${token}`);
        const data = res.data;
        setAvailability(flagLunchAsUnavailable(data.data?.availability, 4, data.data?.serviceId) || []);

        setPrevSlot(data.data?.prevSlot);
      } catch (err) {
        console.error("Failed to load availability:", err);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [token]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const payload = {
        token,
        appointment: {
          slot_start: selectedTimeSlot.startTime,
        },
      };
      await api.post("/reschedule-appointment", payload);
      alert("Your appointment has been rescheduled, you should receive an email shortly with the new appointment time.");
      setSubmitted(true);
    } catch (error: any) {
      alert("Error rescheduling appointment: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const availableDates = availability.map((a) => new Date(a.date));

  const isDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = addDays(today, 30);

    return date < today || date > thirtyDaysFromNow || !availableDates.some((d) => format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"));
  };

  const getTimeSlotsForDate = (date: Date | undefined): TimeSlot[] => {
    if (!date) return [];
    const dateStr = format(date, "yyyy-MM-dd");
    const dayAvailability = availability.find((a) => a.date === dateStr);
    return (dayAvailability?.timeSlots || []).filter((slot) => slot.available);
  };

  const timeSlots = getTimeSlotsForDate(selectedDate);

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

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  const renderAppointmentSummary = () => {
    if (!selectedDate || !selectedTimeSlot) return null;

    return (
      <div className="bg-primary/10 p-4 rounded-md mb-6">
        <p>
          <span className="font-semibold">Previous Appointment Time</span>
        </p>
        <p>
          {format(prevSlot, "EEEE, MMMM d, yyyy")} {formatNZTime(prevSlot)}
        </p>
        <br></br>
        <h3 className="font-medium text-primary mb-2">New Appointment Time</h3>
        <p>
          <span className="font-semibold">Date:</span> {format(selectedDate, "EEEE, MMMM d, yyyy")}
        </p>
        <p>
          <span className="font-semibold">Time:</span> {formatNZTime(selectedTimeSlot.startTime)} - {formatNZTime(selectedTimeSlot.endTime)}
        </p>

        <p>
          <span className="font-semibold">Duration:</span> {15} minutes
        </p>
      </div>
    );
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {loading && <Spinner />}
      {submitted && <h2 className="text-2xl font-bold text-center mb-2">Thank you! Please close the page</h2>}

      {!submitted && (
        <>
          <h2 className="text-2xl font-bold text-center mb-2">Reschedule Appointment</h2>
          <p className="text-gray-500 text-center mb-6">Select a date and time to reschedule your appointment</p>

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

          {/* Appointment Summary and Navigation */}
          <div className="mt-8">
            {renderAppointmentSummary()}

            <div className="flex justify-between pt-4">
              <Button onClick={handleSubmit} disabled={!selectedDate || !selectedTimeSlot}>
                Confirm Booking
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RescheduleBookings;
