
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Phone } from "lucide-react";

interface HealthScreeningStopProps {
  stopType: "severeReaction" | "allergies" | "pregnancy" | "bloodThinners";
  selectedService: string;
  onBack: () => void;
}

const HealthScreeningStop: React.FC<HealthScreeningStopProps> = ({
  stopType,
  selectedService,
  onBack,
}) => {
  const getStopMessage = () => {
    switch (stopType) {
      case "severeReaction":
        return {
          title: "Medical Consultation Required",
          description: "Based on your history of severe vaccine reactions, you need to see your GP before vaccination.",
          action: "Please contact your GP to discuss vaccination options and safety precautions.",
          contact: "Your GP"
        };
      case "allergies":
        return {
          title: "Allergy Assessment Required",
          description: "Due to your serious allergies, you need specialist advice before vaccination.",
          action: "Please contact the immunization helpline for guidance on safe vaccination options.",
          contact: "0800 IMMUNE"
        };
      case "pregnancy":
        return {
          title: "Pregnancy Vaccination Guidance",
          description: `The ${getServiceName(selectedService)} vaccination requires GP consultation during pregnancy.`,
          action: "Please see your GP to discuss vaccination timing and safety during pregnancy.",
          contact: "Your GP"
        };
      case "bloodThinners":
        return {
          title: "Medical Review Required",
          description: "Your current condition requires medical review before vaccination.",
          action: "Please see your GP to ensure it's safe to proceed with vaccination.",
          contact: "Your GP"
        };
      default:
        return {
          title: "Medical Consultation Required",
          description: "Please consult with a healthcare professional before proceeding.",
          action: "Contact your GP for further guidance.",
          contact: "Your GP"
        };
    }
  };

  const getServiceName = (serviceId: string) => {
    const serviceMap: Record<string, string> = {
      "1": "Flu",
      "2": "COVID-19",
      "3": "Boostrix",
      "4": "Ear Piercing"
    };
    return serviceMap[serviceId] || "vaccination";
  };

  const stopMessage = getStopMessage();

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
            <CardTitle className="text-red-700">{stopMessage.title}</CardTitle>
          </div>
          <CardDescription className="text-red-600">
            {stopMessage.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <h4 className="font-semibold mb-2">Next Steps:</h4>
            <p className="mb-3">{stopMessage.action}</p>
            
            {stopType === "allergies" && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-md">
                <Phone className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-semibold text-blue-700">Immunization Helpline</p>
                  <p className="text-blue-600">0800 IMMUNE (0800 466 863)</p>
                </div>
              </div>
            )}
            
            {stopType !== "allergies" && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-md">
                <Phone className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-semibold text-green-700">Contact: {stopMessage.contact}</p>
                  <p className="text-green-600">Schedule an appointment to discuss vaccination options</p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button variant="outline" onClick={onBack} className="w-full">
              Back to Health Screening
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthScreeningStop;
