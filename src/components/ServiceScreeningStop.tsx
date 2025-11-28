import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Phone } from "lucide-react";

interface ServiceScreeningStopProps {
  stopType: "covid19Myocarditis";
  onBack: () => void;
}

const ServiceScreeningStop: React.FC<ServiceScreeningStopProps> = ({ stopType, onBack }) => {
  const getStopMessage = () => {
    switch (stopType) {
      case "covid19Myocarditis":
        return {
          title: "Medical Consultation Required",
          description: "Due to your history of myocarditis or pericarditis, you need medical advice before COVID-19 vaccination.",
          action: "Please contact one of the following for guidance:",
          contacts: [
            {
              name: "Immunization Helpline",
              phone: "0800 IMMUNE (0800 466 863)",
              color: "blue",
            },
            {
              name: "Your GP",
              phone: "Schedule an appointment to discuss vaccination options",
              color: "green",
            },
          ],
        };
      default:
        return {
          title: "Medical Consultation Required",
          description: "Please consult with a healthcare professional before proceeding.",
          action: "Contact a healthcare provider for further guidance.",
          contacts: [],
        };
    }
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
          <CardDescription className="text-red-600">{stopMessage.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <h4 className="font-semibold mb-3">{stopMessage.action}</h4>

            <div className="space-y-3">
              {stopMessage.contacts.map((contact, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 p-3 rounded-md ${contact.color === "blue" ? "bg-blue-50" : "bg-green-50"}`}
                >
                  <Phone className={`h-5 w-5 ${contact.color === "blue" ? "text-blue-500" : "text-green-500"}`} />
                  <div>
                    <p className={`font-semibold ${contact.color === "blue" ? "text-blue-700" : "text-green-700"}`}>{contact.name}</p>
                    <p className={`${contact.color === "blue" ? "text-blue-600" : "text-green-600"}`}>{contact.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button variant="outline" onClick={onBack} className="w-full">
              Back to Service Questions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceScreeningStop;
