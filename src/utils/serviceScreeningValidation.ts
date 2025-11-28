
import { Service } from "@/lib/types";
import * as z from "zod";

/**
 * Utility functions for service screening validation
 */

/**
 * Create dynamic schema based on service screening questions
 * @param service - Service object containing screening questions
 * @returns Zod schema for service screening validation
 */
export const createServiceScreeningSchema = (service: Service) => {
  const schemaObj: Record<string, any> = {};
  
  service.screeningQuestions.forEach((q) => {
    if (q.type === "radio") {
      schemaObj[q.id] = z.string({
        required_error: "Please answer this question",
      });
    } else if (q.type === "text") {
      schemaObj[q.id] = z.string().min(1, "Please provide an answer");
    } else if (q.type === "checkbox") {
      schemaObj[q.id] = z.boolean();
    }
  });
  
  return z.object(schemaObj);
};

/**
 * Check for COVID-19 myocarditis stop condition
 * @param serviceId - Selected service ID
 * @param service - Service object
 * @param formData - Form submission data
 * @returns true if should stop for myocarditis, false otherwise
 */
export const checkMyocarditisStopCondition = (
  serviceId: string, 
  service: Service, 
  formData: Record<string, any>
): boolean => {
  // Only check for COVID-19 vaccination
  if (serviceId !== "2") return false;
  
  const myocarditisQuestion = service.screeningQuestions.find(q => 
    q.question.toLowerCase().includes("myocarditis") || 
    q.question.toLowerCase().includes("pericarditis")
  );
  
  return myocarditisQuestion && formData[myocarditisQuestion.id] === "Yes";
};
