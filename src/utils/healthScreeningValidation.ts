
/**
 * Utility functions for health screening validation and logic
 */

/**
 * Check if selected conditions should stop the booking process
 * @param selectedConditions - Array of selected health condition IDs
 * @returns Stop type if booking should be stopped, null otherwise
 */
export const checkStopConditions = (selectedConditions: string[]): "severeReaction" | "allergies" | null => {
  if (selectedConditions.includes("severeReaction")) {
    return "severeReaction";
  }
  
  if (selectedConditions.includes("allergies")) {
    return "allergies";
  }
  
  return null;
};

/**
 * Check if pregnancy condition conflicts with selected service
 * @param selectedConditions - Array of selected health condition IDs
 * @param serviceId - Selected service ID
 * @returns true if pregnancy conflicts with service, false otherwise
 */
export const checkPregnancyConflict = (selectedConditions: string[], serviceId: string): boolean => {
  if (!selectedConditions.includes("pregnant")) {
    return false;
  }
  
  // Only Flu and COVID-19 allowed during pregnancy
  const allowedServices = ["1", "2"];
  return !allowedServices.includes(serviceId);
};

/**
 * Build the follow-up queue based on selected conditions
 * @param selectedConditions - Array of selected health condition IDs
 * @returns Array of follow-up types to process
 */
export const buildFollowUpQueue = (selectedConditions: string[]): ("vaccination4Weeks" | "bloodThinners")[] => {
  const queue: ("vaccination4Weeks" | "bloodThinners")[] = [];
  
  // Blood thinners should be handled first as it might lead to a stop condition
  if (selectedConditions.includes("bloodThinners")) {
    queue.push("bloodThinners");
  }
  
  if (selectedConditions.includes("vaccination4Weeks")) {
    queue.push("vaccination4Weeks");
  }
  
  return queue;
};

/**
 * Process health screening form data and create standardized results
 * @param selectedConditions - Array of selected condition IDs
 * @param allConditions - All available health screening questions
 * @returns Processed health screening data
 */
export const processHealthScreeningData = (
  selectedConditions: string[], 
  allConditions: any[]
): Record<string, boolean | string> => {
  const healthScreening: Record<string, boolean | string> = {};
  
  // Process all health conditions
  allConditions.forEach(condition => {
    healthScreening[condition.id] = selectedConditions.includes(condition.id);
  });

  // Store screening results in a standardized format for confirmation pages
  const screeningResults = {
    selectedConditions,
    allConditions,
    noneSelected: selectedConditions.includes("none")
  };
  healthScreening.screeningResults = JSON.stringify(screeningResults);
  
  return healthScreening;
};
