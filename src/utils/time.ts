export const formatNZTime = (date: Date | string): string => {
  return new Intl.DateTimeFormat("en-NZ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Pacific/Auckland",
  }).format(typeof date === "string" ? new Date(date) : date);
};

export const formatNZDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat("en-NZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Pacific/Auckland",
  }).format(typeof date === "string" ? new Date(date) : date);
};
