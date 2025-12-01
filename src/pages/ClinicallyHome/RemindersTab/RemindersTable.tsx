import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import { ServiceRecord } from "@/types/serviceRecords";
import { formatPhoneForDisplay } from "@/utils/phoneNumberClean";
import { nzDateDisplay } from "../utils/dateHelpers";

interface RemindersTableProps {
  records: ServiceRecord[];
  onEdit: (record: ServiceRecord) => void;
  onRowMouseEnter: (id: string, event: React.MouseEvent) => void;
  onRowMouseMove: (event: React.MouseEvent) => void;
  onRowMouseLeave: () => void;
}

const RemindersTable: React.FC<RemindersTableProps> = ({
  records,
  onEdit,
  onRowMouseEnter,
  onRowMouseMove,
  onRowMouseLeave,
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Completed: {
        label: "Completed",
        variant: "default" as const,
      },
      Overdue: {
        label: "Overdue",
        variant: "destructive" as const,
      },
      Sent: {
        label: "Sent",
        variant: "secondary" as const,
      },
      Booked: {
        label: "Booked",
        variant: "default" as const,
      },
      "Walk-in": {
        label: "Walk-in",
        variant: "default" as const,
      },
      "Reminder Scheduled": {
        label: "Reminder Scheduled",
        variant: "secondary" as const,
      },
      "Booking Cancelled": {
        label: "Booking Cancelled",
        variant: "outline" as const,
      },
      "Did not Attend": {
        label: "Did not Attend",
        variant: "outline" as const,
      },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">NHI</th>
              <th className="text-left p-2">Contact</th>
              <th className="text-left p-2">Service</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Due</th>
              <th className="text-left p-2">Booked</th>
              <th className="text-left p-2">Completed</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr
                key={r.id}
                onMouseEnter={(e) => onRowMouseEnter(r.id, e)}
                onMouseMove={onRowMouseMove}
                onMouseLeave={onRowMouseLeave}
                className="hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <td className="p-2">{r.patientName}</td>
                <td className="p-2">{r.nhiNumber}</td>
                <td className="p-2">{formatPhoneForDisplay(r.contactNumber)}</td>
                <td className="p-2">{r.vaccineType}</td>
                <td className="p-3">{getStatusBadge(r.status)}</td>
                <td className="p-2">{nzDateDisplay(r.dueDate)}</td>
                <td className="p-2">{nzDateDisplay(r.bookedDate)}</td>
                <td className="p-2">{nzDateDisplay(r.serviceDate)}</td>
                <td className="p-3">
                  <Button variant="outline" size="sm" onClick={() => onEdit(r)} className="flex items-center gap-1">
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td className="p-4 text-gray-500" colSpan={9}>
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RemindersTable;
