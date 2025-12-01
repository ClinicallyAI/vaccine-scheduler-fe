import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { clearToken } from "@/services/auth";
import api from "@/services/axios";
import { TENANT } from "@/services/auth";
import AddPatientModal from "@/components/AddPatientModal";
import EditPatientModal from "@/components/EditPatientModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { normalizePhone } from "@/utils/phoneNumberClean";
import NextReminderModal from "@/components/NextReminderModal";
import { BookingStatus, RecordStatus, ServiceRecord } from "@/types/serviceRecords";
import DashboardHeader from "./DashboardHeader";
import HomeTab from "./HomeTab/HomeTab";
import RemindersTab from "./RemindersTab/RemindersTab";
import SetupTab from "./SetupTab/SetupTab";
import PatientInfoTooltip from "./PatientInfoTooltip";
import { getNZTodayISO, nzDayKey, toDateInputValue, fromDateInputValue } from "./utils/dateHelpers";

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

const ClinicallyHome: React.FC = () => {
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
      <DashboardHeader onLogout={handleLogout} />

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
            <HomeTab
              todaysBookings={todaysBookings}
              todaysWalkIns={todaysWalkIns}
              pendingBookingCount={pendingBookingCount}
              pendingWalkInCount={pendingWalkInCount}
              pendingStatus={pendingStatus}
              rowUpdating={rowUpdating}
              onStatusChange={handleHomeStatusChange}
              onRowMouseEnter={handleRowMouseEnter}
              onRowMouseMove={handleRowMouseMove}
              onRowMouseLeave={handleRowMouseLeave}
              onClearTooltip={clearTooltip}
            />
          </TabsContent>

          <TabsContent value="reminders" className="mt-0">
            <RemindersTab
              records={filteredRecords}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onAddNew={openAdd}
              onEdit={openEdit}
              onRowMouseEnter={handleRowMouseEnter}
              onRowMouseMove={handleRowMouseMove}
              onRowMouseLeave={handleRowMouseLeave}
            />
          </TabsContent>

          <TabsContent value="setup">
            <SetupTab />
          </TabsContent>
        </Tabs>
      </div>

      {hoveredRow && recordById[hoveredRow] && (
        <PatientInfoTooltip record={recordById[hoveredRow]} position={tooltipPosition} />
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

export default ClinicallyHome;
