import React from "react";

interface WalkInInfoProps {
  businessHours: string;
  totalDuration: number;
  isPharmacyOpen: boolean;
  validationMessage: string | null;
}

const WalkInInfo: React.FC<WalkInInfoProps> = ({
  businessHours,
  totalDuration,
  isPharmacyOpen,
  validationMessage,
}) => {
  return (
    <div className="mb-8 p-6 border rounded-lg bg-accent/20">
      <h3 className="text-lg font-semibold mb-3">Walk-in Information</h3>
      <div className="space-y-2 text-sm">
        <p>
          <span className="font-medium">Business Hours:</span> {businessHours}
        </p>
        <p>
          <span className="font-medium">Expected Duration:</span> {totalDuration} minutes
        </p>
        <p>
          <span className="font-medium">Current Status:</span>
          <span className={isPharmacyOpen ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
            {isPharmacyOpen ? " Open now" : " Currently closed"}
          </span>
        </p>
        {validationMessage && (
          <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-xs">
            {validationMessage}
          </div>
        )}
        <p className="text-muted-foreground">
          No appointment necessary. Please arrive during business hours and our team will assist you as soon as possible.
        </p>
      </div>
    </div>
  );
};

export default WalkInInfo;
