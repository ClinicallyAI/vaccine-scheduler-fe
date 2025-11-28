// ClinicallyHome.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { clearToken } from "@/services/auth";
import { AlertCircle, Calendar, Clock, Edit, Folder, LogOut, Settings, Users } from "lucide-react";

import api from "@/services/axios";
import { TENANT } from "@/services/auth";
import AddPatientModal from "@/components/AddPatientModal";
import EditPatientModal from "@/components/EditPatientModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // your file above
import { Badge } from "@/components/ui/badge";

import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPhoneForDisplay, normalizePhone } from "@/utils/phoneNumberClean";
import NextReminderModal from "@/components/NextReminderModal";
import { BookingStatus, RecordStatus, ServiceRecord } from "@/types/serviceRecords";
import { calculateAgeFromDate } from "@/utils/ageCalculation";

// ---------- Types & Constants ----------

function mapRecordToBookingStatus(r: ServiceRecord): BookingStatus {
  if (r.status === "Completed") return "Completed";
  if (r.status === "Did not Attend") return "Did not Attend";
  if (r.status === "Walk-in") return "Walk-in";
  return "Booked"; // default
}

export interface ServiceInfo {
  id: number;
  name: string;
  isMedical: boolean;
}

// Tab identity
type TabKey = "home" | "reminders" | "setup";

