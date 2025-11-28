import { DateTime } from "luxon";

const NZ_TZ = "Pacific/Auckland";

/** Dates that are closed for everyone by default (NZ time) */
const BLOCKED_NZ_DATES = new Set<string>([
  "2025-10-27", // Labour Day
  "2025-12-25", // Christmas Day
  "2026-01-01", // New Year's Day
  "2026-01-02", // Day after New Year's
]);

/**
 * Holiday exceptions: per date -> per tenantId -> allowed time windows (NZ local).
 * Times are [start, end) in 24h "HH:mm".
 *
 * Mappings provided:
 *  "vercoe-road-pharmacy": 3,
 *  "unichem-milford": 4,
 *  "devonport-7-day": 5,
 *  "mangawhai-pharmacy": 6,
 *  "unichem-russell-street": 7,
 *  "unichem-putaruru": 8,
 *  "gilmours-pharmacy-havelock-north": 9,
 */
const HOLIDAY_OPEN_WINDOWS: Record<string, Record<number, [string, string][]>> = {
  // Labour Day
  "2025-10-27": {
    5: [["10:00", "16:00"]], // Devonport 7 Day
    7: [["09:00", "15:00"]], // Unichem Russell Street
  },
  // Christmas & New Year
  "2025-12-25": { 7: [["09:00", "15:00"]] },
  "2026-01-01": { 7: [["09:00", "15:00"]] },
  "2026-01-02": { 7: [["09:00", "15:00"]] },
};

function inAnyWindow(minutes: number, windows: [string, string][]): boolean {
  return windows.some(([from, to]) => {
    const [fh, fm] = from.split(":").map(Number);
    const [th, tm] = to.split(":").map(Number);
    const startM = fh * 60 + fm;
    const endM = th * 60 + tm;
    return minutes >= startM && minutes < endM;
  });
}

export function flagLunchAsUnavailable(availability, tenantId, serviceId) {
  const tid = Number(tenantId);

  return availability.map((day) => ({
    ...day,
    timeSlots: day.timeSlots.map((ts) => {
      const start = DateTime.fromISO(ts.startTime).setZone(NZ_TZ);
      const nzDate = start.toISODate(); // "YYYY-MM-DD"
      const minutes = start.hour * 60 + start.minute;

      // --- Holiday rules (apply to ALL tenants first) ---
      if (nzDate && BLOCKED_NZ_DATES.has(nzDate)) {
        const allowed = HOLIDAY_OPEN_WINDOWS[nzDate]?.[tid] ?? [];
        // If tenant has no special window, or slot isn't inside a window -> unavailable
        if (allowed.length === 0 || !inAnyWindow(minutes, allowed)) {
          return { ...ts, available: false };
        }
        // else: inside an allowed window — leave as-is and continue to tenant-specific rules below
      }

      // --- Existing rules ---
      const isWeekday = start.weekday >= 1 && start.weekday <= 5;

      // Rule 1: Tenant 4 → make 12:00–12:59 unavailable Mon–Fri
      if (tid === 4) {
        const inLunchWindow = isWeekday && minutes >= 12 * 60 && minutes < 13 * 60;
        if (inLunchWindow) {
          return { ...ts, available: false };
        }

        // Rule 2: If serviceId NOT in list → make Saturday unavailable
        if (![150, 152, 153, 154, 155, 156, 157].includes(Number(serviceId)) && start.weekday === 6) {
          return { ...ts, available: false };
        }
      }

      return ts;
    }),
  }));
}
