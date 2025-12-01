import React from "react";
import { ServiceRecord, BookingStatus } from "@/types/serviceRecords";
import { nzDateDisplay } from "../utils/dateHelpers";
import TodaysBookingsCard from "./TodaysBookingsCard";
import TodaysWalkInsCard from "./TodaysWalkInsCard";

interface HomeTabProps {
  todaysBookings: ServiceRecord[];
  todaysWalkIns: ServiceRecord[];
  pendingBookingCount: number;
  pendingWalkInCount: number;
  pendingStatus: Record<string, BookingStatus>;
  rowUpdating: Record<string, boolean>;
  onStatusChange: (id: string, status: BookingStatus) => void;
  onRowMouseEnter: (id: string, event: React.MouseEvent) => void;
  onRowMouseMove: (event: React.MouseEvent) => void;
  onRowMouseLeave: () => void;
  onClearTooltip: () => void;
}

const HomeTab: React.FC<HomeTabProps> = ({
  todaysBookings,
  todaysWalkIns,
  pendingBookingCount,
  pendingWalkInCount,
  pendingStatus,
  rowUpdating,
  onStatusChange,
  onRowMouseEnter,
  onRowMouseMove,
  onRowMouseLeave,
  onClearTooltip,
}) => {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Today's Schedule</h1>
        <p className="text-muted-foreground">{nzDateDisplay(new Date().toISOString(), "long")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TodaysBookingsCard
          bookings={todaysBookings}
          pendingCount={pendingBookingCount}
          pendingStatus={pendingStatus}
          rowUpdating={rowUpdating}
          onStatusChange={onStatusChange}
          onRowMouseEnter={onRowMouseEnter}
          onRowMouseMove={onRowMouseMove}
          onRowMouseLeave={onRowMouseLeave}
          onClearTooltip={onClearTooltip}
        />
        <TodaysWalkInsCard
          walkIns={todaysWalkIns}
          pendingCount={pendingWalkInCount}
          pendingStatus={pendingStatus}
          rowUpdating={rowUpdating}
          onStatusChange={onStatusChange}
          onRowMouseEnter={onRowMouseEnter}
          onRowMouseMove={onRowMouseMove}
          onRowMouseLeave={onRowMouseLeave}
          onClearTooltip={onClearTooltip}
        />
      </div>
    </div>
  );
};

export default HomeTab;
