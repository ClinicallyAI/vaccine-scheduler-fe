/**
 * Application-wide constants
 */

// ========================================
// Service IDs
// ========================================
export const SERVICE_IDS = {
  FLU: "1",
  COVID: "2",
  HPV: "3",
  EAR_PIERCING: "4",
  MMR: "5",
  SHINGLES: "6",
  CHILDHOOD: "7",
  BOOSTRIX: "8",
  MENINGOCOCCAL: "9",
  PASSPORT_PHOTO: "10",
} as const;

// Array of all service IDs
export const ALL_SERVICE_IDS = Object.values(SERVICE_IDS);

// Service groups
export const VACCINATION_SERVICE_IDS = [
  SERVICE_IDS.FLU,
  SERVICE_IDS.COVID,
  SERVICE_IDS.HPV,
  SERVICE_IDS.MMR,
  SERVICE_IDS.SHINGLES,
  SERVICE_IDS.CHILDHOOD,
  SERVICE_IDS.BOOSTRIX,
  SERVICE_IDS.MENINGOCOCCAL,
] as const;

export const GENERAL_SERVICE_IDS = [
  SERVICE_IDS.EAR_PIERCING,
  SERVICE_IDS.PASSPORT_PHOTO,
] as const;

// Multiple vaccine service IDs (flu + covid combo)
export const MULTIPLE_VACCINE_SERVICE_IDS = [
  SERVICE_IDS.FLU,
  SERVICE_IDS.COVID,
] as const;

// ========================================
// Tenant/Pharmacy IDs
// ========================================
export const TENANT_IDS = {
  VERCOE_ROAD: 3,
  UNICHEM_MILFORD: 4,
  DEVONPORT_7_DAY: 5,
  MANGAWHAI: 6,
  UNICHEM_RUSSELL_STREET: 7,
  UNICHEM_PUTARURU: 8,
  GILMOURS_HAVELOCK_NORTH: 9,
} as const;

// ========================================
// Record/Reminder Statuses
// ========================================
export const RECORD_STATUSES = {
  REMINDER_SCHEDULED: "Reminder Scheduled",
  SENT: "Sent",
  OVERDUE: "Overdue",
  BOOKED: "Booked",
  COMPLETED: "Completed",
  DID_NOT_ATTEND: "Did not Attend",
  WALK_IN: "Walk-in",
} as const;

export type RecordStatus = typeof RECORD_STATUSES[keyof typeof RECORD_STATUSES];

export const ALL_RECORD_STATUSES = Object.values(RECORD_STATUSES);

// ========================================
// Timezone
// ========================================
export const NZ_TIMEZONE = "Pacific/Auckland";

// ========================================
// Service-specific rules
// ========================================
// Service IDs that are allowed on Saturdays for Tenant 4 (Unichem Milford)
export const TENANT_4_SATURDAY_ALLOWED_SERVICE_IDS = [150, 152, 153, 154, 155, 156, 157] as const;

// ========================================
// Holidays (NZ Public Holidays)
// ========================================
export const BLOCKED_NZ_DATES = [
  "2025-10-27", // Labour Day
  "2025-12-25", // Christmas Day
  "2026-01-01", // New Year's Day
  "2026-01-02", // Day after New Year's
] as const;

// Holiday opening windows per tenant
export const HOLIDAY_OPEN_WINDOWS: Record<string, Record<number, [string, string][]>> = {
  // Labour Day
  "2025-10-27": {
    [TENANT_IDS.DEVONPORT_7_DAY]: [["10:00", "16:00"]],
    [TENANT_IDS.UNICHEM_RUSSELL_STREET]: [["09:00", "15:00"]],
  },
  // Christmas & New Year
  "2025-12-25": {
    [TENANT_IDS.UNICHEM_RUSSELL_STREET]: [["09:00", "15:00"]],
  },
  "2026-01-01": {
    [TENANT_IDS.UNICHEM_RUSSELL_STREET]: [["09:00", "15:00"]],
  },
  "2026-01-02": {
    [TENANT_IDS.UNICHEM_RUSSELL_STREET]: [["09:00", "15:00"]],
  },
} as const;
