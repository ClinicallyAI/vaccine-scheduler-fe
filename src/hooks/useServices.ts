import { useState, useCallback, useEffect, useRef } from "react";
import api from "@/services/axios";
import { getAvailableVaccines, getTenantVaccines, type AvailableVaccine, type TenantVaccine } from "@/services/vaccineManagementApi";
import { Service } from "@/lib/types";
import { TENANT } from "@/services/auth";

// Shared cache across all hook instances to prevent duplicate fetches
let sharedCache: {
  services: Service[];
  availableVaccines: AvailableVaccine[];
  timestamp: number | null;
  fetchPromise: Promise<void> | null;
} = {
  services: [],
  availableVaccines: [],
  timestamp: null,
  fetchPromise: null,
};

const CACHE_DURATION = 30000; // 30 seconds cache

/**
 * Custom hook to fetch and combine services from multiple sources
 * - General services from /tenants/{id}/service endpoint (non-medical services)
 * - Vaccines from vaccine management API (medical services)
 *
 * This keeps endpoints separate while providing a unified service list
 */
export function useServices(autoFetch: boolean = false) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [availableVaccines, setAvailableVaccines] = useState<AvailableVaccine[]>([]);

  // Use ref to prevent duplicate fetches during concurrent calls
  const fetchInProgress = useRef(false);

  /**
   * Maps a service row from the backend to the Service type
   */
  const mapServiceRow = useCallback((row: any): Service => {
    // Handle multiple possible field names for staff assignments (snake_case and camelCase)
    const staffIds = row.staff_ids ?? row.staffIds ?? row.staffAssignments ?? row.staff_assignments ?? [];
    return {
      id: String(row.id),
      name: row.name,
      description: row.description ?? "",
      duration_minutes: row.duration_minutes ?? 15,
      price: row.price,
      price_is_varies: row.price_is_varies,
      is_active: !!row.is_active,
      is_medical: row.is_medical,
      staff_ids: Array.isArray(staffIds) ? staffIds.map(String) : [],
    };
  }, []);

  /**
   * Fetches services from all sources and combines them
   * - General services: from service endpoint
   * - Vaccines: from vaccine management API
   */
  const fetchServices = useCallback(async () => {
    // Check if we have a valid cache
    const now = Date.now();
    if (sharedCache.timestamp && now - sharedCache.timestamp < CACHE_DURATION) {
      setServices(sharedCache.services);
      setAvailableVaccines(sharedCache.availableVaccines);
      setHasFetched(true);
      return;
    }

    // If a fetch is already in progress (from another hook instance), wait for it
    if (sharedCache.fetchPromise) {
      setLoading(true);
      try {
        await sharedCache.fetchPromise;
        setServices(sharedCache.services);
        setAvailableVaccines(sharedCache.availableVaccines);
        setHasFetched(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load services"));
      } finally {
        setLoading(false);
      }
      return;
    }

    // Prevent duplicate concurrent fetches within this instance
    if (fetchInProgress.current) {
      return;
    }

    fetchInProgress.current = true;
    setLoading(true);
    setError(null);
    setHasFetched(true);

    // Create a promise for this fetch so other instances can wait
    const fetchPromise = (async () => {
      try {
        // For tenant 2, use the new vaccine structure
        if (TENANT === 2 || TENANT === 10) {
          const [availableVaccinesResult, tenantVaccinesResult, servicesResult] = await Promise.allSettled([
            getAvailableVaccines(TENANT),
            getTenantVaccines(TENANT),
            api.get(`/tenants/${TENANT}/service`),
          ]);

          // Extract available vaccines data
          let availableVaccinesData: AvailableVaccine[] = [];
          if (availableVaccinesResult.status === "fulfilled") {
            const result = availableVaccinesResult.value;
            if (Array.isArray(result)) {
              availableVaccinesData = result;
            } else if (result && typeof result === "object" && Array.isArray(result.data)) {
              availableVaccinesData = result.data;
            }
          }

          // Extract tenant vaccines data (for pricing, description, isActive)
          let tenantVaccinesData: TenantVaccine[] = [];
          if (tenantVaccinesResult.status === "fulfilled") {
            const result = tenantVaccinesResult.value;
            if (Array.isArray(result)) {
              tenantVaccinesData = result;
            } else if (result && typeof result === "object" && Array.isArray(result.data)) {
              tenantVaccinesData = result.data;
            }
          }

          // Create maps for quick lookups - use vaccineServiceId as key to match with availableVaccines
          const vaccineDataMap = new Map();
          tenantVaccinesData.forEach((vaccine: TenantVaccine) => {
            vaccineDataMap.set(vaccine.vaccineServiceId, vaccine);
          });

          // Extract service data - STRICTLY filter to only general services (non-medical)
          // The vaccine table is now the source of truth for all vaccine data
          const svcData = servicesResult.status === "fulfilled" ? servicesResult.value.data : null;
          const serviceRows = svcData?.data?.rows ?? [];

          // IMPORTANT: Only process general services (is_medical: false)
          // Vaccine data comes exclusively from the vaccine API
          const generalServices = serviceRows
            .filter((r: any) => r.is_medical === false) // Strict check for false only
            .map(mapServiceRow);

          // Get vaccine services from vaccine API
          // ALL vaccine data (including staff assignments) comes from vaccine tables
          const vaccineServices: Service[] = availableVaccinesData
            .filter((v: AvailableVaccine) => v.isLinked) // Only show vaccines linked to this tenant
            .map((v: AvailableVaccine) => {
              const tenantVaccineData = vaccineDataMap.get(v.id);

              // Handle multiple possible field names for staff assignments
              const staffIds = tenantVaccineData?.staffIds ?? tenantVaccineData?.staff_ids ?? tenantVaccineData?.staffAssignments ?? [];

              return {
                id: v.id,
                name: v.name,
                description: tenantVaccineData?.description ?? v.description,
                duration_minutes: v.durationMinutes,
                price: tenantVaccineData?.price ?? "0.00",
                price_is_varies: tenantVaccineData?.priceIsVaries ?? false,
                is_active: v.isActive,
                is_medical: true, // All vaccines are medical services
                // Staff assignments come from vaccine API (tenantVaccineData)
                staff_ids: Array.isArray(staffIds) ? staffIds.map(String) : [],
              };
            });

          // Combine general services and vaccines
          const combinedServices = [...generalServices, ...vaccineServices];

          // Update shared cache
          sharedCache.services = combinedServices;
          sharedCache.availableVaccines = availableVaccinesData;
          sharedCache.timestamp = Date.now();

          // Update local state
          setServices(combinedServices);
          setAvailableVaccines(availableVaccinesData);
        } else {
          // For other tenants, use the traditional service endpoint
          // STRICTLY filter to only general services (is_medical: false)
          const { data } = await api.get(`/tenants/${TENANT}/service`);
          const rows = data?.data?.rows ?? [];
          const generalServicesOnly = rows.filter((r: any) => r.is_medical === false);
          const servicesData = generalServicesOnly.map(mapServiceRow);

          // Update shared cache
          sharedCache.services = servicesData;
          sharedCache.timestamp = Date.now();

          // Update local state
          setServices(servicesData);
        }
      } catch (err) {
        throw err;
      }
    })();

    sharedCache.fetchPromise = fetchPromise;

    try {
      await fetchPromise;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load services"));
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
      sharedCache.fetchPromise = null;
    }
  }, [mapServiceRow]);

  /**
   * Filters services by medical category
   * @param isMedical - true for vaccines, false for general services
   */
  const getServicesByCategory = useCallback(
    (isMedical: boolean) => {
      return services.filter((service) => service.is_medical === isMedical);
    },
    [services]
  );

  /**
   * Gets all active services
   */
  const getActiveServices = useCallback(() => {
    return services.filter((service) => service.is_active);
  }, [services]);

  /**
   * Gets services assigned to a specific staff member
   */
  const getStaffServices = useCallback(
    (staffId: string) => {
      return services.filter((s) => (s.staff_ids ?? []).includes(staffId));
    },
    [services]
  );

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && !hasFetched) {
      fetchServices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, hasFetched]);

  /**
   * Clears the shared cache to force a fresh fetch on next call
   */
  const clearCache = useCallback(() => {
    sharedCache.services = [];
    sharedCache.availableVaccines = [];
    sharedCache.timestamp = null;
    sharedCache.fetchPromise = null;
  }, []);

  return {
    services,
    loading,
    error,
    availableVaccines,
    fetchServices,
    clearCache,
    getServicesByCategory,
    getActiveServices,
    getStaffServices,
  };
}
