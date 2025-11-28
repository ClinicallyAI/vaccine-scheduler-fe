import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ServiceRecord } from "@/types/serviceRecords";
import { useAgeCalculation } from "@/hooks/useAgeCalculation";

type RecordStatus = "Reminder Scheduled" | "Sent" | "Overdue" | "Booked" | "Completed" | "Did not Attend" | "Walk-in";

type ServiceInfo = { id: number; name: string; isMedical?: boolean };

interface EditPatientModalProps {
  open: boolean;
  record: ServiceRecord;
  services: ServiceInfo[];
  onClose: () => void;
  onUpdate: (updated: Partial<ServiceRecord> & { id: string }) => void;
}

const STATUS_OPTIONS: RecordStatus[] = ["Reminder Scheduled", "Sent", "Overdue", "Booked", "Completed", "Did not Attend", "Walk-in"];

const toInput = (value?: string | Date | null) => {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value.slice(0, 10);
};
const fromInput = (v: string) => (v?.trim() ? v : "");

type FormState = {
  patientName: string;
  nhiNumber: string;
  contactNumber: string;
  vaccineType: string;
  dueDate: string;
  status: RecordStatus;
  bookedDate: string;
};

const EditPatientModal = ({ open, record, services, onClose, onUpdate }: EditPatientModalProps) => {
  const [formData, setFormData] = useState<FormState>({
    patientName: record.patientName,
    nhiNumber: record.nhiNumber ?? "",
    contactNumber: record.contactNumber ?? "",
    vaccineType: record.vaccineType,
    dueDate: toInput(record.dueDate),
    status: record.status as RecordStatus,
    bookedDate: toInput(record.bookedDate),
  });
  console.log(record);
  console.log(typeof record.dob);

  // --- DOB handled as day / month / year ---
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [dobError, setDobError] = useState<string | null>(null);

  // Preload DOB from record.dob (Date | null)
  useEffect(() => {
    if (record.dob) {
      setDay(record.dob.getDate().toString());
      setMonth((record.dob.getMonth() + 1).toString()); // 0-based month
      setYear(record.dob.getFullYear().toString());
    } else {
      setDay("");
      setMonth("");
      setYear("");
    }
  }, [record.dob]);

  const { displayAge } = useAgeCalculation(day, month, year);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!day || !month || !year) {
      setDobError("Date of birth is required");
      return;
    }

    setDobError(null);

    const dob: Date | null =
      day && month && year ? new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10))) : null;

    onUpdate({
      id: record.id,
      patientName: formData.patientName,
      nhiNumber: formData.nhiNumber,
      contactNumber: formData.contactNumber,
      vaccineType: formData.vaccineType,
      dueDate: fromInput(formData.dueDate) || null,
      bookedDate: fromInput(formData.bookedDate) || null,
      status: formData.status,
      dob, // 👈 correct Date | null for ServiceRecord
      // serviceDate intentionally untouched
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Patient Info</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="nhiNumber">NHI Number</Label>
              <Input id="nhiNumber" value={formData.nhiNumber} onChange={(e) => setFormData({ ...formData, nhiNumber: e.target.value })} />
            </div>

            <div>
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label>Service Type</Label>
              <Select value={formData.vaccineType} onValueChange={(value) => setFormData({ ...formData, vaccineType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>

            {/* DOB with Day / Month / Year selects */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Date of Birth</Label>
              <div className="grid grid-cols-[1fr_2fr_1fr] gap-2">
                {/* Day */}
                <Select
                  value={day}
                  onValueChange={(value) => {
                    setDay(value);
                    setDobError(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <SelectItem key={d} value={d.toString()}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Month */}
                <Select
                  value={month}
                  onValueChange={(value) => {
                    setMonth(value);
                    setDobError(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((m, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Year */}
                <Select
                  value={year}
                  onValueChange={(value) => {
                    setYear(value);
                    setDobError(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {dobError && <p className="text-sm text-red-600">{dobError}</p>}
              {displayAge && <p className="text-sm text-gray-600">Age: {displayAge}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Reminder Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as RecordStatus })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bookedDate">Booked Date</Label>
              <Input
                id="bookedDate"
                type="date"
                value={formData.bookedDate}
                onChange={(e) => setFormData({ ...formData, bookedDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-700 hover:bg-green-800 text-white">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPatientModal;
