import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAgeCalculation } from "@/hooks/useAgeCalculation";

type ServiceInfo = { id: number; name: string; isMedical?: boolean };

interface AddPatientModalProps {
  open: boolean;
  onClose: () => void;
  services: ServiceInfo[];
  onAdd: (patientData: FormData) => void;
}

type FormData = {
  patientName: string;
  nhiNumber: string;
  contactNumber: string;
  vaccineType: string;
  dueDate: string; // yyyy-MM-dd
  dateOfBirth: Date | null;
};

const AddPatientModal = ({ open, onClose, services, onAdd }: AddPatientModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    patientName: "",
    nhiNumber: "",
    contactNumber: "",
    vaccineType: "",
    dueDate: "",
    dateOfBirth: null,
  });

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [dobError, setDobError] = useState<string | null>(null);

  const { ageInYears, displayAge } = useAgeCalculation(day, month, year);

  useEffect(() => {
    setDay(formData.dateOfBirth?.getDate().toString() || "");
    setMonth(formData.dateOfBirth ? (formData.dateOfBirth.getMonth() + 1).toString() : "");
    setYear(formData.dateOfBirth?.getFullYear().toString() || "");
  }, [formData.dateOfBirth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let dateOfBirth: Date | null = null;

    if (!day || !month || !year) {
      setDobError("Date of birth is required");
      return;
    }

    setDobError(null);

    const y = parseInt(year, 10);
    const m = parseInt(month, 10) - 1;
    const d = parseInt(day, 10);

    // 👇 Use UTC so toISOString() has the same calendar day
    dateOfBirth = new Date(Date.UTC(y, m, d));

    onAdd({
      ...formData,
      dateOfBirth,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Reminder</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                placeholder="Enter patient name"
                required
              />
            </div>

            <div>
              <Label htmlFor="nhiNumber">NHI Number</Label>
              <Input
                id="nhiNumber"
                value={formData.nhiNumber}
                onChange={(e) => setFormData({ ...formData, nhiNumber: e.target.value })}
                placeholder="Enter NHI number"
              />
            </div>

            <div>
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                placeholder="e.g., 211234567"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label>Service Type</Label>
              <Select value={formData.vaccineType} onValueChange={(value) => setFormData({ ...formData, vaccineType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
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

            <div className="space-y-3">
              <Label className="text-base font-medium">Date of Birth</Label>
              <div className="grid grid-cols-[1fr_2fr_1fr] gap-2">
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Reminder</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientModal;
