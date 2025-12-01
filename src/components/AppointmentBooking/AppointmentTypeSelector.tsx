import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface AppointmentTypeSelectorProps {
  appointmentType: "scheduled" | "walk-in";
  onTypeChange: (type: "scheduled" | "walk-in") => void;
  pharmacyId: number;
}

const AppointmentTypeSelector: React.FC<AppointmentTypeSelectorProps> = ({
  appointmentType,
  onTypeChange,
  pharmacyId,
}) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Choose appointment type</h3>
      <RadioGroup value={appointmentType} onValueChange={onTypeChange} className="space-y-4">
        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
          <RadioGroupItem value="scheduled" id="scheduled" />
          <Label htmlFor="scheduled" className="flex-1 cursor-pointer">
            <div className="font-medium">Select date and time</div>
            <div className="text-sm text-muted-foreground">Schedule your appointment for a guaranteed time slot</div>
          </Label>
        </div>
        {[1, 2, 4].includes(Number(pharmacyId)) && (
          <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="walk-in" id="walk-in" />
            <Label htmlFor="walk-in" className="flex-1 cursor-pointer">
              <div className="font-medium">Walk-in (Select only if you are at the Pharmacy)</div>
              <div className="text-sm text-muted-foreground">Come in during business hours - no appointment needed</div>
            </Label>
          </div>
        )}
      </RadioGroup>
    </div>
  );
};

export default AppointmentTypeSelector;
