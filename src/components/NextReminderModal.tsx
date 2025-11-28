import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NextReminderModalProps {
  patientName: string;
  vaccineType: string;
  open: boolean;
  onConfirm: (dueDate: string) => void;
  onSkip: () => void;
}

const NextReminderModal = ({ patientName, vaccineType, open, onConfirm, onSkip }: NextReminderModalProps) => {
  const [nextDueDate, setNextDueDate] = useState("");

  const handleConfirm = () => {
    if (nextDueDate) {
      onConfirm(nextDueDate);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onSkip}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Next Appointment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              <strong>{patientName}</strong> has completed their <strong>{vaccineType}</strong> appointment. Would you like to schedule
              their next reminder?
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextDueDate">Next Due Date</Label>
            <Input
              id="nextDueDate"
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onSkip}>
              Skip
            </Button>
            <Button onClick={handleConfirm} disabled={!nextDueDate}>
              Schedule Reminder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NextReminderModal;
