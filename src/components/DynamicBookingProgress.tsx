
import React from "react";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { CheckCircle, Circle } from "lucide-react";

interface DynamicBookingProgressProps {
  currentStep: number;
  totalSteps: number;
  serviceId: string;
}

const DynamicBookingProgress: React.FC<DynamicBookingProgressProps> = ({ 
  currentStep, 
  totalSteps, 
  serviceId
}) => {
  const isMobile = useIsMobile();
  
  // Step configuration based on total steps
  const getSteps = () => {
    if (totalSteps === 6) {
      // General services flow: Service -> Appointment -> Contact -> Review -> Complete
      return [
        { id: 0, label: "Service", description: "Choose your service" },
        { id: 1, label: "Appointment", description: "Select date & time" },
        { id: 2, label: "Contact", description: "Your details" },
        { id: 3, label: "Review", description: "Confirm details" },
        { id: 4, label: "Complete", description: "Booking confirmed" }
      ];
    } else {
      // Vaccination flow: Basic Info -> Privacy -> Service -> Appointment -> Contact -> Review -> Complete
      return [
        { id: 0, label: "Basic Info", description: "Who and age" },
        { id: 1, label: "Privacy", description: "Consent & privacy" },
        { id: 2, label: "Service", description: "Select vaccination" },
        { id: 3, label: "Appointment", description: "Choose date & time" },
        { id: 4, label: "Contact", description: "Your details" },
        { id: 5, label: "Review", description: "Confirm details" },
        { id: 6, label: "Complete", description: "Booking confirmed" }
      ];
    }
  };

  const steps = getSteps();
  const progressPercentage = currentStep >= 0 ? (currentStep / (steps.length - 1)) * 100 : 0;

  return (
    <div className="mb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {isMobile ? (
          // Enhanced mobile progress
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {steps[currentStep]?.label || "Loading..."}
                </div>
                <div className="text-xs text-gray-500">
                  {steps[currentStep]?.description || ""}
                </div>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-center text-xs text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
        ) : (
          // Enhanced desktop progress with breadcrumbs
          <div className="space-y-4">
            {/* Current step info */}
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {steps[currentStep]?.label || "Loading..."}
              </h2>
              <p className="text-sm text-gray-500">
                {steps[currentStep]?.description || ""}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="overflow-hidden h-2 mb-6 flex rounded bg-gray-200">
              <div
                style={{ width: `${progressPercentage}%` }}
                className="transition-all duration-500 flex flex-col justify-center rounded bg-primary"
              ></div>
            </div>

            {/* Step Indicators - Horizontal scrollable on smaller screens */}
            <div className="flex justify-between items-center overflow-x-auto pb-2">
              {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center min-w-0 flex-1 ${
                      index === 0 ? "items-start" : 
                      index === steps.length - 1 ? "items-end" : ""
                    }`}
                  >
                    <div
                      className={`rounded-full transition-all duration-300 flex items-center justify-center w-8 h-8 ${
                        isCompleted
                          ? "bg-primary text-white shadow-sm"
                          : isCurrent
                          ? "border-2 border-primary bg-white text-primary shadow-sm"
                          : "border bg-white text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : isCurrent ? (
                        <Circle className="w-4 h-4 fill-current" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`text-xs font-medium mt-2 text-center max-w-20 ${
                        isCompleted || isCurrent ? "text-primary" : "text-gray-400"
                      }`}
                    >
                      <div className="truncate">{step.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicBookingProgress;
