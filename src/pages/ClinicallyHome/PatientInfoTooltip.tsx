import React from "react";
import { ServiceRecord } from "@/types/serviceRecords";
import { calculateAgeFromDate } from "@/utils/ageCalculation";
import { formatDateForDisplay } from "./utils/dateHelpers";

interface PatientInfoTooltipProps {
  record: ServiceRecord;
  position: { x: number; y: number };
}

const PatientInfoTooltip: React.FC<PatientInfoTooltipProps> = ({ record, position }) => {
  return (
    <div
      style={{
        position: "fixed",
        left: `${position.x + 15}px`,
        top: `${position.y + 15}px`,
        zIndex: 9999,
        pointerEvents: "none",
      }}
      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 min-w-[200px]"
    >
      <div className="space-y-1.5">
        <div>
          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Patient Name</div>
          <div className="text-sm font-semibold">{record.patientName}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Date of Birth</div>
          <div className="text-sm">{formatDateForDisplay(record.dob)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Age</div>
          <div className="text-sm">{record.dob ? calculateAgeFromDate(record.dob).displayAge : "N/A"}</div>
        </div>
      </div>
    </div>
  );
};

export default PatientInfoTooltip;
