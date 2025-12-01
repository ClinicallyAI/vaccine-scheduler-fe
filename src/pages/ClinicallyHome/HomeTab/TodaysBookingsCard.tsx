import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle } from "lucide-react";
import { ServiceRecord, BookingStatus } from "@/types/serviceRecords";
import { formatPhoneForDisplay } from "@/utils/phoneNumberClean";
import { nzTimeRange } from "../utils/dateHelpers";

interface TodaysBookingsCardProps {
  bookings: ServiceRecord[];
  pendingCount: number;
  pendingStatus: Record<string, BookingStatus>;
  rowUpdating: Record<string, boolean>;
  onStatusChange: (id: string, status: BookingStatus) => void;
  onRowMouseEnter: (id: string, event: React.MouseEvent) => void;
  onRowMouseMove: (event: React.MouseEvent) => void;
  onRowMouseLeave: () => void;
  onClearTooltip: () => void;
}

const TodaysBookingsCard: React.FC<TodaysBookingsCardProps> = ({
  bookings,
  pendingCount,
  pendingStatus,
  rowUpdating,
  onStatusChange,
  onRowMouseEnter,
  onRowMouseMove,
  onRowMouseLeave,
  onClearTooltip,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Appointments Today
          </CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold">{bookings.length}</div>
            <div className="text-sm text-muted-foreground">
              {bookings.length - pendingCount}/{bookings.length} completed
            </div>
          </div>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <Badge variant="secondary">{pendingCount} pending</Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
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
                {bookings.map((r) => (
                  <tr
                    key={r.id}
                    onMouseEnter={(e) => onRowMouseEnter(r.id, e)}
                    onMouseMove={onRowMouseMove}
                    onMouseLeave={onRowMouseLeave}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {r.status === "Booked" && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{nzTimeRange(r.bookedDate, 15)}</span>
                      </div>
                    </td>
                    <td className="p-3 font-medium">{r.patientName}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-muted rounded-md text-sm font-medium">{r.vaccineType}</span>
                    </td>
                    <td className="p-3 text-muted-foreground">{formatPhoneForDisplay(r.contactNumber)}</td>
                    <td className="p-3">
                      <select
                        value={pendingStatus[r.id] ?? "Booked"}
                        onChange={(e) => onStatusChange(r.id, e.target.value as BookingStatus)}
                        onFocus={onClearTooltip}
                        onClick={onClearTooltip}
                        disabled={!!rowUpdating[r.id]}
                        className="w-40"
                      >
                        <option value="Completed">Completed</option>
                        <option value="Booked">Booked</option>
                        <option value="Did not Attend">Did not Attend</option>
                        <option value="Walk-in">Walk in</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td className="p-4 text-gray-500" colSpan={6}>
                      No bookings for today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TodaysBookingsCard;
