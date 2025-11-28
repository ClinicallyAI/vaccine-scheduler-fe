import React, { useState } from "react";
import { BookingFormData, Pharmacy, Service } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { formatNZDate, formatNZTime } from "@/utils/time";
import { normalizePhone } from "@/utils/phoneNumberClean";
import api from "@/services/axios";

interface ConfirmationStepProps {
  formData: BookingFormData;
  pharmacy: Pharmacy;
  allServices: Service[];
  onConfirm: () => void;
  onBack: () => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ formData, pharmacy, allServices, onConfirm, onBack }) => {
  const [submitting, setSubmitting] = useState(false);
  const selectedServices = allServices.filter((s) => formData.services.includes(String(s.id)));
  const totalDuration = selectedServices[0].duration_minutes;

  const formatAppointmentTime = (): string => {
    const slot = formData.appointment.timeSlot;
    if (!slot) return "";
    return `${formatNZTime(slot.startTime)} - ${formatNZTime(slot.endTime)}`;
  };

  const formatAppointmentDate = (): string => {
    const date = formData.appointment.date;
    if (!date) return "";
    return formatNZDate(date);
  };

  const handleConfirmBooking = async () => {
    if (!formData.appointment.timeSlot.startTime || selectedServices.length === 0) return;

    const selectedService = selectedServices[0]; // Assuming only one for now
    const payload = {
      tenant_id: pharmacy.id,
      patient_name: formData.personalInfo.fullName,
      patient_phone: normalizePhone(formData.personalInfo.phone),
      dob: formData.personalInfo.dateOfBirth,
      nhi_number: formData.personalInfo.nhiNumber,
      email: formData.personalInfo.email,
      is_medical: selectedService.is_medical ?? true,
      service_id: selectedService.id,
      slot_start: formData.appointment.timeSlot?.startTime,
      service_name: selectedService.name,
      pharmacy_name: pharmacy.name,
      pharmacy_address: pharmacy.address,
      booker_name: formData.personalInfo.bookerInfo?.name,
      booker_phone: formData.personalInfo.bookerInfo ? normalizePhone(formData.personalInfo.bookerInfo.phone) : null,
    };

    try {
      setSubmitting(true);
      const endpoint =
        formData.appointment.type === "scheduled"
          ? "/book-appointment"
          : "/book-walk-in";
      const res = await api.post(endpoint, payload);

      const data = res.data;
      if (res.status !== 200) {
        console.error("Booking failed:", data.error);
        alert("Failed to confirm booking. Please try again.");
        return;
      }

      onConfirm(); // Proceed to confirmation screen
    } catch (err) {
      console.error("Error confirming booking:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isWalkIn = () => {
    return formData.appointment.type === "walk-in";
  };

  if (!formData.appointment.timeSlot.startTime || !selectedServices.length) {
    return <div className="text-center text-red-600">Booking details are incomplete. Please go back and review your selections.</div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Review Booking</h2>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={onBack} variant="outline" className="flex-1">
          <Edit2 className="h-4 w-4 mr-2" />
          Back to Edit
        </Button>
        <Button onClick={handleConfirmBooking} className="flex-1" size="lg" disabled={submitting}>
          {submitting ? "Booking..." : "Confirm Booking"}
        </Button>
      </div>

      {/* Appointment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appointment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {selectedServices.map((service, index) => (
              <div key={service.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <span className="font-medium">{service.name}</span>
                  {formData.recommendationAccepted && index === 1 && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Recommended</span>
                  )}
                </div>
                <span className="text-gray-600">{service.duration_minutes} min</span>
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-600 mt-2">Total: {totalDuration} minutes</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="font-medium mb-1">Date</h4>
              <p className="text-gray-600">{formatAppointmentDate()}</p>
            </div>
            {!isWalkIn() && (
              <div>
                <h4 className="font-medium mb-1">Time</h4>
                <p className="text-gray-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatAppointmentTime()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Your Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Name</h4>
              <p className="text-gray-600">{formData.personalInfo.fullName}</p>
            </div>
            <div>
              <h4 className="font-medium">Date of Birth</h4>
              <p className="text-gray-600">
                {formData.personalInfo.dateOfBirth ? format(new Date(formData.personalInfo.dateOfBirth), "MMMM d, yyyy") : "Not provided"}
              </p>
            </div>
            <div>
              <h4 className="font-medium">Phone</h4>
              <p className="text-gray-600">{formData.personalInfo.phone}</p>
            </div>
            <div>
              <h4 className="font-medium">Email</h4>
              <p className="text-gray-600">{formData.personalInfo.email}</p>
            </div>
            {formData.personalInfo.nhiNumber && (
              <div>
                <h4 className="font-medium">NHI Number</h4>
                <p className="text-gray-600">{formData.personalInfo.nhiNumber}</p>
              </div>
            )}
            {formData.personalInfo.gpContact && (
              <div>
                <h4 className="font-medium">GP Contact</h4>
                <p className="text-gray-600">{formData.personalInfo.gpContact}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <h4 className="font-medium">{pharmacy.name}</h4>
            <p className="text-gray-600">{pharmacy.address}</p>
            <p className="text-gray-600 mt-1">{pharmacy.phone_number}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmationStep;
