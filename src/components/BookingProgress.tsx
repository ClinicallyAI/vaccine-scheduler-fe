
import React from "react";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";

interface BookingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const BookingProgress: React.FC<BookingProgressProps> = ({ currentStep, totalSteps }) => {
  const isMobile = useIsMobile();
  const progressPercentage = (currentStep / (totalSteps - 1)) * 100;

  const stepLabels = [
    "Services",
    "Personal Info",
    "Health Screening",
    "Service Screening",
    "Appointment",
    "Confirmation"
  ];

  return (
    <div className="mb-8 px-4">
      <div className="max-w-3xl mx-auto">
        {isMobile ? (
          // Simple progress bar only for mobile
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-3" />
            <div className="text-center text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </div>
          </div>
        ) : (
          // Full progress indicator with labels for desktop
          <div className="relative">
            {/* Progress Bar */}
            <div className="overflow-hidden h-2 mb-6 flex rounded bg-gray-200">
              <div
                style={{ width: `${progressPercentage}%` }}
                className="transition-all duration-500 flex flex-col justify-center rounded bg-primary"
              ></div>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col items-center ${
                    index === 0 ? "items-start" : index === totalSteps - 1 ? "items-end" : ""
                  }`}
                >
                  <div
                    className={`rounded-full transition-colors flex items-center justify-center w-8 h-8 ${
                      index < currentStep
                        ? "bg-primary text-white"
                        : index === currentStep
                        ? "border-2 border-primary bg-white text-primary"
                        : "border bg-white text-gray-400"
                    }`}
                  >
                    {index < currentStep ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div
                    className={`text-xs font-medium mt-2 ${
                      index <= currentStep ? "text-primary" : "text-gray-400"
                    }`}
                  >
                    {stepLabels[index]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingProgress;
