import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash2, User, Clock, Stethoscope } from "lucide-react";
import { Staff, OpeningHours, DEFAULT_OPENING_HOURS } from "@/types/pharmacy";
import TimeInput from "./TimeInput";
import { toast } from "sonner";
import { TENANT } from "@/services/auth";
import api from "@/services/axios";
import { useServices } from "@/hooks/useServices";

export default function StaffManagement() {
  // Use the shared services hook for fetching and combining data (auto-fetch on mount)
  const { services, loading: servicesLoading, fetchServices, clearCache, getStaffServices: getStaffServicesFromHook } = useServices(true);

  const [staff, setStaff] = useState<Staff[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    isActive: true,
    schedule: DEFAULT_OPENING_HOURS,
    serviceAssignments: [] as string[],
  });
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

  const daysOfWeekMap = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
    7: "Sunday",
  };

  // Fetch staff on mount (services are auto-fetched by the hook)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchStaff();
      } catch (err) {
        toast.error("Failed to load staff");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  function normalizeStaffRow(r: any): Staff {
    // ensure schedule keys are strings "1".."7"
    const scheduleObj = r.schedule || {};
    const schedule: OpeningHours = Object.fromEntries(Object.entries(scheduleObj).map(([k, v]: any) => [String(k), v])) as OpeningHours;

    // Handle multiple possible field names for service assignments (snake_case and camelCase)
    const serviceAssignments = r.serviceAssignments ?? r.service_assignments ?? r.service_ids ?? [];

    return {
      id: String(r.id),
      name: r.name,
      email: r.email ?? "",
      phone: r.phone ?? "",
      isActive: r.isActive, // handle either shape
      schedule,
      // Read service assignments from the response, but still compute from services as source of truth
      serviceAssignments: Array.isArray(serviceAssignments) ? serviceAssignments.map(String) : [],
    };
  }

  async function fetchStaff(): Promise<void> {
    setLoading(true);
    try {
      const { data } = await api.get(`/tenants/${TENANT}/staff`);
      const rows = data?.data?.rows ?? [];
      setStaff(rows.map(normalizeStaffRow));
    } catch (err) {
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  }

  async function submitStaff(payload: {
    id?: number;
    name: string;
    email: string;
    phone?: string;
    isActive: boolean;
    schedule: OpeningHours;
    serviceAssignments?: string[]; // Service IDs to assign (general services only)
  }) {
    setLoading(true);
    try {
      const body = {
        ...payload,
        tenant_id: TENANT, // backend expects snake_case
        // Convert service IDs to numbers if provided
        serviceAssignments: payload.serviceAssignments?.map(Number),
      };
      const { data } = await api.post(`/tenants/${TENANT}/staff`, body);
      return data?.data ?? data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Helper: Get services assigned to a staff member
  // Computes from services array (service.staff_ids is source of truth)
  function getStaffServices(staffId: string): string[] {
    return services.filter((s) => (s.staff_ids ?? []).includes(staffId)).map((s) => s.id);
  }

  async function deactivateStaff(staffId: string) {
    return submitStaff({
      id: Number(staffId),
      name: "",
      email: "",
      phone: "",
      isActive: false,
      schedule: DEFAULT_OPENING_HOURS,
    });
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      isActive: true,
      schedule: DEFAULT_OPENING_HOURS,
      serviceAssignments: [],
    });
  };

  const handleAddStaff = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      // Send ALL service assignments to staff endpoint
      // Backend will handle routing to appropriate tables (general services vs vaccines)
      await submitStaff({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        isActive: formData.isActive,
        schedule: formData.schedule,
        serviceAssignments: formData.serviceAssignments, // ALL services (general + vaccines)
      });

      await fetchStaff();
      clearCache();
      await fetchServices(); // Refresh services to get updated staff_ids
      setShowAddModal(false);
      resetForm();
      toast.success("Staff member added successfully!");
    } catch {
      toast.error("Failed to add staff");
    }
  };

  const handleEditStaff = (staffMember: Staff) => {
    // Get current service assignments from services array
    const assignedServiceIds = getStaffServices(staffMember.id);

    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      isActive: staffMember.isActive,
      schedule: staffMember.schedule,
      serviceAssignments: assignedServiceIds,
    });
    setEditingStaff(staffMember);
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff) return;
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      // Send ALL service assignments to staff endpoint
      // Backend will handle routing to appropriate tables (general services vs vaccines)
      await submitStaff({
        id: Number(editingStaff.id),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        isActive: formData.isActive,
        schedule: formData.schedule,
        serviceAssignments: formData.serviceAssignments, // ALL services (general + vaccines)
      });

      await fetchStaff();
      clearCache();
      await fetchServices(); // Refresh services to get updated staff_ids
      setEditingStaff(null);
      resetForm();
      toast.success("Staff member updated successfully!");
    } catch {
      toast.error("Failed to update staff");
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm("Are you sure you want to remove this staff member?")) return;
    try {
      await deactivateStaff(staffId);
      await fetchStaff();
      toast.success("Staff member deactivated");
    } catch {
      toast.error("Failed to remove staff");
    }
  };

  const updateStaffSchedule = (day: keyof OpeningHours, updates: any) => {
    const newSchedule = {
      ...formData.schedule,
      [day]: {
        ...formData.schedule[day],
        ...updates,
      },
    };

    // Validate time range
    if (updates.startTime || updates.endTime) {
      const daySchedule = newSchedule[day];
      if (daySchedule.isOpen && daySchedule.startTime >= daySchedule.endTime) {
        toast.error("End time must be after start time");
        return;
      }
    }
    setFormData({
      ...formData,
      schedule: newSchedule,
    });
  };

  const handleSaveAll = () => {
    // TODO: Save to backend/localStorage
    toast.success("Staff configuration saved successfully!");
    setHasChanges(false);
  };

  const getActiveStaffCount = () => staff.filter((s) => s.isActive).length;

  const formatScheduleSummary = (schedule: OpeningHours) => {
    const workingDays = Object.entries(schedule)
      .filter(([_, daySchedule]) => daySchedule.isOpen)
      .map(([day]) => daysOfWeekMap[day].slice(0, 3));
    return workingDays.length > 0 ? workingDays.join(", ") : "No working days";
  };

  const getServicesByCategory = (medicalFilter: boolean) => {
    return services.filter((service) => service.is_medical === medicalFilter && service.is_active);
  };

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        serviceAssignments: [...formData.serviceAssignments, serviceId],
      });
    } else {
      setFormData({
        ...formData,
        serviceAssignments: formData.serviceAssignments.filter((id) => id !== serviceId),
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Staff</CardTitle>
              <p className="text-sm text-muted-foreground">
                {staff.length} total staff • {getActiveStaffCount()} active
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Staff Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No staff members added yet</p>
              <p className="text-sm">Add your first staff member to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {staff.map((staffMember) => {
                const staffServices = getStaffServices(staffMember.id);

                return (
                <div key={staffMember.id} className="border rounded-lg p-4 bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{staffMember.name}</h3>
                          <Badge variant={staffMember.isActive ? "default" : "secondary"}>
                            {staffMember.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{formatScheduleSummary(staffMember.schedule)}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Stethoscope className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {staffServices.length} services assigned
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditStaff(staffMember)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteStaff(staffMember.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSaveAll} className="bg-primary hover:bg-primary/90">
            Save All Changes
          </Button>
        </div>
      )}

      {/* Add/Edit Staff Modal */}
      <Dialog
        open={showAddModal || !!editingStaff}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddModal(false);
            setEditingStaff(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStaff ? "Edit Staff Member" : "Add New Staff Member"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Dr. John Smith"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  placeholder="john@pharmacy.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                  placeholder="64212345678"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      isActive: checked,
                    })
                  }
                />
                <Label>Active Staff Member</Label>
              </div>
            </div>

            {/* Schedule Configuration */}
            <div>
              <h3 className="text-lg font-medium mb-4">Working Schedule</h3>
              <div className="space-y-3">
                {daysOfWeek.map(({ key, label }) => {
                  const daySchedule = formData.schedule[key];
                  return (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-24">
                          <Label className="font-medium">{label}</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={daySchedule.isOpen}
                            onCheckedChange={(checked) =>
                              updateStaffSchedule(key, {
                                isOpen: checked,
                              })
                            }
                          />
                          <Label className="text-sm text-muted-foreground">{daySchedule.isOpen ? "Working" : "Off"}</Label>
                        </div>
                      </div>

                      {daySchedule.isOpen && (
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Label className="text-sm">From:</Label>
                            <TimeInput
                              value={daySchedule.startTime}
                              onChange={(time) =>
                                updateStaffSchedule(key, {
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
                                updateStaffSchedule(key, {
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
              </div>
            </div>

            {/* Services Configuration */}
            {!loading && (
              <div>
                <h3 className="text-lg font-medium mb-4">Services</h3>

                {/* Vaccination Services */}
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-3 text-primary">Vaccination Services</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getServicesByCategory(true).map((service) => (
                      <div key={service.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-card">
                        <Checkbox
                          id={`service-${service.id}`}
                          checked={formData.serviceAssignments.includes(service.id)}
                          onCheckedChange={(checked) => handleServiceToggle(service.id, checked as boolean)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={`service-${service.id}`} className="text-sm font-medium cursor-pointer">
                            {service.name}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* General Services */}
                <div>
                  <h4 className="text-md font-medium mb-3 text-primary">General Services</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getServicesByCategory(false).map((service) => (
                      <div key={service.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-card">
                        <Checkbox
                          id={`service-${service.id}`}
                          checked={formData.serviceAssignments.includes(service.id)}
                          onCheckedChange={(checked) => handleServiceToggle(service.id, checked as boolean)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={`service-${service.id}`} className="text-sm font-medium cursor-pointer">
                            {service.name}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingStaff(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingStaff ? handleUpdateStaff : handleAddStaff} className="bg-primary hover:bg-primary/90">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
