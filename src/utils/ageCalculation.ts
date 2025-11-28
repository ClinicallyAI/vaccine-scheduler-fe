export interface AgeCalculationResult {
  ageInYears: number;
  displayAge: string;
}

/**
 * Calculates the age from date of birth components and returns a formatted display string
 *
 * Business Rules:
 * - If child is more than 1 year old: show years (rounded down) e.g., "16 years old"
 * - If child is less than 1 year old but 12+ months: show months e.g., "11 months"
 * - If child is less than 12 months old: show months and weeks e.g., "3 months 2 weeks" or just "3 weeks old"
 * - If child is less than 4 weeks old: show weeks and days e.g., "2 weeks 3 days" or "5 days old"
 *
 * @param day - Day of birth (1-31)
 * @param month - Month of birth (1-12)
 * @param year - Year of birth
 * @returns Object containing ageInYears (number) and displayAge (formatted string)
 */
export function calculateAge(day: string, month: string, year: string): AgeCalculationResult {
  if (!day || !month || !year) {
    return { ageInYears: 0, displayAge: "" };
  }

  try {
    const dob = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();

    // Calculate total difference in milliseconds
    const diffMs = today.getTime() - dob.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Calculate age in years
    let ageInYears = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      ageInYears--;
    }

    // If 1 year or older, show years
    if (ageInYears >= 1) {
      return {
        ageInYears,
        displayAge: `${ageInYears} year${ageInYears === 1 ? "" : "s"} old`,
      };
    }

    // Calculate months
    const months = calculateMonthsDifference(dob, today);

    // If less than 4 weeks (28 days), show weeks and days
    if (diffDays < 28) {
      const weeks = Math.floor(diffDays / 7);
      const days = diffDays % 7;

      if (weeks === 0) {
        return {
          ageInYears: 0,
          displayAge: days === 1 ? "1 day old" : `${days} days old`,
        };
      }

      if (days === 0) {
        return {
          ageInYears: 0,
          displayAge: weeks === 1 ? "1 week old" : `${weeks} weeks old`,
        };
      }

      return {
        ageInYears: 0,
        displayAge: `${weeks} week${weeks === 1 ? "" : "s"} ${days} day${days === 1 ? "" : "s"} old`,
      };
    }

    // If less than 12 months, show months and weeks (or just weeks if less than 1 month)
    if (months < 12) {
      if (months === 0) {
        const weeks = Math.floor(diffDays / 7);
        return {
          ageInYears: 0,
          displayAge: weeks === 1 ? "1 week old" : `${weeks} weeks old`,
        };
      }

      // Calculate remaining weeks after accounting for full months
      const monthStart = new Date(today.getFullYear(), today.getMonth() - months, dob.getDate());
      const remainingDays = Math.floor((today.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(remainingDays / 7);

      if (weeks === 0) {
        return {
          ageInYears: 0,
          displayAge: months === 1 ? "1 month" : `${months} months`,
        };
      }

      return {
        ageInYears: 0,
        displayAge: `${months} month${months === 1 ? "" : "s"} ${weeks} week${weeks === 1 ? "" : "s"}`,
      };
    }

    // Fallback: should not reach here, but if months >= 12, show months
    return {
      ageInYears: 0,
      displayAge: `${months} months`,
    };
  } catch (error) {
    return { ageInYears: 0, displayAge: "" };
  }
}

/**
 * Helper function to calculate the difference in months between two dates
 */
function calculateMonthsDifference(startDate: Date, endDate: Date): number {
  let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
  months += endDate.getMonth() - startDate.getMonth();

  // If the day of the month hasn't been reached yet, subtract one month
  if (endDate.getDate() < startDate.getDate()) {
    months--;
  }

  return Math.max(0, months);
}

/**
 * Calculates age from a Date object
 *
 * @param dateOfBirth - Date of birth as a Date object
 * @returns Object containing ageInYears (number) and displayAge (formatted string)
 */
export function calculateAgeFromDate(dateOfBirth: Date): AgeCalculationResult {
  const day = dateOfBirth.getDate().toString();
  const month = (dateOfBirth.getMonth() + 1).toString();
  const year = dateOfBirth.getFullYear().toString();

  return calculateAge(day, month, year);
}
