// services/adminApi.ts
import api from "@/services/axios";
import { TENANT } from "@/services/auth";
import type { OpeningHours, Staff, Service, PharmacyConfig, StaffConfig, ServiceConfig } from "@/types/pharmacy";

const USE_MOCK = true; // flip to false when backend is ready

/* ------------------------------------
   Opening Hours
------------------------------------ */
export async function getOpeningHours(): Promise<OpeningHours> {
  if (USE_MOCK) {
    const raw = localStorage.getItem(`opening_hours_${TENANT}`);
    if (raw) return JSON.parse(raw);
    // fallback to defaults (imported where needed)
    throw new Error("NO_DEFAULTS"); // caller can load DEFAULT_OPENING_HOURS
  }
  // Example real call:
  // const { data } = await api.get(`/opening-hours/${TENANT}`);
  // return mapHoursFromApi(data.data);
  throw new Error("Not implemented");
}

export async function saveOpeningHours(hours: OpeningHours): Promise<void> {
  if (USE_MOCK) {
    localStorage.setItem(`opening_hours_${TENANT}`, JSON.stringify(hours));
    return;
  }
  // await api.put(`/opening-hours/${TENANT}`, mapHoursToApi(hours));
  throw new Error("Not implemented");
}

/* ------------------------------------
   Staff
------------------------------------ */
export async function getStaff(): Promise<Staff[]> {
  if (USE_MOCK) {
    const raw = localStorage.getItem(`staff_${TENANT}`);
    return raw ? JSON.parse(raw) : [];
  }
  // const { data } = await api.get(`/staff/${TENANT}`);
  // return mapStaffListFromApi(data.data);
  throw new Error("Not implemented");
}

export async function createStaff(input: Omit<Staff, "id">): Promise<Staff> {
  if (USE_MOCK) {
    const all = await getStaff();
    const rec: Staff = { id: crypto.randomUUID(), ...input };
    localStorage.setItem(`staff_${TENANT}`, JSON.stringify([rec, ...all]));
    return rec;
  }
  // const { data } = await api.post(`/staff/${TENANT}`, mapStaffToApi(input));
  // return mapStaffFromApi(data.data);
  throw new Error("Not implemented");
}

export async function updateStaff(id: string, input: Omit<Staff, "id">): Promise<Staff> {
  if (USE_MOCK) {
    const all = await getStaff();
    const idx = all.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Staff not found");
    const rec: Staff = { id, ...input };
    all[idx] = rec;
    localStorage.setItem(`staff_${TENANT}`, JSON.stringify(all));
    return rec;
  }
  // const { data } = await api.put(`/staff/${TENANT}/${id}`, mapStaffToApi(input));
  // return mapStaffFromApi(data.data);
  throw new Error("Not implemented");
}

export async function deleteStaff(id: string): Promise<void> {
  if (USE_MOCK) {
    const all = await getStaff();
    localStorage.setItem(`staff_${TENANT}`, JSON.stringify(all.filter((s) => s.id !== id)));
    return;
  }
  // await api.delete(`/staff/${TENANT}/${id}`);
  throw new Error("Not implemented");
}

/* ------------------------------------
   Services
------------------------------------ */
export async function getServices(): Promise<Service[]> {
  if (USE_MOCK) {
    const raw = localStorage.getItem(`services_${TENANT}`);
    return raw ? JSON.parse(raw) : [];
  }
  // const { data } = await api.get(`/services/${TENANT}`);
  // return mapServicesListFromApi(data.data);
  throw new Error("Not implemented");
}

export async function createService(input: Omit<Service, "id">): Promise<Service> {
  if (USE_MOCK) {
    const all = await getServices();
    const rec: Service = { id: Date.now().toString(), ...input };
    localStorage.setItem(`services_${TENANT}`, JSON.stringify([rec, ...all]));
    return rec;
  }
  // const { data } = await api.post(`/services/${TENANT}`, mapServiceToApi(input));
  // return mapServiceFromApi(data.data);
  throw new Error("Not implemented");
}

export async function updateService(id: string, input: Omit<Service, "id">): Promise<Service> {
  if (USE_MOCK) {
    const all = await getServices();
    const idx = all.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Service not found");
    const rec: Service = { id, ...input };
    all[idx] = rec;
    localStorage.setItem(`services_${TENANT}`, JSON.stringify(all));
    return rec;
  }
  // const { data } = await api.put(`/services/${TENANT}/${id}`, mapServiceToApi(input));
  // return mapServiceFromApi(data.data);
  throw new Error("Not implemented");
}

export async function deleteService(id: string): Promise<void> {
  if (USE_MOCK) {
    const all = await getServices();
    localStorage.setItem(`services_${TENANT}`, JSON.stringify(all.filter((s) => s.id !== id)));
    return;
  }
  // await api.delete(`/services/${TENANT}/${id}`);
  throw new Error("Not implemented");
}
