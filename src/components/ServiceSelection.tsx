import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, DollarSign } from "lucide-react";
import { Service } from "@/lib/types";

interface ServiceSelectionProps {
  services: Service[];
  onSelectService: (serviceIds: string[]) => void;
  onPrevStep?: () => void;
  age?: number;
  serviceType: "vaccinations" | "general";
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({ services, onSelectService, onPrevStep, age = 0, serviceType }) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) => (prev.includes(serviceId) ? [] : [serviceId]));
  };

  const handleContinue = () => {
    if (selectedServices.length === 0) {
      alert("Please select at least one service");
      return;
    }
    onSelectService(selectedServices);
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{serviceType === "vaccinations" ? "Select Vaccinations" : "Select Services"}</CardTitle>
          <p className="text-gray-600">Choose the service you need</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <Card key={service.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Checkbox
                        id={service.id}
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={() => handleServiceToggle(service.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor={service.id} className="cursor-pointer">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{service.name}</h3>
                            {service.price && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                {service.price_is_varies ? "Varies" : Number(service.price) === 0 ? "Free" : `$${service.price}`}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{service.description}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {service.duration_minutes} minutes
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-between pt-6">
            {onPrevStep && (
              <Button variant="outline" onClick={onPrevStep} className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <Button onClick={handleContinue} className="ml-auto" size="lg" disabled={selectedServices.length === 0}>
              Continue ({selectedServices.length} selected)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceSelection;
