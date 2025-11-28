import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import TimeInput from "./TimeInput";
import { OpeningHours, DaySchedule, DEFAULT_OPENING_HOURS } from "@/types/pharmacy";
import { toast } from "sonner";
import api from "@/services/axios";
import { TENANT } from "@/services/auth";

export default function OpeningHoursConfig() {
  const [hours, setHours] = useState<OpeningHours>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const daysOfWeek = [
    {
      key: "1",
      label: "Monday",
    },
    {
      key: "2",
      label: "Tuesday",
    },
    {
      key: "3",
      label: "Wednesday",
    },
    {
      key: "4",
      label: "Thursday",
    },
    {
      key: "5",
      label: "Friday",
    },
    {
      key: "6",
      label: "Saturday",
    },
    {
      key: "7",
      label: "Sunday",
    },
  ] as const;

  // ---------- Effects ----------
  useEffect(() => {
    (async () => {
      await loadOpeningHours();
    })();
  }, []);

  // ---------- API Layer ----------
  async function loadOpeningHours(): Promise<void> {
    try {
      const { data } = await api.get(`/tenants/${TENANT}/opening-hours`);
      setHours(data.data);
    } catch (err) {
      console.error("Failed to load hours:", err);
    } finally {
      setLoading(false);
    }
  }

  const updateDaySchedule = (day: keyof OpeningHours, updates: Partial<DaySchedule>) => {
    const newHours = {
      ...hours,
      [day]: {
        ...hours[day],
        ...updates,
      },
    };

    // Validate time range
    if (updates.startTime || updates.endTime) {
      const daySchedule = newHours[day];
      if (daySchedule.isOpen && daySchedule.startTime >= daySchedule.endTime) {
        toast.error("End time must be after start time");
        return;
      }
    }
    setHours(newHours);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await api.post(`/tenants/${TENANT}/opening-hours`, hours);
    } catch (err) {
      console.error("Failed to update hours:", err);
    } finally {
      toast.success("Opening hours saved successfully!");
      setLoading(false);
    }
    setHasChanges(false);
  };

  const handleReset = () => {
    setHours(DEFAULT_OPENING_HOURS);
    setHasChanges(false);
    toast.success("Opening hours reset to defaults");
  };

  return (
    <div className="space-y-6">
      {/* Loading */}
      {loading && <div>Loading…</div>}

      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle>Opening Hours </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {daysOfWeek.map(({ key, label }) => {
              const daySchedule = hours[key];
              return (
                <div key={key} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-24">
                      <Label className="font-medium">{label}</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={daySchedule.isOpen}
                        onCheckedChange={(checked) =>
                          updateDaySchedule(key, {
                            isOpen: checked,
                          })
                        }
                      />
                      <Label className="text-sm text-muted-foreground">{daySchedule.isOpen ? "Open" : "Closed"}</Label>
                    </div>
                  </div>

                  {daySchedule.isOpen && (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm">From:</Label>
                        <TimeInput
                          value={daySchedule.startTime}
                          onChange={(time) =>
                            updateDaySchedule(key, {
                              startTime: time,
                            })
                          }
                          className="w-32"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm">To:</Label>
                        <TimeInput
                          value={daySchedule.endTime}
                          onChange={(time) =>
                            updateDaySchedule(key, {
                              endTime: time,
                            })
                          }
                          className="w-32"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
          Reset to Defaults
        </Button>

        <Button onClick={handleSave} disabled={!hasChanges} className="bg-primary hover:bg-primary/90">
          Save
        </Button>
      </div>
    </div>
  );
}
