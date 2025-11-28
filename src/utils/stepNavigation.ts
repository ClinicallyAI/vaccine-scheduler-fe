
/**
 * Utility functions for handling multi-step form navigation
 */

/**
 * Calculate the next step based on current step and service type
 * @param currentStep - Current step number
 * @param serviceId - Selected service ID
 * @param totalSteps - Total number of steps
 * @returns Next step number
 */
export const calculateNextStep = (currentStep: number, serviceId: string, totalSteps: number): number => {
  // Special handling for ear piercing - skip health and service screening
  if (serviceId === "4" && currentStep === 1) {
    return 4; // Jump directly to appointment booking
  }
  
  return Math.min(currentStep + 1, totalSteps - 1);
};

/**
 * Calculate the previous step based on current step and service type
 * @param currentStep - Current step number
 * @param serviceId - Selected service ID
 * @returns Previous step number
 */
export const calculatePreviousStep = (currentStep: number, serviceId: string): number => {
  // Special handling for ear piercing - skip back to personal info from appointment
  if (serviceId === "4" && currentStep === 4) {
    return 1; // Jump back to personal info
  }
  
  return Math.max(currentStep - 1, 0);
};

/**
 * Check if a step should be skipped for the given service
 * @param step - Step number to check
 * @param serviceId - Selected service ID
 * @returns true if step should be skipped, false otherwise
 */
export const shouldSkipStep = (step: number, serviceId: string): boolean => {
  // Ear piercing skips health screening (step 2) and service screening (step 3)
  if (serviceId === "4" && (step === 2 || step === 3)) {
    return true;
  }
  
  return false;
};