// ---------- Component ----------
const ClinicallyHomeTwo: React.FC = () => {
  // ----- UI State -----
  const [tab, setTab] = useState<TabKey>("home");

  // Data
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [records, setRecords] = useState<ServiceRecord[]>([]);

  const [rowUpdating, setRowUpdating] = useState<Record<string, boolean>>({});

  const [loadingCount, setLoadingCount] = useState(0);
  const loading = loadingCount > 0; // replace your old loading var usage

  function beginLoad() {
    setLoadingCount((c) => c + 1);
  }
  function endLoad() {
    setLoadingCount((c) => Math.max(0, c - 1));
  }

  // Filters (Reminders tab)
  const [statusFilter, setStatusFilter] = useState<RecordStatus | "All">("All");

  // Home tab inline-edit status map (row id -> status)
  const [pendingStatus, setPendingStatus] = useState<Record<string, BookingStatus>>({});

  // Modals
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [nextScheduleOpen, setNextScheduleOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<ServiceRecord | null>(null);

  // Hover tooltip
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Forms
  const addForm = useForm<Partial<ServiceRecord>>({ defaultValues: {} });
  const editForm = useForm<Partial<ServiceRecord>>({ defaultValues: {} });

  // Derived
  const todaysBookings = useMemo(() => {
    const todayNZ = getNZTodayISO();

    return records
      .filter((r) => {
        const bookedKey = nzDayKey(r.bookedDate);
        return bookedKey === todayNZ && !r.isWalkIn;
      })
      .sort((a, b) => {
        const aTime = a.bookedDate ? new Date(a.bookedDate).getTime() : 0;
        const bTime = b.bookedDate ? new Date(b.bookedDate).getTime() : 0;
        return aTime - bTime;
      });
  }, [records]);

  // Derived
  const todaysWalkIns = useMemo(() => {
    const todayNZ = getNZTodayISO();

    return records
      .filter((r) => {
        const bookedKey = nzDayKey(r.bookedDate);
        return bookedKey === todayNZ && r.isWalkIn;
      })
      .sort((a, b) => {
        const aTime = a.bookedDate ? new Date(a.bookedDate).getTime() : 0;
        const bTime = b.bookedDate ? new Date(b.bookedDate).getTime() : 0;
        return aTime - bTime;
      });
  }, [records]);

  const pendingBookingCount = todaysBookings.filter((booking) => booking.status === "Booked").length;
  const pendingWalkInCount = todaysWalkIns.filter((booking) => booking.status === "Walk-in").length;

  const filteredRecords = useMemo(() => {
    if (statusFilter === "All") return records;
    return records.filter((r) => r.status === statusFilter);
  }, [records, statusFilter]);

  const recordById = useMemo(() => Object.fromEntries(records.map((r) => [r.id, r] as const)), [records]);

  // ---------- Effects ----------
  useEffect(() => {
    (async () => {
      await Promise.all([fetchServices(), fetchRecords()]);
    })();
  }, []);

  useEffect(() => {
    const seed: Record<string, BookingStatus> = {};
    records.forEach((r) => {
      seed[r.id] = mapRecordToBookingStatus(r);
    });
    setPendingStatus(seed);
  }, [records]);

  // ---------- API Layer ----------
  async function fetchServices(): Promise<void> {
    beginLoad();
    try {
      const { data } = await api.get(`/services/${TENANT}`);
      const list = (data?.data ?? [])
        .filter((s: any) => s.is_active)
        .map((s: any) => ({ id: s.id, name: s.name, isMedical: !!s.is_medical }));
      setServices(list);
    } catch (err) {
      console.error("Failed to load services:", err);
    } finally {
      endLoad();
    }
  }

  async function fetchRecords(): Promise<void> {
    beginLoad();
    try {
      const { data } = await api.get(`/service-records`);
      const rows = data?.data?.rows ?? [];
      const normalized: ServiceRecord[] = rows.map((r: any) => ({
        id: r.id,
        patientName: r.name,
        nhiNumber: r.nhi_number ?? "",
        contactNumber: r.phone_number ?? "",
        email: r.email ?? null,
        vaccineType: r.service_type,
        isMedical: !!r.is_medical,
        dueDate: r.due_date ?? null,
        status: r.status,
        bookedDate: r.booked_date ?? null,
        serviceDate: r.service_date ?? null,
        isWalkIn: r.is_walk_in,
        dob: r.date_of_birth ? new Date(r.date_of_birth) : null,
      }));
      setRecords(normalized);
    } catch (err) {
      console.error("Error loading records:", err);
    } finally {
      endLoad();
    }
  }

  async function handleNextReminderSchedule(dueDate: string): Promise<void> {
    try {
      beginLoad();

      if (!activeRecord?.id) {
        throw new Error("No active record selected.");
      }
      if (!dueDate || !dueDate.trim()) {
        throw new Error("A next due date is required.");
      }

      // 1) Get the full current row (no form dependency, just the source-of-truth row)
      const current = hydrateWithExisting({ id: activeRecord.id });

      // 2) Build a *new* record for the next reminder (no id => create)
      const nextReminder: Partial<ServiceRecord> = {
        patientName: current.patientName,
        nhiNumber: current.nhiNumber,
        email: current.email ?? null,
        contactNumber: current.contactNumber,
        vaccineType: current.vaccineType,
        isMedical: current.isMedical,
        // new values for the "next" reminder
        dueDate, // yyyy-MM-dd expected
        bookedDate: null,
        serviceDate: null,
        status: "Reminder Scheduled",
        // id intentionally omitted so backend creates a new row
      };

      // 3) Normalize for API
      const normalizedPhone = normalizePhone(nextReminder.contactNumber);
      const chosen = services.find((s) => s.name === nextReminder.vaccineType);

      const payload = {
        // id: undefined  <-- omit on purpose to create a new record
        patientName: nextReminder.patientName,
        nhiNumber: nextReminder.nhiNumber || null,
        email: nextReminder.email || null,
        contactNumber: normalizedPhone,
        vaccineType: nextReminder.vaccineType,
        isMedical: chosen ? chosen.isMedical : false,
        dueDate: fromDateInputValue(nextReminder.dueDate as any),
        bookedDate: null,
        serviceDate: null,
        status: "Reminder Scheduled",
      };

      // 4) Create the new record, refresh, close
      await api.post(`/service-records`, payload);
      await fetchRecords();
      toast.success("Patient added");
      closeModals();
    } catch (err) {
      console.error(err);
      throw err; // let caller toast
    } finally {
      endLoad();
    }
  }

  async function createRecord(form: Partial<ServiceRecord>): Promise<void> {
    try {
      beginLoad();

      const normalizedPhone = normalizePhone(form.contactNumber);
      const chosen = services.find((s) => s.name === form.vaccineType);
      const payload = {
        patientName: form.patientName,
        nhiNumber: form.nhiNumber || null,
        email: form.email || null,
        contactNumber: normalizedPhone,
        vaccineType: form.vaccineType, // service name
        isMedical: chosen ? chosen.isMedical : false,
        dueDate: fromDateInputValue(form.dueDate as any),
        bookedDate: fromDateInputValue(form.bookedDate as any),
        serviceDate: fromDateInputValue(form.serviceDate as any),
        status: (form.status as RecordStatus) ?? "Reminder Scheduled",
        dob: form.dob,
      };

      await api.post(`/service-records`, payload);
      toast.success("Patient added");
      await fetchRecords();
      closeModals();
    } catch (err: any) {
      console.error(err);
    } finally {
      endLoad();
    }
  }

  async function updateRecord(form: Partial<ServiceRecord> & { id: string }): Promise<void> {
    try {
      beginLoad();

      // 1) Merge the incoming partial with the existing record
      const full = hydrateWithExisting(form);

      // 2) Normalize/derive fields for the API
      const normalizedPhone = normalizePhone(full.contactNumber);
      const chosen = services.find((s) => s.name === full.vaccineType);

      // Auto-set service_date if Completed and not present
      let service_date = fromDateInputValue(full.serviceDate as any);
      if (full.status === "Completed" && !service_date) {
        service_date = getNZTodayISO();
      }

      const payload = {
        id: full.id,
        patientName: full.patientName,
        nhiNumber: full.nhiNumber || null,
        email: full.email || null,
        contactNumber: normalizedPhone,
        vaccineType: full.vaccineType,
        isMedical: chosen ? chosen.isMedical : false,
        dueDate: fromDateInputValue(full.dueDate as any),
        bookedDate: fromDateInputValue(full.bookedDate as any),
        serviceDate: service_date,
        status: full.status,
        dob: full.dob,
      };

      await api.post(`/service-records`, payload);
      await fetchRecords();
      toast.success("Patient edited");
      closeModals();
    } catch (err) {
      console.error(err);
      throw err; // let callers toast/rollback
    } finally {
      endLoad();
    }
  }

  const navigate = useNavigate();

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  async function deleteRecord(id: string): Promise<void> {
    // TODO: DELETE /service-records (with { data: { id } })
    // - refresh list
  }

  async function sendReminderNow(): Promise<void> {
    // TODO: POST /send-reminder
    // - refresh list
  }

  // ---------- Helpers ----------

  function formatDateForDisplay(dob: Date | null | undefined): string {
    if (!dob) return "N/A";
    const date = new Date(dob);
    return new Intl.DateTimeFormat("en-NZ", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  function handleRowMouseEnter(recordId: string, event: React.MouseEvent) {
    setHoveredRow(recordId);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  }

  function handleRowMouseMove(event: React.MouseEvent) {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  }

  function handleRowMouseLeave() {
    setHoveredRow(null);
  }

  function clearTooltip() {
    setHoveredRow(null);
  }

  function toDateInputValue(iso?: string | null): string {
    // Accept "YYYY-MM-DD" or full ISO; return "YYYY-MM-DD" or ""
    if (!iso) return "";
    return iso.length >= 10 ? iso.slice(0, 10) : "";
  }

  function fromDateInputValue(v?: string | null): string | null {
    // Accept "", undefined => null; else keep "YYYY-MM-DD"
    if (!v || !v.trim()) return null;
    return v;
  }

  function nzDateDisplay(iso?: string | null, type = "short"): string {
    if (!iso) return "-";
    // Accept "YYYY-MM-DD" or full ISO; render in NZ as "dd MMM yyyy"
    try {
      // If it's just a date, append midnight UTC so we can format consistently
      const d = iso.length <= 10 ? new Date(`${iso}T00:00:00Z`) : new Date(iso);

      if (type === "long") {
        return new Intl.DateTimeFormat("en-NZ", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(d);
      }
      return new Intl.DateTimeFormat("en-NZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Pacific/Auckland",
      }).format(d);
    } catch {
      return iso;
    }
  }

  function nzTimeRange(input?: string | null, durationMinutes = 15): string {
    if (!input) return "-";

    try {
      const start = new Date(input); // UTC parse
      const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

      const fmt = new Intl.DateTimeFormat("en-NZ", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Pacific/Auckland",
      });
      if (durationMinutes === 0) {
        return `${fmt.format(start)}`;
      }
      return `${fmt.format(start)} - ${fmt.format(end)}`;
    } catch {
      return "-";
    }
  }

  function hydrateWithExisting(partial: Partial<ServiceRecord> & { id: string }): ServiceRecord {
    const existing = recordById[partial.id];
    if (!existing) {
      // If somehow we don't have it locally, fall back to a minimal merge;
      // optionally you could fetch by id here.
      throw new Error("Cannot update: record not found in current list.");
    }
    // Merge: partial fields override existing
    return {
      ...existing,
      ...partial,
    };
  }

  // yyyy-MM-dd for the current day in NZ
  function getNZTodayISO(): string {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Pacific/Auckland",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date()); // en-CA => yyyy-MM-dd
  }

  // Turn a backend date/datetime into an NZ day key (yyyy-MM-dd)
  function nzDayKey(input?: string | null): string | null {
    if (!input) return null;

    // If it's already a date-only "YYYY-MM-DD", treat that literal day as-is.
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;

    // Otherwise assume a datetime ISO string and format its NZ date.
    try {
      const d = new Date(input); // safe, then format in NZ TZ:
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Pacific/Auckland",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(d);
    } catch {
      return null;
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Completed: {
        label: "Completed",
        variant: "default" as const,
      },
      Overdue: {
        label: "Overdue",
        variant: "destructive" as const,
      },
      Sent: {
        label: "Sent",
        variant: "secondary" as const,
      },
      Booked: {
        label: "Booked",
        variant: "default" as const,
      },
      "Walk-in": {
        label: "Walk-in",
        variant: "default" as const,
      },
      "Reminder Scheduled": {
        label: "Reminder Scheduled",
        variant: "secondary" as const,
      },
      "Booking Cancelled": {
        label: "Booking Cancelled",
        variant: "outline" as const,
      },
      "Did not Attend": {
        label: "Did not Attend",
        variant: "outline" as const,
      },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // ---------- Modals ----------
  function openAdd() {
    addForm.reset({
      patientName: "",
      nhiNumber: "",
      contactNumber: "",
      email: "",
      vaccineType: "",
      isMedical: false,
      dueDate: "", // bound to <input type="date">
      bookedDate: "",
      serviceDate: "",
      status: "Reminder Scheduled",
    });
    setAddOpen(true);
  }

  function openEdit(row: ServiceRecord) {
    setActiveRecord(row);
    editForm.reset({
      id: row.id,
      patientName: row.patientName,
      nhiNumber: row.nhiNumber,
      contactNumber: row.contactNumber,
      email: row.email ?? "",
      vaccineType: row.vaccineType,
      isMedical: row.isMedical,
      dueDate: toDateInputValue(row.dueDate),
      bookedDate: toDateInputValue(row.bookedDate),
      serviceDate: toDateInputValue(row.serviceDate),
      status: row.status,
    });
    setEditOpen(true);
  }

  function closeModals() {
    setActiveRecord(null);
    setNextScheduleOpen(false);
    setEditOpen(false);
    setAddOpen(false);
  }

  // Home tab inline status save
  async function handleHomeStatusChange(id: string, next: BookingStatus) {
    // optimistic update
    const prev = pendingStatus[id] ?? "Booked";
    setPendingStatus((s) => ({ ...s, [id]: next }));
    setRowUpdating((s) => ({ ...s, [id]: true }));

    const todayNZ = getNZTodayISO();
    const payload: Partial<ServiceRecord> & { id: string } = { id };

    if (next === "Completed") {
      payload.status = "Completed";
      payload.serviceDate = todayNZ; // yyyy-MM-dd
    } else if (next === "Did not Attend") {
      payload.status = "Did not Attend";
      payload.serviceDate = null;
    } else if (next === "Walk-in") {
      payload.status = "Walk-in";
      payload.serviceDate = null;
    } else {
      payload.status = "Booked";
    }

    try {
      await updateRecord(payload);
      toast.success("Status updated");
      if (next === "Completed") {
        const row = recordById[id];
        if (!row) {
          console.warn("Active record not found for id:", id);
          toast.error("Couldn’t open next reminder — record not found.");
        } else {
          setActiveRecord(row);
          setNextScheduleOpen(true);
        }
      }
    } catch (e) {
      console.error(e);
      // rollback on failure
      setPendingStatus((s) => ({ ...s, [id]: prev }));
      toast.error("Failed to update status");
    } finally {
      setRowUpdating((s) => ({ ...s, [id]: false }));
    }
  }

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-background">
      {/* Header (optional) */}
      <header className="bg-primary text-primary-foreground p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Your Pharmacy Dashboard</h1>
          <Button variant="ghost" className="text-primary-foreground hover:bg-primary/90" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
          <TabsList className="mb-6">
            <TabsTrigger value="home" className="relative">
              Home
              {pendingBookingCount + pendingWalkInCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white"
                >
                  {pendingBookingCount + pendingWalkInCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
            <TabsTrigger value="setup">Set Up</TabsTrigger>
          </TabsList>

          {/* Loading */}
          {loading && <div>Loading…</div>}

          <TabsContent value="home">
            {/* START From HERE  */}
            <div className="space-y-8">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Today's Schedule</h1>
                <p className="text-muted-foreground">{nzDateDisplay(new Date().toISOString(), "long")}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Appointments Today
                      </CardTitle>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{todaysBookings.length}</div>
                        <div className="text-sm text-muted-foreground">
                          {todaysBookings.length - pendingBookingCount}/{todaysBookings.length} completed
                        </div>
                      </div>
                    </div>
                    {pendingBookingCount > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <Badge variant="secondary">{pendingBookingCount} pending</Badge>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted/50 border-b">
                              <th className="text-left p-3 font-semibold">Time</th>
                              <th className="text-left p-3 font-semibold">Patient Name</th>
                              <th className="text-left p-3 font-semibold">Service</th>
                              <th className="text-left p-3 font-semibold">Phone Number</th>
                              <th className="text-left p-3 font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {todaysBookings.map((r) => {
                              return (
                                <tr
                                  key={r.id}
                                  onMouseEnter={(e) => handleRowMouseEnter(r.id, e)}
                                  onMouseMove={handleRowMouseMove}
                                  onMouseLeave={handleRowMouseLeave}
                                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                                >
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      {r.status === "Booked" && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                                      <Clock className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-mono text-sm">{nzTimeRange(r.bookedDate, 15)}</span>
                                    </div>
                                  </td>
                                  <td className="p-3 font-medium">{r.patientName}</td>
                                  <td className="p-3">
                                    <span className="px-2 py-1 bg-muted rounded-md text-sm font-medium">{r.vaccineType}</span>
                                  </td>
                                  <td className="p-3 text-muted-foreground">{formatPhoneForDisplay(r.contactNumber)}</td>
                                  <td className="p-3">
                                    <select
                                      value={pendingStatus[r.id] ?? "Booked"}
                                      onChange={(e) => handleHomeStatusChange(r.id, e.target.value as BookingStatus)}
                                      onFocus={clearTooltip}
                                      onClick={clearTooltip}
                                      disabled={!!rowUpdating[r.id]}
                                      className="w-40"
                                    >
                                      <option value="Completed">Completed</option>
                                      <option value="Booked">Booked</option>
                                      <option value="Did not Attend">Did not Attend</option>
                                      <option value="Walk-in">Walk in</option>
                                    </select>
                                  </td>
                                </tr>
                              );
                            })}
                            {todaysBookings.length === 0 && (
                              <tr>
                                <td className="p-4 text-gray-500" colSpan={6}>
                                  No bookings for today.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Walk-In Patients
                      </CardTitle>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{todaysWalkIns.length}</div>
                        <div className="text-sm text-muted-foreground">today</div>
                      </div>
                    </div>
                    {pendingWalkInCount > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <AlertCircle className="w-4 h-4 text-blue-500" />
                        <Badge variant="outline">{pendingWalkInCount} active</Badge>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted/50 border-b">
                              <th className="text-left p-3 font-semibold">Time</th>
                              <th className="text-left p-3 font-semibold">Patient Name</th>
                              <th className="text-left p-3 font-semibold">Service</th>
                              <th className="text-left p-3 font-semibold">Phone Number</th>
                              <th className="text-left p-3 font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {todaysWalkIns.map((r) => {
                              return (
                                <tr
                                  key={r.id}
                                  onMouseEnter={(e) => handleRowMouseEnter(r.id, e)}
                                  onMouseMove={handleRowMouseMove}
                                  onMouseLeave={handleRowMouseLeave}
                                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                                >
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      {r.status === "Walk-in" && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                                      <Clock className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-mono text-sm">{nzTimeRange(r.bookedDate, 0)}</span>
                                    </div>
                                  </td>
                                  <td className="p-3 font-medium">{r.patientName}</td>
                                  <td className="p-3">
                                    <span className="px-2 py-1 bg-muted rounded-md text-sm font-medium">{r.vaccineType}</span>
                                  </td>
                                  <td className="p-3 text-muted-foreground">{formatPhoneForDisplay(r.contactNumber)}</td>
                                  <td className="p-3">
                                    <select
                                      value={pendingStatus[r.id] ?? "Booked"}
                                      onChange={(e) => handleHomeStatusChange(r.id, e.target.value as BookingStatus)}
                                      onFocus={clearTooltip}
                                      onClick={clearTooltip}
                                      disabled={!!rowUpdating[r.id]}
                                      className="w-40"
                                    >
                                      <option value="Completed">Completed</option>
                                      <option value="Booked">Booked</option>
                                      <option value="Did not Attend">Did not Attend</option>
                                      <option value="Walk-in">Walk in</option>
                                    </select>
                                  </td>
                                </tr>
                              );
                            })}
                            {todaysWalkIns.length === 0 && (
                              <tr>
                                <td className="p-4 text-gray-500" colSpan={6}>
                                  No walk ins for today.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reminders" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Reminder records</CardTitle>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as RecordStatus | "All")}>
                      <option value="All">All</option>
                      <option value="Reminder Scheduled">Reminder Scheduled</option>
                      <option value="Walk-in">Walk in</option>
                      <option value="Sent">Sent</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Booked">Booked</option>
                      <option value="Completed">Completed</option>
                      <option value="Did not Attend">Did not Attend</option>
                    </select>
                  </div>
                  <Button onClick={openAdd}>Add new patient</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">NHI</th>
                          <th className="text-left p-2">Contact</th>
                          <th className="text-left p-2">Service</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Due</th>
                          <th className="text-left p-2">Booked</th>
                          <th className="text-left p-2">Completed</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map((r) => (
                          <tr
                            key={r.id}
                            onMouseEnter={(e) => handleRowMouseEnter(r.id, e)}
                            onMouseMove={handleRowMouseMove}
                            onMouseLeave={handleRowMouseLeave}
                            className="hover:bg-muted/30 cursor-pointer transition-colors"
                          >
                            <td className="p-2">{r.patientName}</td>
                            <td className="p-2">{r.nhiNumber}</td>
                            <td className="p-2">{formatPhoneForDisplay(r.contactNumber)}</td>
                            <td className="p-2">{r.vaccineType}</td>
                            <td className="p-3">{getStatusBadge(r.status)}</td>
                            <td className="p-2">{nzDateDisplay(r.dueDate)}</td>
                            <td className="p-2">{nzDateDisplay(r.bookedDate)}</td>
                            <td className="p-2">{nzDateDisplay(r.serviceDate)}</td>
                            <td className="p-3">
                              <Button variant="outline" size="sm" onClick={() => openEdit(r)} className="flex items-center gap-1">
                                <Edit className="h-3 w-3" />
                                Edit
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {filteredRecords.length === 0 && (
                          <tr>
                            <td className="p-4 text-gray-500" colSpan={9}>
                              No records found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Patient booking system</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Configure your pharmacy's booking system</p>
                  </div>
                  {/* <Button onClick={() => navigate("./admin-setup")} className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Update
                  </Button> */}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium">Opening Hours</h4>
                        <p className="text-sm text-muted-foreground">Set your daily schedule</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium">Staff</h4>
                        <p className="text-sm text-muted-foreground">Manage team schedules</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center space-x-2">
                      <Folder className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium">Services</h4>
                        <p className="text-sm text-muted-foreground">Configure available services</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ----- Patient Info Tooltip ----- */}
      {hoveredRow && recordById[hoveredRow] && (
        <div
          style={{
            position: "fixed",
            left: `${tooltipPosition.x + 15}px`,
            top: `${tooltipPosition.y + 15}px`,
            zIndex: 9999,
            pointerEvents: "none",
          }}
          className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 min-w-[200px]"
        >
          <div className="space-y-1.5">
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Patient Name</div>
              <div className="text-sm font-semibold">{recordById[hoveredRow].patientName}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Date of Birth</div>
              <div className="text-sm">{formatDateForDisplay(recordById[hoveredRow].dob)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Age</div>
              <div className="text-sm">
                {recordById[hoveredRow].dob ? calculateAgeFromDate(recordById[hoveredRow].dob).displayAge : "N/A"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----- Edit Modal (stub) ----- */}
      {activeRecord && (
        <EditPatientModal
          open={editOpen}
          onClose={closeModals}
          services={services}
          record={activeRecord}
          onUpdate={(partial) => updateRecord(partial)}
        />
      )}

      {/* ----- Add Modal (stub) ----- */}
      <AddPatientModal
        open={addOpen}
        onClose={closeModals}
        services={services}
        onAdd={(data) => {
          // shape: { patientName, nhiNumber, contactNumber, vaccineType, dueDate }
          createRecord({
            patientName: data.patientName,
            nhiNumber: data.nhiNumber,
            contactNumber: data.contactNumber,
            vaccineType: data.vaccineType,
            dueDate: data.dueDate,
            status: "Reminder Scheduled",
            dob: data.dateOfBirth,
          });
        }}
      />

      {activeRecord && (
        <NextReminderModal
          open={nextScheduleOpen}
          patientName={activeRecord.patientName}
          vaccineType={activeRecord.vaccineType}
          onConfirm={handleNextReminderSchedule}
          onSkip={closeModals}
        />
      )}
    </div>
  );
};

export default ClinicallyHomeTwo;
