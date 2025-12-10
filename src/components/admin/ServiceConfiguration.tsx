import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Settings, Clock, DollarSign, Eye, EyeOff, Users, AlertTriangle } from "lucide-react";
import { Staff, DEFAULT_OPENING_HOURS } from "@/types/pharmacy";
import { toast } from "sonner";
import { TENANT } from "@/services/auth";
import api from "@/services/axios";
import { addVaccineToTenant, updateTenantVaccine, removeVaccineFromTenant, type AvailableVaccine } from "@/services/vaccineManagementApi";
import { useServices } from "@/hooks/useServices";
import { Service as BackendService } from "@/lib/types";

type Service = {
  id: string;
  name: string;
  description: string;
  category: "vaccination" | "general"; // map from is_medical
  duration: number; // map from duration_minutes
  pricing: { type: "fixed" | "free" | "medication_additional"; amount?: number };
  isActive: boolean; // map from is_active
  staffIds: string[]; // NEW: staff assignments from backend
};

export default function ServiceConfiguration() {
  // Use the shared services hook for fetching and combining data (auto-fetch on mount)
  const { services: backendServices, loading: servicesLoading, availableVaccines, fetchServices, clearCache } = useServices(true);

  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("vaccination");
  const [formData, setFormData] = useState({
    name: "",
    category: "vaccination" as "vaccination" | "general",
    duration: 15,
    pricing: {
      type: "fixed" as "fixed" | "free" | "medication_additional",
      amount: 0,
    },
    description: "",
    isActive: true,
    assignedStaff: [] as string[],
    selectedVaccineId: "", // For vaccine dropdown selection
  });

  // Convert backend service structure to UI-friendly structure
  const mapBackendServiceToUI = (svc: BackendService): Service => {
    const priceStr = (svc.price ?? "").toString().trim();
    const varies = !!svc.price_is_varies;

    let pricing: Service["pricing"];
    if (varies) {
      const amt = Number.parseFloat(priceStr);
      pricing = { type: "medication_additional", amount: Number.isFinite(amt) ? amt : 0 };
    } else if (priceStr === "" || priceStr === "0" || priceStr === "0.00") {
      pricing = { type: "free", amount: 0 };
    } else {
      const amt = Number.parseFloat(priceStr);
      pricing = { type: "fixed", amount: Number.isFinite(amt) ? amt : 0 };
    }

    return {
      id: svc.id,
      name: svc.name,
      description: svc.description,
      category: svc.is_medical ? "vaccination" : "general",
      duration: svc.duration_minutes,
      pricing,
      isActive: svc.is_active,
      staffIds: svc.staff_ids,
    };
  };

  // Map backend services to UI-friendly format
  const services = useMemo(() => {
    return backendServices.map(mapBackendServiceToUI);
  }, [backendServices]);

  // Fetch staff on mount (services and vaccines are auto-fetched by the hook)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        if (mounted) {
          await loadStaff();
        }
      } catch (err) {
        console.error("Failed to load staff:", err);
        toast.error("Failed to load staff");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function toServiceUpsertBody(svc: {
    id?: string;
    name: string;
    description: string;
    category: "vaccination" | "general";
    duration: number;
    pricing: { type: "fixed" | "free" | "medication_additional"; amount?: number };
    isActive: boolean;
    assignedStaff: string[];
  }) {
    // pricing -> price / price_is_varies
    let price = "";
    let price_is_varies = false;

    if (svc.pricing.type === "fixed") {
      const amt = typeof svc.pricing.amount === "number" ? svc.pricing.amount : 0;
      price = amt.toFixed(2); // backend expects string
    } else if (svc.pricing.type === "free") {
      price = "0.00";
    } else if (svc.pricing.type === "medication_additional") {
      price_is_varies = true;
      price = "0.00";
    }

    return {
      ...(svc.id ? { id: Number(svc.id) } : {}),
      tenant_id: TENANT, // you asked to reference TENANT directly
      name: svc.name,
      description: svc.description,
      duration_minutes: svc.duration,
      is_medical: svc.category === "vaccination",
      is_active: svc.isActive,
      price,
      price_is_varies,
      staffAssignments: svc.assignedStaff.map(Number), // backend uses join table
    };
  }

  // Helper function to load staff (vaccines are auto-loaded by the useServices hook)
  const loadStaff = async () => {
    try {
      const { data } = await api.get(`/tenants/${TENANT}/staff`);
      const stRows = data?.data?.rows ?? [];
      const normStaff: Staff[] = (stRows || []).map((r: any) => ({
        id: String(r.id),
        name: r.name,
        email: r.email ?? "",
        phone: r.phone ?? "",
        isActive: !!(r.isActive ?? r.is_active),
        schedule: r.schedule ?? DEFAULT_OPENING_HOURS,
        serviceAssignments: [], // No longer needed - staff assignments now managed via services
      }));
      setStaff(normStaff);
    } catch (err) {
      console.error("Failed to load staff:", err);
      throw err;
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "vaccination",
      duration: 15,
      pricing: {
        type: "fixed",
        amount: 0,
      },
      description: "",
      isActive: true,
      assignedStaff: [],
      selectedVaccineId: "",
    });
  };

  const handleAddService = async () => {
    // For vaccines, validate vaccine selection
    if (formData.category === "vaccination" && !formData.selectedVaccineId) {
      return toast.error("Please select a vaccine");
    }
    // For general services, validate name
    if (formData.category === "general" && !formData.name.trim()) {
      return toast.error("Service name is required");
    }
    if (formData.isActive && formData.assignedStaff.length === 0) {
      return toast.error("Active services must have at least one staff member assigned");
    }

    try {
      setLoading(true);

      if (formData.category === "vaccination") {
        // Add vaccine using vaccine management API
        const price = formData.pricing.type !== "free" ? (formData.pricing.amount ?? 0).toFixed(2) : "0.00";
        const priceIsVaries = formData.pricing.type === "medication_additional";

        await addVaccineToTenant(TENANT, {
          vaccineServiceId: formData.selectedVaccineId,
          price,
          priceIsVaries,
          customDescription: formData.description.trim() || null,
        });

        // Update staff assignments via updateTenantVaccine
        // Vaccine table is the source of truth
        await updateTenantVaccine(TENANT, formData.selectedVaccineId, {
          staffIds: formData.assignedStaff,
        });
      } else {
        // Add general service using existing endpoint
        const body = toServiceUpsertBody({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          duration: formData.duration,
          pricing: formData.pricing,
          isActive: formData.isActive,
          assignedStaff: formData.assignedStaff,
        });
        await api.post(`/tenants/${TENANT}/service`, body);
      }

      // Refresh data (clear cache to get fresh data)
      clearCache();
      await Promise.all([loadStaff(), fetchServices()]);

      setShowAddModal(false);
      resetForm();
      setHasChanges(true);
      toast.success(formData.category === "vaccination" ? "Vaccine added successfully!" : "Service added successfully!");
    } catch (e) {
      console.error("Add service failed:", e);
      toast.error("Failed to add service");
    } finally {
      setLoading(false);
    }
  };

  const handleEditService = (service: Service) => {
    // Get current staff assignments from the service record
    const assignedStaffIds = service.staffIds || [];

    setFormData({
      name: service.name,
      category: service.category,
      duration: service.duration,
      pricing: {
        type: service.pricing.type,
        amount: service.pricing.amount || 0,
      },
      description: service.description,
      isActive: service.isActive,
      assignedStaff: assignedStaffIds,
      selectedVaccineId: "", // Not used when editing
    });
    setEditingService(service);
  };

  const handleUpdateService = async () => {
    if (!editingService) return;
    if (formData.category === "general" && !formData.name.trim()) {
      return toast.error("Service name is required");
    }

    try {
      setLoading(true);

      if (formData.category === "vaccination") {
        // Update vaccine using vaccine management API
        const price = formData.pricing.type !== "free" ? (formData.pricing.amount ?? 0).toFixed(2) : "0.00";
        const priceIsVaries = formData.pricing.type === "medication_additional";

        // Update vaccine via vaccine API (includes staff assignments)
        // Vaccine table is the source of truth
        await updateTenantVaccine(TENANT, editingService.id, {
          price,
          priceIsVaries,
          customDescription: formData.description.trim() || null,
          isActive: formData.isActive,
          staffIds: formData.assignedStaff,
        });
      } else {
        // Update general service using existing endpoint
        const body = toServiceUpsertBody({
          id: editingService.id,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          duration: formData.duration,
          pricing: formData.pricing,
          isActive: formData.isActive,
          assignedStaff: formData.assignedStaff,
        });
        await api.post(`/tenants/${TENANT}/service`, body);
      }

      // Refresh data (clear cache to get fresh data)
      clearCache();
      await Promise.all([loadStaff(), fetchServices()]);

      setEditingService(null);
      resetForm();
      setHasChanges(true);
      toast.success(formData.category === "vaccination" ? "Vaccine updated successfully!" : "Service updated successfully!");
    } catch (e) {
      console.error("Update service failed:", e);
      toast.error("Failed to update service");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    if (!confirm("Are you sure you want to remove this service?")) return;
    try {
      setLoading(true);

      if (service.category === "vaccination") {
        // Deactivate vaccine using vaccine management API
        await removeVaccineFromTenant(TENANT, serviceId);
      } else {
        // Delete general service using existing endpoint
        await api.delete(`/tenants/${TENANT}/service/${serviceId}`);
      }

      // Refresh data (clear cache to get fresh data)
      clearCache();
      await Promise.all([loadStaff(), fetchServices()]);

      setHasChanges(true);
      toast.success(service.category === "vaccination" ? "Vaccine removed" : "Service removed");
    } catch (e) {
      console.error("Delete service failed:", e);
      toast.error("Failed to remove service");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = () => {
    toast.success("Service configuration saved successfully!");
    setHasChanges(false);
  };
  const getServicesByCategory = (category: "vaccination" | "general") => {
    return services.filter((s) => s.category === category);
  };
  const getActiveServicesCount = (category?: "vaccination" | "general") => {
    const filteredServices = category ? getServicesByCategory(category) : services;
    return filteredServices.filter((s) => s.isActive).length;
  };
  const formatPrice = (pricing: Service["pricing"]) => {
    if (pricing.type === "free") return "Free";
    if (pricing.type === "medication_additional") return "Varies";
    return `${(pricing.amount ?? 0).toFixed(2)}`;
  };

  // Get staff count for a service
  const getServiceStaffCount = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return 0;
    // Count how many of the assigned staff are active
    return service.staffIds.filter((staffId) => {
      const staffMember = staff.find((s) => s.id === staffId);
      return staffMember && staffMember.isActive;
    }).length;
  };

  // Get active staff members
  const getActiveStaff = () => {
    return staff.filter((s) => s.isActive);
  };

  // Handle staff assignment toggle
  const handleStaffToggle = (staffId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        assignedStaff: [...formData.assignedStaff, staffId],
      });
    } else {
      setFormData({
        ...formData,
        assignedStaff: formData.assignedStaff.filter((id) => id !== staffId),
      });
    }
  };

  // Select/Deselect all staff
  const handleSelectAllStaff = () => {
    const activeStaffIds = getActiveStaff().map((s) => s.id);
    setFormData({
      ...formData,
      assignedStaff: activeStaffIds,
    });
  };

  const handleClearAllStaff = () => {
    setFormData({
      ...formData,
      assignedStaff: [],
    });
  };
  const ServiceList = ({ category }: { category: "vaccination" | "general" }) => {
    const categoryServices = getServicesByCategory(category);
    const categoryLabel = category === "vaccination" ? "Vaccination" : "General";
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">{categoryLabel} Services</h3>
            <p className="text-sm text-muted-foreground">
              {categoryServices.length} services • {getActiveServicesCount(category)} active
            </p>
          </div>
        </div>

        {categoryServices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-lg">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No {categoryLabel.toLowerCase()} services configured</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categoryServices.map((service) => (
              <div key={service.id} className="border rounded-lg p-4 bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{service.name}</h4>
                      <Badge variant={service.isActive ? "default" : "secondary"}>{service.isActive ? "Active" : "Inactive"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{service.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {service.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatPrice(service.pricing)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {getServiceStaffCount(service.id)} staff
                      </span>
                      {service.isActive && getServiceStaffCount(service.id) === 0 && (
                        <span className="flex items-center gap-1 text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                          No staff assigned
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditService(service)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Services</CardTitle>
              <p className="text-sm text-muted-foreground">
                {services.length} total services • {getActiveServicesCount()} active
              </p>
            </div>
            <Button
              onClick={() => {
                // Set initial category based on active tab
                setFormData({
                  ...formData,
                  category: activeTab as "vaccination" | "general",
                });
                setShowAddModal(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add {activeTab === "vaccination" ? "Vaccine" : "Service"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="vaccination">Vaccinations ({getServicesByCategory("vaccination").length})</TabsTrigger>
              <TabsTrigger value="general">General Services ({getServicesByCategory("general").length})</TabsTrigger>
            </TabsList>

            <TabsContent value="vaccination">
              <ServiceList category="vaccination" />
            </TabsContent>

            <TabsContent value="general">
              <ServiceList category="general" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSaveAll} className="bg-primary hover:bg-primary/90">
            Save All Changes
          </Button>
        </div>
      )}

      {/* Add/Edit Service Modal */}
      <Dialog
        open={showAddModal || !!editingService}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddModal(false);
            setEditingService(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingService
                ? editingService.category === "vaccination"
                  ? "Edit Vaccine"
                  : "Edit Service"
                : formData.category === "vaccination"
                ? "Add Vaccine"
                : "Add Service"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Show category selector only when adding, not editing */}
            {!editingService && (
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: "vaccination" | "general") => {
                    setFormData({
                      ...formData,
                      category: value,
                      selectedVaccineId: "",
                      name: "",
                      description: "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    <SelectItem value="vaccination">Vaccination</SelectItem>
                    <SelectItem value="general">General Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* For vaccines when adding - show dropdown */}
            {!editingService && formData.category === "vaccination" && (
              <div>
                <Label htmlFor="vaccineSelect">Select Vaccine *</Label>
                <Select
                  value={formData.selectedVaccineId}
                  onValueChange={(vaccineId) => {
                    const selectedVaccine = availableVaccines.find((v) => v.id === vaccineId);
                    if (selectedVaccine) {
                      setFormData({
                        ...formData,
                        selectedVaccineId: vaccineId,
                        name: selectedVaccine.name,
                        description: selectedVaccine.description, // Pre-fill with default
                        duration: 15, // Always use 15 minutes for vaccines
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a vaccine" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    {availableVaccines
                      .filter((v) => !v.isLinked) // Only show vaccines not yet added
                      .map((vaccine) => (
                        <SelectItem key={vaccine.id} value={vaccine.id}>
                          {vaccine.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Select from shared vaccine pool. Recommendation rules are managed globally.
                </p>
              </div>
            )}

            {/* For vaccines when editing OR after selection - show name (read-only) */}
            {formData.category === "vaccination" && (editingService || formData.selectedVaccineId) && (
              <div>
                <Label htmlFor="vaccineName">Vaccine Name</Label>
                <Input id="vaccineName" value={formData.name} disabled className="bg-muted" />
              </div>
            )}

            {/* For general services - show editable name */}
            {formData.category === "general" && (
              <div>
                <Label htmlFor="serviceName">Service Name *</Label>
                <Input
                  id="serviceName"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Service name"
                  required
                />
              </div>
            )}

            {/* Show description field only after vaccine is selected OR for general services OR when editing */}
            {(formData.category === "general" || formData.selectedVaccineId || editingService) && (
              <div>
                <Label htmlFor="description">Description{formData.category === "vaccination" && " (Optional - Override Default)"}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  placeholder={
                    formData.category === "vaccination" ? "Customize description or leave to use default" : "Service description"
                  }
                  rows={3}
                />
                {formData.category === "vaccination" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty to use the default shared description. Custom descriptions are tenant-specific.
                  </p>
                )}
              </div>
            )}

            {/* Show pricing and duration only after vaccine is selected OR for general services OR when editing */}
            {(formData.category === "general" || formData.selectedVaccineId || editingService) && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="5"
                      max="120"
                      value={formData.category === "vaccination" ? 15 : formData.duration}
                      disabled={formData.category === "vaccination"} // Vaccines always use 15 minutes
                      className={formData.category === "vaccination" ? "bg-muted" : ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: parseInt(e.target.value) || 15,
                        })
                      }
                    />
                    {formData.category === "vaccination" && (
                      <p className="text-xs text-muted-foreground mt-1">Duration is fixed at 15 minutes for all vaccines.</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="pricingType">Pricing Type</Label>
                    <Select
                      value={formData.pricing.type}
                      disabled={formData.category === "vaccination"} // Always disabled for vaccines
                      onValueChange={(value: "fixed" | "free" | "medication_additional") =>
                        setFormData({
                          ...formData,
                          pricing: {
                            ...formData.pricing,
                            type: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger className={formData.category === "vaccination" ? "bg-muted" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50">
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="medication_additional">Varies</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.category === "vaccination" && (
                      <p className="text-xs text-muted-foreground mt-1">Pricing type is managed at the shared vaccine level.</p>
                    )}
                  </div>
                </div>

                {formData.pricing.type !== "free" && (
                  <div>
                    <Label htmlFor="amount">Price ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.pricing.amount || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing: {
                            ...formData.pricing,
                            amount: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                )}

                <div className="flex items-center space-x-4">
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
                    <Label>Active Service (Available for Online Booking)</Label>
                  </div>
                </div>

                {/* Staff Assignment Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Assign Staff Members</Label>
                      <p className="text-sm text-muted-foreground">Select which staff members can provide this service</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllStaff}
                        disabled={getActiveStaff().length === 0}
                      >
                        Select All
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={handleClearAllStaff}>
                        Clear All
                      </Button>
                    </div>
                  </div>

                  {getActiveStaff().length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground border rounded-lg">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No active staff members available</p>
                      <p className="text-xs">Add staff members in the Staff Management section</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto border rounded-lg p-3">
                      {getActiveStaff().map((staffMember) => (
                        <div key={staffMember.id} className="flex items-center space-x-3 p-2 border rounded-lg bg-card">
                          <Checkbox
                            id={`staff-${staffMember.id}`}
                            checked={formData.assignedStaff.includes(staffMember.id)}
                            onCheckedChange={(checked) => handleStaffToggle(staffMember.id, checked as boolean)}
                          />
                          <div className="flex-1">
                            <Label htmlFor={`staff-${staffMember.id}`} className="text-sm font-medium cursor-pointer">
                              {staffMember.name}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingService(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingService ? handleUpdateService : handleAddService} className="bg-primary hover:bg-primary/90">
                {editingService ? "Update Service" : "Add Service"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
