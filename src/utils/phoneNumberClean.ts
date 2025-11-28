export const normalizePhone = (value: string): string => {
  if (!value) return "";

  // Remove everything except digits
  let digits = value.replace(/\D/g, "");

  // Handle leading 0 (e.g. 021234567)
  if (digits.startsWith("0")) {
    digits = digits.substring(1);
  }

  // Handle leading 64 (e.g. 6421234567)
  if (digits.startsWith("64")) {
    digits = digits.substring(2);
  }

  return `64${digits}`;
};

export const formatPhoneForDisplay = (value: string): string => {
  if (!value) return "";

  // Strip to digits
  let digits = value.replace(/\D/g, "");

  // Remove leading country code (64) if present
  if (digits.startsWith("64")) {
    digits = digits.substring(2);
  }

  // Add back leading 0
  digits = "0" + digits;

  // Fallback: just return with leading 0
  return digits;
};
