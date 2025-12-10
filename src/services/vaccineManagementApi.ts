import api from "./axios";

export type AvailableVaccine = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  isMedical: boolean;
  serviceType: string;
  isLinked: boolean;
  isActive: boolean;
  hasStaffAssigned: boolean;
};

export type TenantVaccine = {
  id: string;
  vaccineServiceId: string; // Links to the shared vaccine service ID
  name: string;
  description: string;
  durationMinutes: number;
  isMedical: boolean;
  serviceType: string;
  price: string;
  priceIsVaries: boolean;
  isActive: boolean;
  staffIds: string[];
};

export type AddVaccineRequest = {
  vaccineServiceId: string;
  price?: string;
  priceIsVaries?: boolean;
  customDescription?: string | null;
};

export type UpdateVaccineRequest = {
  price?: string;
  priceIsVaries?: boolean;
  customDescription?: string | null;
  isActive?: boolean;
  staffIds?: string[];
};

/**
 * Get all available shared vaccines for a tenant
 */
export async function getAvailableVaccines(tenantId: string): Promise<AvailableVaccine[]> {
  const { data } = await api.get(`/${tenantId}/vaccines/available`);
  return data;
}

/**
 * Get all active vaccines for a tenant
 */
export async function getTenantVaccines(tenantId: string): Promise<TenantVaccine[]> {
  const { data } = await api.get(`/${tenantId}/vaccines`);

  // Transform response to handle both snake_case and camelCase
  if (Array.isArray(data)) {
    return data.map((vaccine: any) => {
      // Handle staff IDs - could be staffIds, staff_ids, or nested field
      const rawStaffIds = vaccine.staffIds ?? vaccine.staff_ids ?? [];
      const staffIds = Array.isArray(rawStaffIds) ? rawStaffIds.map(String) : [];

      return {
        id: vaccine.id,
        vaccineServiceId: vaccine.vaccineServiceId ?? vaccine.vaccine_service_id,
        name: vaccine.name,
        description: vaccine.description,
        durationMinutes: vaccine.durationMinutes ?? vaccine.duration_minutes ?? 15,
        isMedical: vaccine.isMedical ?? vaccine.is_medical ?? true,
        serviceType: vaccine.serviceType ?? vaccine.service_type ?? 'vaccination',
        price: vaccine.price ?? '0.00',
        priceIsVaries: vaccine.priceIsVaries ?? vaccine.price_is_varies ?? false,
        isActive: vaccine.isActive ?? vaccine.is_active ?? true,
        staffIds: staffIds,
      };
    });
  }

  return data;
}

/**
 * Add a vaccine from shared pool to tenant's offerings
 */
export async function addVaccineToTenant(
  tenantId: string,
  request: AddVaccineRequest
): Promise<any> {
  const { data } = await api.post(`/${tenantId}/vaccines`, request);
  return data;
}

/**
 * Update a tenant's vaccine information
 */
export async function updateTenantVaccine(
  tenantId: string,
  vaccineServiceId: string,
  request: UpdateVaccineRequest
): Promise<any> {
  const { data } = await api.put(`/${tenantId}/vaccines/${vaccineServiceId}`, request);
  return data;
}

/**
 * Deactivate a vaccine from tenant's offerings
 */
export async function removeVaccineFromTenant(
  tenantId: string,
  vaccineServiceId: string
): Promise<any> {
  const { data } = await api.delete(`/${tenantId}/vaccines/${vaccineServiceId}`);
  return data;
}
