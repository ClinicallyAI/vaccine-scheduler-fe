import { format, getHours, getMinutes, getDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import {
  NZ_TIMEZONE,
  BLOCKED_NZ_DATES,
  HOLIDAY_OPEN_WINDOWS,
  TENANT_IDS,
  TENANT_4_SATURDAY_ALLOWED_SERVICE_IDS
} from "@/constants";

const NZ_TZ = NZ_TIMEZONE;
const BLOCKED_NZ_DATES_SET = new Set<string>(BLOCKED_NZ_DATES);

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
      const start = toZonedTime(new Date(ts.startTime), NZ_TZ);
      const nzDate = format(start, 'yyyy-MM-dd'); // "YYYY-MM-DD"
      const minutes = getHours(start) * 60 + getMinutes(start);

      // --- Holiday rules (apply to ALL tenants first) ---
      if (nzDate && BLOCKED_NZ_DATES_SET.has(nzDate)) {
        const allowed = HOLIDAY_OPEN_WINDOWS[nzDate]?.[tid] ?? [];
        // If tenant has no special window, or slot isn't inside a window -> unavailable
        if (allowed.length === 0 || !inAnyWindow(minutes, allowed)) {
          return { ...ts, available: false };
        }
        // else: inside an allowed window — leave as-is and continue to tenant-specific rules below
      }

      // --- Existing rules ---
      // Convert date-fns getDay (0=Sun, 6=Sat) to luxon weekday format (1=Mon, 7=Sun)
      const weekday = getDay(start) === 0 ? 7 : getDay(start);
      const isWeekday = weekday >= 1 && weekday <= 5;

      // Rule 1: Tenant 4 (Unichem Milford) → make 12:00–12:59 unavailable Mon–Fri
      if (tid === TENANT_IDS.UNICHEM_MILFORD) {
        const inLunchWindow = isWeekday && minutes >= 12 * 60 && minutes < 13 * 60;
        if (inLunchWindow) {
          return { ...ts, available: false };
        }

        // Rule 2: If serviceId NOT in allowed list → make Saturday unavailable
        if (!TENANT_4_SATURDAY_ALLOWED_SERVICE_IDS.includes(Number(serviceId)) && weekday === 6) {
          return { ...ts, available: false };
        }
      }

      return ts;
    }),
  }));
}
