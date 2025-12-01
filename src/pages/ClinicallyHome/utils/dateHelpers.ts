export function formatDateForDisplay(dob: Date | null | undefined): string {
  if (!dob) return "N/A";
  const date = new Date(dob);
  return new Intl.DateTimeFormat("en-NZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function toDateInputValue(iso?: string | null): string {
  if (!iso) return "";
  return iso.length >= 10 ? iso.slice(0, 10) : "";
}

export function fromDateInputValue(v?: string | null): string | null {
  if (!v || !v.trim()) return null;
  return v;
}

export function nzDateDisplay(iso?: string | null, type = "short"): string {
  if (!iso) return "-";
  try {
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

export function nzTimeRange(input?: string | null, durationMinutes = 15): string {
  if (!input) return "-";

  try {
    const start = new Date(input);
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

export function getNZTodayISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Pacific/Auckland",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function nzDayKey(input?: string | null): string | null {
  if (!input) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;

  try {
    const d = new Date(input);
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
