import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, UserPlus, Clock, Users, Plus, AlertCircle } from "lucide-react";
import { Booking, PatientRecord } from "@/types/patient";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import NextReminderModal from "./NextReminderModal";
// import AddWalkInModal from "./AddWalkInModal";
interface TodaysScheduleProps {
  bookings: Booking[];
  onBookingUpdate: (updatedBooking: Booking) => void;
  onBookingAdd: (newBooking: Omit<Booking, "id">) => void;
  onReminderUpdate: (updatedReminder: PatientRecord) => void;
  onAddReminder: (reminderData: Omit<PatientRecord, "id" | "status" | "vaccinatedDate" | "reminderSent" | "bookedDate">) => void;
  reminders: PatientRecord[];
}

const TodaysSchedule = ({ bookings, onBookingUpdate, onBookingAdd, onReminderUpdate, onAddReminder, reminders }: TodaysScheduleProps) => {
  const [nextAppointmentBooking, setNextAppointmentBooking] = useState<Booking | null>(null);
  // const [showAddWalkInModal, setShowAddWalkInModal] = useState(false);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      booked: { label: "Booked", variant: "secondary" as const, dotClass: "status-dot-booked" },
      completed: { label: "Completed", variant: "default" as const, dotClass: "status-dot-completed" },
      did_not_attend: { label: "Did Not Attend", variant: "destructive" as const, dotClass: "status-dot-cancelled" },
      walk_in: { label: "Walk-in", variant: "outline" as const, dotClass: "status-dot-walk_in" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "outline" as const,
      dotClass: "status-dot",
    };

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <span className={cn("status-dot", config.dotClass)} />
        {config.label}
      </Badge>
    );
  };
  const handleStatusChange = (booking: Booking, newStatus: "booked" | "completed" | "did_not_attend" | "walk_in") => {
    const updatedBooking = {
      ...booking,
      status: newStatus,
    };
    onBookingUpdate(updatedBooking);

    // Handle reminder updates based on status change
    if (booking.linkedReminderId) {
      const linkedReminder = reminders.find((r) => r.id === booking.linkedReminderId);
      if (linkedReminder) {
        if (newStatus === "completed") {
          // Update reminder to completed with today's date
          const updatedReminder = {
            ...linkedReminder,
            status: "completed" as const,
            vaccinatedDate: new Date().toISOString().split("T")[0],
          };
          onReminderUpdate(updatedReminder);
          // Show next appointment modal
          setNextAppointmentBooking(updatedBooking);
          toast.success("Booking marked as completed!");
        } else if (newStatus === "did_not_attend") {
          // Update reminder to cancelled
          const updatedReminder = {
            ...linkedReminder,
            status: "cancelled" as const,
          };
          onReminderUpdate(updatedReminder);
          toast.success("Booking marked as did not attend - reminder cancelled");
        }
      }
    }
    if (newStatus === "booked") {
      toast.success("Booking status updated");
    } else if (newStatus === "walk_in") {
      toast.success("Status updated to walk-in");
    }
  };
  const handleNextAppointmentConfirm = (dueDate: string) => {
    if (nextAppointmentBooking) {
      const reminderData = {
        name: nextAppointmentBooking.patientName,
        nhi: nextAppointmentBooking.nhi,
        contact: nextAppointmentBooking.phoneNumber,
        vaccineType: nextAppointmentBooking.serviceBooked,
        dueDate,
      };
      onAddReminder(reminderData);
      toast.success("Next appointment reminder scheduled!");
    }
    setNextAppointmentBooking(null);
  };
  const handleNextAppointmentSkip = () => {
    toast.success("Booking completed without scheduling next appointment");
    setNextAppointmentBooking(null);
  };
  const handleAddWalkIn = (walkInData: Omit<Booking, "id">) => {
    onBookingAdd(walkInData);
    toast.success("Walk-in patient registered successfully!");
  };
  const todaysBookings = bookings
    .filter((booking) => booking.appointmentDate === new Date().toISOString().split("T")[0])
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  // Split bookings into scheduled appointments and walk-ins
  const scheduledBookings = todaysBookings.filter((booking) => !booking.isWalkIn);
  const walkInBookings = todaysBookings.filter((booking) => booking.isWalkIn);
  const pendingScheduledCount = scheduledBookings.filter((booking) => booking.status === "booked").length;
  const pendingWalkInCount = walkInBookings.filter((booking) => booking.status === "walk_in").length;
  const renderBookingTable = (bookings: Booking[], isWalkIn: boolean = false) => {
    if (bookings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            {isWalkIn ? <Users className="w-8 h-8 text-muted-foreground" /> : <Clock className="w-8 h-8 text-muted-foreground" />}
          </div>
          <h3 className="font-medium text-lg mb-2">{isWalkIn ? "No walk-in patients yet" : "No appointments today"}</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {isWalkIn ? "Walk-in patients will appear here when added" : "Scheduled appointments will appear here"}
          </p>
          {/* {isWalkIn && (
            <Button onClick={() => setShowAddWalkInModal(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Walk-in
            </Button>
          )} */}
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-left p-3 font-semibold">Time</th>
                <th className="text-left p-3 font-semibold">Patient Name</th>
                <th className="text-left p-3 font-semibold">Service</th>
                <th className="text-left p-3 font-semibold">Phone Number</th>
                <th className="text-left p-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="table-hover-row border-b last:border-b-0">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {(booking.status === "booked" || booking.status === "walk_in") && (
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      )}
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono text-sm font-medium">{booking.timeSlot}</span>
                    </div>
                  </td>
                  <td className="p-3 font-medium">{booking.patientName}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-muted rounded-md text-sm font-medium">{booking.serviceBooked}</span>
                  </td>
                  <td className="p-3 text-muted-foreground">{booking.phoneNumber}</td>
                  <td className="p-3">
                    <Select
                      value={booking.status}
                      onValueChange={(value) => handleStatusChange(booking, value as "booked" | "completed" | "did_not_attend" | "walk_in")}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {!isWalkIn && (
                          <SelectItem value="booked">
                            <span className="flex items-center gap-2">
                              <span className="status-dot status-dot-booked" />
                              Booked
                            </span>
                          </SelectItem>
                        )}
                        {isWalkIn && (
                          <SelectItem value="walk_in">
                            <span className="flex items-center gap-2">
                              <span className="status-dot status-dot-walk_in" />
                              Walk-in
                            </span>
                          </SelectItem>
                        )}
                        <SelectItem value="completed">
                          <span className="flex items-center gap-2">
                            <span className="status-dot status-dot-completed" />
                            Completed
                          </span>
                        </SelectItem>
                        <SelectItem value="did_not_attend">
                          <span className="flex items-center gap-2">
                            <span className="status-dot status-dot-cancelled" />
                            Did Not Attend
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  const totalAppointments = scheduledBookings.length;
  const completedAppointments = scheduledBookings.filter((b) => b.status === "completed").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Today's Schedule</h1>
        <p className="text-muted-foreground">{formatDate(new Date().toISOString())}</p>
      </div>

      {/* Schedule Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="relative">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Appointments Today
              </CardTitle>
              <div className="text-right">
                <div className="text-2xl font-bold">{totalAppointments}</div>
                <div className="text-sm text-muted-foreground">
                  {completedAppointments}/{totalAppointments} completed
                </div>
              </div>
            </div>
            {pendingScheduledCount > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <Badge variant="secondary">{pendingScheduledCount} pending</Badge>
              </div>
            )}
          </CardHeader>
          <CardContent>{renderBookingTable(scheduledBookings, false)}</CardContent>
        </Card>

        <Card className="relative">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Walk-In Patients
              </CardTitle>
              <div className="text-right">
                <div className="text-2xl font-bold">{walkInBookings.length}</div>
                <div className="text-sm text-muted-foreground">today</div>
              </div>
            </div>
            {pendingWalkInCount > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <AlertCircle className="w-4 h-4 text-blue-500" />
                <Badge variant="outline">{pendingWalkInCount} active</Badge>
              </div>
            )}
          </CardHeader>
          <CardContent>{renderBookingTable(walkInBookings, true)}</CardContent>
        </Card>
      </div>

      {/* Floating Action Button for Walk-ins */}
      {/* <Button onClick={() => setShowAddWalkInModal(true)} className="floating-action-btn w-14 h-14" size="icon" title="Add Walk-in Patient">
        <Plus className="w-6 h-6" />
      </Button> */}

      {/* Modals */}
      {nextAppointmentBooking && (
        <NextReminderModal
          patientName={nextAppointmentBooking.patientName}
          vaccineType={nextAppointmentBooking.serviceBooked}
          onConfirm={handleNextAppointmentConfirm}
          onSkip={handleNextAppointmentSkip}
        />
      )}

      {showAddWalkInModal && <AddWalkInModal onClose={() => setShowAddWalkInModal(false)} onAdd={handleAddWalkIn} />}
    </div>
  );
};
export default TodaysSchedule;
