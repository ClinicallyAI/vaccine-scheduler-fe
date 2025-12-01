import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceRecord, RecordStatus } from "@/types/serviceRecords";
import RemindersTable from "./RemindersTable";

interface RemindersTabProps {
  records: ServiceRecord[];
  statusFilter: RecordStatus | "All";
  onStatusFilterChange: (status: RecordStatus | "All") => void;
  onAddNew: () => void;
  onEdit: (record: ServiceRecord) => void;
  onRowMouseEnter: (id: string, event: React.MouseEvent) => void;
  onRowMouseMove: (event: React.MouseEvent) => void;
  onRowMouseLeave: () => void;
}

const RemindersTab: React.FC<RemindersTabProps> = ({
  records,
  statusFilter,
  onStatusFilterChange,
  onAddNew,
  onEdit,
  onRowMouseEnter,
  onRowMouseMove,
  onRowMouseLeave,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reminder records</CardTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value as RecordStatus | "All")}>
              <option value="All">All</option>
              <option value="Reminder Scheduled">Reminder Scheduled</option>
              <option value="Walk-in">Walk in</option>
              <option value="Sent">Sent</option>
              <option value="Overdue">Overdue</option>
              <option value="Booked">Booked</option>
              <option value="Completed">Completed</option>
              <option value="Did not Attend">Did not Attend</option>
            </select>
          </div>
          <Button onClick={onAddNew}>Add new patient</Button>
        </div>
      </CardHeader>
      <CardContent>
        <RemindersTable
          records={records}
          onEdit={onEdit}
          onRowMouseEnter={onRowMouseEnter}
          onRowMouseMove={onRowMouseMove}
          onRowMouseLeave={onRowMouseLeave}
        />
      </CardContent>
    </Card>
  );
};

export default RemindersTab;
