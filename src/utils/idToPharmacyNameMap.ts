// map.ts

// name → id
export const pharmacyNameToId: Record<string, string> = {
  "1": "1",
  demo: "2",
  "vercoe-road-pharmacy": "3",
  "unichem-milford": "4",
  "devonport-7-day": "5",
  "mangawhai-pharmacy": "6",
  "unichem-russell-street": "7",
  "unichem-putaruru": "8",
  "gilmours-pharmacy-havelock-north": "9",
};

// id → name (reverse map)
export const pharmacyIdToName: Record<string, string> = Object.fromEntries(
  Object.entries(pharmacyNameToId).map(([name, id]) => [id, name])
);

// Helpers
export function getPharmacyId(name: string): string | undefined {
  return pharmacyNameToId[name];
}

export function getPharmacyName(id: string): string | undefined {
  return pharmacyIdToName[id];
}
