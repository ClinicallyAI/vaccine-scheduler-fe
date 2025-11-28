import React, { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { AppDialog } from "@/components/ui/app-dialog";
import { useForm } from "react-hook-form";
import api from "@/services/axios";
import { useNavigate } from "react-router-dom";
import { clearToken, TENANT } from "@/services/auth";
import { DateTime } from "luxon";
import { formatPhoneForDisplay, normalizePhone } from "@/utils/phoneNumberClean";

type Tab = "add" | "view" | "edit";

interface VaccineRecord {
  id: string;
  patientName: string;
  nhiNumber: string;
  contactNumber: string;
  vaccineType: string;
  isMedical: boolean;
  dueDate: string;
  status: string;
  bookedDate: string | null;
  serviceDate: string | null;
}

const ClinicallyHome = () => {
  const [tab, setTab] = useState<Tab>("add");
  const [records, setRecords] = useState<VaccineRecord[]>([]);
  const [selectedId, selectId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDemo, setDemo] = useState(false);
  const [services, setServices] = useState<{ id: number; name: string; isMedical: boolean }[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const navigate = useNavigate();

  const {
    register: addRegister,
    handleSubmit: handleAddSubmit,
    reset: resetAddForm,
    formState: { errors: addErrors },
  } = useForm();

  const {
    register: editRegister,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    setValue,
    formState: { errors: editErrors },
  } = useForm();

  useEffect(() => {
    if (TENANT == 2) setDemo(true);
    const fetchServices = async () => {
      try {
        const response = await api.get(`https://sms-demo-fszn.onrender.com/services/${TENANT}`);
        setServices(
          response.data.data.filter((s: any) => s.is_active).map((s: any) => ({ id: s.id, name: s.name, isMedical: s.is_medical }))
        );
      } catch (err) {
        console.error("Failed to load services:", err);
      }
    };

    if (TENANT) fetchServices();
    populateRecords();
  }, []);

  const populateRecords = async () => {
    setLoading(true);
    try {
      const response = await api.get("https://sms-demo-fszn.onrender.com/service-records");
      setRecords(
        response.data.data.rows.map((r: any) => ({
          id: r.id,
          patientName: r.name,
          nhiNumber: r.nhi_number,
          email: r.email,
          contactNumber: r.phone_number,
          vaccineType: r.service_type,
          isMedical: r.is_medical,
          dueDate: r.due_date,
          status: r.status,
          serviceDate: r.service_date,
          bookedDate: r.booked_date,
        }))
      );
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error loading vaccine records:", error);
    }
  };

  const onClickEditRecord = (record: VaccineRecord) => {
    setTab("edit");
    selectId(record.id);

    const formatDateForInput = (dateStr: string | null): string => {
      if (!dateStr) return "";
      return DateTime.fromISO(dateStr, { zone: "utc" }).setZone("Pacific/Auckland").toFormat("yyyy-MM-dd");
    };

    for (const key in record) {
      const value = record[key as keyof VaccineRecord];

      // Format the date fields
      if (key === "dueDate" || key === "bookedDate" || key === "serviceDate") {
        setValue(key as keyof VaccineRecord, formatDateForInput(value as string));
      } else {
        setValue(key as keyof VaccineRecord, value ?? "");
      }
    }
  };

  const onClickCancel = () => {
    resetAddForm();
    resetEditForm();
    setTab("view");
  };

  const onSubmitAddForm = async (data: any) => {
    setLoading(true);
    try {
      const contact = data.contactNumber;

      const normalized = normalizePhone(contact);
      data.contactNumber = normalized;

      const target = services.find((service) => service.name === data.vaccineType);
      data.isMedical = target?.isMedical;

      const payload = { ...data, status: "Reminder Scheduled" };
      const response = await api.post("https://sms-demo-fszn.onrender.com/service-records", payload);
      alert(response.data.data.message);
      resetAddForm();
      await populateRecords();
      setTab("view");
    } catch (error: any) {
      alert("Error scheduling SMS: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitEditForm = async (data: any) => {
    setLoading(true);
    try {
      const contact = data.contactNumber;

      const normalized = normalizePhone(contact);
      data.contactNumber = normalized;

      const target = services.find((service) => service.name === data.vaccineType);
      data.isMedical = target?.isMedical;

      const payload = {
        ...data,
        serviceDate: data.serviceDate === "" ? null : data.serviceDate,
        bookedDate: data.bookedDate === "" ? null : data.bookedDate,
        dueDate: data.dueDate === "" ? null : data.dueDate,
      };

      const response = await api.post("https://sms-demo-fszn.onrender.com/service-records", payload);
      alert(response.data.data.message);
      await populateRecords();
      if (data.status === "Completed") {
        setDialogData({
          title: "Schedule Next Reminder?",
          message: "This patient has completed their vaccination. Would you like to schedule their next reminder?",
          onConfirm: () => {
            // pre-fill form and navigate
            resetAddForm({
              patientName: data.patientName,
              nhiNumber: data.nhiNumber,
              contactNumber: data.contactNumber,
              vaccineType: "",
              isMedical: false,
              dueDate: "",
            });
            setTab("add");
          },
        });
        setDialogOpen(true);
      } else {
        setTab("view");
      }
      resetEditForm();
    } catch (error: any) {
      alert("Error updating record: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Reminder Scheduled":
        return "status-scheduled";
      case "Sent":
        return "status-sent";
      case "Overdue":
        return "status-overdue";
      case "Booked":
      case "Walk-in":
        return "status-booked";
      case "Completed":
        return "status-completed";
      default:
        return "status-unknown";
    }
  };

  const getStatusTooltip = (status: string) => {
    switch (status) {
      case "Reminder Scheduled":
        return "A reminder is scheduled to be sent one day before the due date.";
      case "Sent":
        return "Reminder SMS has been sent to the patient.";
      case "Overdue":
        return "Overdue SMS has been sent and the patient has not acted.";
      case "Booked":
        return "The patient has booked an appointment.";
      case "Walk-in":
        return "The patient has walked in to the clinic and registered.";
      case "Completed":
        return "The vaccination has been administered.";
      default:
        return "Unknown status.";
    }
  };

  const onSendNow = async () => {
    setLoading(true);
    try {
      await api.post("https://sms-demo-fszn.onrender.com/send-reminder");
      alert("Message sent successfully");
      await populateRecords();
      setTab("view");
    } catch (error: any) {
      alert("Error sending reminder: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deletePatient = async () => {
    setLoading(true);
    const payload = {
      data: { id: selectedId },
    };
    try {
      await api.delete("https://sms-demo-fszn.onrender.com/service-records", payload);
      alert("Reminder has been deleted successfully");
      await populateRecords();
      setTab("view");
    } catch (error: any) {
      alert("Error deleting patient: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem 2rem",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Pharmacy Vaccination Reminder System</h1>

        <button
          onClick={() => {
            clearToken();
            navigate("/login");
          }}
          style={{
            position: "absolute",
            right: "2rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: "white",
            fontSize: "1rem",
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.7")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Logout
        </button>
      </header>
      {/* Everything */}
      <div className="container" style={{ padding: "2rem" }}>
        {loading && <Spinner />}
        {/* Tab box */}
        <div className="tab-container">
          <div className="tabs">
            <div className={`tab ${tab === "add" ? "active" : ""}`} onClick={() => setTab("add")}>
              Add New Patient
            </div>
            <div className={`tab ${tab === "view" ? "active" : ""}`} onClick={() => setTab("view")}>
              View All Records
            </div>
          </div>
        </div>

        {loading && <div className="spinner">Loading...</div>}

        {tab === "add" && (
          <div className="form-container">
            <h2>Set up new reminder</h2>
            <form onSubmit={handleAddSubmit(onSubmitAddForm)}>
              <div className="form-row">
                <div className="form-group">
                  <label>Patient Name *</label>
                  <input {...addRegister("patientName", { required: true })} placeholder="Patient Name" />
                  {addErrors.patientName && <p className="form-error">Name is required</p>}
                </div>

                <div className="form-group">
                  <label>NHI Number</label>
                  <input {...addRegister("nhiNumber", { required: false })} placeholder="NHI Number" />
                  {addErrors.nhiNumber && <p className="form-error">NHI number is required</p>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Number *</label>
                  <input
                    {...addRegister("contactNumber", {
                      required: true,
                      pattern: /^(0|64)?\d{7,10}$/,
                    })}
                    placeholder="Contact Number (e.g., 211234567)"
                  />
                  {addErrors.contactNumber && <p className="form-error">Valid contact number required</p>}
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    {...addRegister("email", {
                      required: false,
                      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    })}
                    placeholder="Email Address (e.g., patient@gmail.com)"
                  />
                  {addErrors.email && <p className="form-error">Invalid email address</p>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Due Date *</label>
                  <input type="date" {...addRegister("dueDate", { required: true })} />
                  {addErrors.dueDate && <p className="form-error">Due date is required</p>}
                </div>

                <div className="form-group">
                  <label>Service *</label>
                  <select {...addRegister("vaccineType", { required: true })}>
                    {" "}
                    <option value="">Select service...</option>{" "}
                    {services.map((service) => (
                      <option key={service.name} value={service.name}>
                        {" "}
                        {service.name}{" "}
                      </option>
                    ))}{" "}
                  </select>
                  {addErrors.vaccineType && <p className="form-error">Service is required</p>}
                </div>
              </div>

              <div className="form-actions">
                <button className="admin-button" type="submit">
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        )}

        {tab === "view" && (
          <div className="records-container">
            <h2>All Vaccination Records</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>NHI</th>
                  <th>Contact</th>
                  <th>Vaccine</th>
                  <th>Status</th>
                  <th>Due</th>
                  <th>Booked</th>
                  <th>Serviced</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td>{r.patientName}</td>
                    <td>{r.nhiNumber}</td>
                    <td>{formatPhoneForDisplay(r.contactNumber)}</td>
                    <td>{r.vaccineType}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(r.status)}`} title={getStatusTooltip(r.status)}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      {r.dueDate
                        ? new Date(r.dueDate).toLocaleDateString("en-NZ", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            timeZone: "Pacific/Auckland",
                          })
                        : "-"}
                    </td>
                    <td>
                      {r.bookedDate
                        ? new Date(r.bookedDate).toLocaleDateString("en-NZ", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            timeZone: "Pacific/Auckland",
                          })
                        : "-"}
                    </td>
                    <td>
                      {r.serviceDate
                        ? new Date(r.serviceDate).toLocaleDateString("en-NZ", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            timeZone: "Pacific/Auckland",
                          })
                        : "-"}
                    </td>
                    <td>
                      <button className="edit-btn" onClick={() => onClickEditRecord(r)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "edit" && (
          <div className="form-container">
            <form onSubmit={handleEditSubmit(onSubmitEditForm)}>
              <h2>Edit Patient Info</h2>
              <input type="hidden" {...editRegister("id")} />

              <div className="form-row">
                <div className="form-group">
                  <label>Patient Name</label>
                  <input {...editRegister("patientName", { required: true })} placeholder="Patient Name" />
                  {editErrors.patientName && <p className="form-error">Name is required</p>}
                </div>

                <div className="form-group">
                  <label>NHI Number</label>
                  <input {...editRegister("nhiNumber", { required: false })} placeholder="NHI Number" />
                  {editErrors.nhiNumber && <p className="form-error">NHI number is required</p>}
                </div>

                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    {...editRegister("contactNumber", {
                      required: true,
                      pattern: /^(0|64)?\d{7,10}$/,
                    })}
                    placeholder="Contact Number"
                  />
                  {editErrors.contactNumber && <p className="form-error">Valid contact required</p>}
                </div>

                <div className="form-group">
                  <label>Service</label>
                  <select {...editRegister("vaccineType", { required: true })}>
                    {" "}
                    <option value="">Select service...</option>{" "}
                    {services.map((service) => (
                      <option key={service.name} value={service.name}>
                        {" "}
                        {service.name}{" "}
                      </option>
                    ))}{" "}
                  </select>
                  {editErrors.vaccineType && <p className="form-error">Service is required</p>}
                </div>

                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" {...editRegister("dueDate", { required: true })} />
                  {editErrors.dueDate && <p className="form-error">Due date is required</p>}
                </div>

                <div className="form-group">
                  <label>Reminder Status</label>
                  <select {...editRegister("status", { required: true })}>
                    <option value="">Select vaccine...</option>
                    <option value="Reminder Scheduled">Reminder Scheduled</option>
                    <option value="Walk-in">Walk in</option>
                    <option value="Sent">Sent</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Booked">Booked</option>
                    <option value="Booking Cancelled">Booking Cancelled</option>
                    <option value="Did not Attend">Did not Attend</option>
                    <option value="Completed">Completed</option>
                  </select>
                  {editErrors.status && <p className="form-error">Status is required</p>}
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    {...editRegister("email", {
                      required: false,
                      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    })}
                    placeholder="Email Address (e.g., patient@gmail.com)"
                  />
                  {addErrors.email && <p className="form-error">Invalid email address</p>}
                </div>

                <div className="form-group">
                  <label>Serviced Date</label>
                  <input type="date" {...editRegister("serviceDate")} placeholder="Vaccinated Date" />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="secondary-button" onClick={onClickCancel}>
                  Cancel
                </button>
                <button className="admin-button" type="submit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {isDemo && tab === "edit" && (
          <div className="form-actions">
            <button className="secondary-button" onClick={() => deletePatient()}>
              Delete
            </button>
            <button className="admin-button" onClick={() => onSendNow()}>
              Send now
            </button>
          </div>
        )}
      </div>
      {dialogData && (
        <AppDialog
          open={dialogOpen}
          title={dialogData.title}
          message={dialogData.message}
          onClose={() => setDialogOpen(false)}
          onConfirm={dialogData.onConfirm}
          confirmText="Yes"
          cancelText="No"
        />
      )}
    </div>
  );
};

export default ClinicallyHome;
