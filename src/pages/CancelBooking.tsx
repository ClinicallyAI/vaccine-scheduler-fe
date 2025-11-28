import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";

import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { formatNZTime } from "@/utils/time";
import api from "@/services/axios";

const CancelBooking = () => {
  const [loading, setLoading] = useState(false);

  const { token } = useParams<{ token: string }>();

  const [prevSlot, setPrevSlot] = useState<Date | undefined>(undefined);

  const navigate = useNavigate();

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await fetch(`https://sms-demo-fszn.onrender.com/bookings/availability/${token}`);
        const data = await res.json();
        setPrevSlot(data.data?.prevSlot);
      } catch (err) {
        console.error("Failed to load availability:", err);
      } finally {
      }
    };

    fetchAvailability();
  }, [token]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const payload = {
        token,
      };
      await api.post("https://sms-demo-fszn.onrender.com/cancel-appointment", payload);
      alert("Your appointment has been cancelled, you should receive an email shortly with the cancellation.");
      setSubmitted(true);
    } catch (error: any) {
      alert("Error cancelling appointment: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = () => {
    navigate(`/pharmacy/reschedule/${token}`);
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {loading && <Spinner />}
      {submitted && <h2 className="text-2xl font-bold text-center mb-2">Thank you! Please close the page</h2>}
      {prevSlot && !submitted && (
        <>
          <h2 className="text-2xl font-bold text-center mb-2">Cancel Appointment</h2>
          <div className="text-center">
            <p className="text-gray-500 text-center mb-6">Are you sure you want to cancel your appointment?</p>

            <p>
              <span className="font-semibold ">Current Appointment Time</span>
            </p>
            <p>
              {format(prevSlot, "EEEE, MMMM d, yyyy")} {formatNZTime(prevSlot)}
            </p>

            <div className="mt-8 ">
              <div className="flex justify-between pt-4">
                <Button onClick={handleReschedule}>Reschedule Booking</Button>
                <Button onClick={handleSubmit}>Cancel Booking</Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CancelBooking;
