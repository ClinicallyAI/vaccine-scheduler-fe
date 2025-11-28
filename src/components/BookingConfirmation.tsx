import React from "react";
import { BookingFormData, Pharmacy, Service } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, Clock, MapPin, Phone, User } from "lucide-react";
import { format } from "date-fns";
import { submitProductRecommendationRequest, trackRecommendationClick } from "@/utils/productRecommendation";
import { formatNZDate, formatNZTime } from "@/utils/time";

interface BookingConfirmationProps {
  formData: BookingFormData;
  pharmacy: Pharmacy;
  allServices: Service[];
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ formData, pharmacy, allServices }) => {
  const selectedServices = allServices.filter((s) => formData.services.includes(String(s.id)));

  // Never add - it works out to be the same
  const totalDuration = selectedServices[0].duration_minutes;

  const formatAppointmentTime = () => {
    if (!formData.appointment.timeSlot) return "";
    return `${formatNZTime(formData.appointment.timeSlot.startTime)} – ${formatNZTime(formData.appointment.timeSlot.endTime)}`;
  };

  const formatAppointmentDate = () => {
    if (!formData.appointment.date) return "";
    return formatNZDate(formData.appointment.date);
  };

  const handleProductRecommendationRequest = async (interests: string[], specificRequests?: string) => {
    // Track the click for analytics
    trackRecommendationClick(formData.services[0], pharmacy.name);

    // Submit the recommendation request
    await submitProductRecommendationRequest(formData, pharmacy, interests, specificRequests);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-green-800 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your appointment has been successfully booked. You'll receive a confirmation email shortly.</p>
        </div>
      </div>

      {/* Appointment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Appointment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Services */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{selectedServices.length > 1 ? "Services:" : "Service:"}</h4>
            <div className="space-y-2">
              {selectedServices.map((service, index) => (
                <div key={service.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
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
            <div className="text-sm text-gray-600 mt-2">Total duration: {totalDuration} minutes</div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Date</h4>
              <p className="text-gray-600">{formatAppointmentDate()}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Time</h4>
              <p className="text-gray-600 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatAppointmentTime()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900">Name</h4>
              <p className="text-gray-600">{formData.personalInfo.fullName}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Date of Birth</h4>
              <p className="text-gray-600">
                {formData.personalInfo.dateOfBirth ? format(formData.personalInfo.dateOfBirth, "MMMM d, yyyy") : "Not provided"}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Phone</h4>
              <p className="text-gray-600">{formData.personalInfo.phone}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Email</h4>
              <p className="text-gray-600">{formData.personalInfo.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pharmacy Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Pharmacy Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900">{pharmacy.name}</h4>
            <p className="text-gray-600">{pharmacy.address}</p>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{pharmacy.phone_number}</span>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          {formData.appointment.type === "scheduled" ? (
            <div className="space-y-3 text-sm text-gray-600">
              <p>1. You'll receive a confirmation email with all the details</p>
              <p>2. To reschedule or cancel, you can do this within your confirmation email</p>
              <p>3. For any questions, contact the pharmacy directly</p>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-gray-600">
              <p>1. You'll receive a confirmation email with all the details</p>
              <p>2. For any questions, contact the pharmacy directly</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingConfirmation;
