import React from "react";
import { Service } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, ShieldCheck, Zap, FileText, Calendar } from "lucide-react";

interface EnhancedServiceSelectionProps {
  services: Service[];
  onSelectService: (serviceId: string) => void;
}

const EnhancedServiceSelection: React.FC<EnhancedServiceSelectionProps> = ({ services, onSelectService }) => {
  // Get service category and workflow info
  const getServiceInfo = (serviceId: string) => {
    switch (serviceId) {
      case "1": // Flu
        return {
          category: "Vaccine",
          categoryIcon: ShieldCheck,
          steps: 7,
          estimatedTime: "15-20 min",
          features: ["Health screening", "Work voucher option", "Quick booking"],
          popular: true,
        };
      case "2": // COVID
        return {
          category: "Vaccine",
          categoryIcon: ShieldCheck,
          steps: 6,
          estimatedTime: "10-15 min",
          features: ["Health screening", "Fast-track available", "Same-day booking"],
          popular: true,
        };
      case "4": // Ear piercing
        return {
          category: "Procedure",
          categoryIcon: Zap,
          steps: 4,
          estimatedTime: "5-10 min",
          features: ["No health screening", "Express booking", "Instant confirmation"],
          popular: false,
        };
      default:
        return {
          category: "Service",
          categoryIcon: FileText,
          steps: 5,
          estimatedTime: "10-15 min",
          features: ["Standard booking process"],
          popular: false,
        };
    }
  };

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const info = getServiceInfo(service.id);
    if (!acc[info.category]) {
      acc[info.category] = [];
    }
    acc[info.category].push({ ...service, ...info });
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Select a Service</h2>
        <p className="text-gray-600 text-lg">Choose from our available services below</p>
      </div>

      {Object.entries(groupedServices).map(([category, categoryServices]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-gray-800">{category}s</h3>
            <Badge variant="outline" className="text-xs">
              {categoryServices.length} available
            </Badge>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {categoryServices.map((service) => {
              const IconComponent = service.categoryIcon;

              return (
                <Card
                  key={service.id}
                  className="border border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300 relative group"
                >
                  {service.popular && <Badge className="absolute -top-2 -right-2 z-10 bg-primary">Popular</Badge>}

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-primary" />
                        <Badge variant="outline" className="text-xs">
                          {service.category}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{service.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Service details */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{service.duration} minutes</span>
                      </div>
                      {typeof service.price === "number" && (
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span className="font-medium">{service.price === 0 ? "Free" : `$${service.price.toFixed(2)}`}</span>
                        </div>
                      )}
                    </div>

                    {/* Workflow preview */}
                    <div className="bg-gray-50 rounded-md p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span className="font-medium">Booking Process:</span>
                        <span>{service.estimatedTime}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{service.steps} steps to complete</span>
                      </div>
                    </div>

                    {/* Key features */}
                    <div className="space-y-1">
                      {service.features.slice(0, 2).map((feature, index) => (
                        <div key={index} className="flex items-center text-xs text-gray-600">
                          <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                      {service.features.length > 2 && (
                        <div className="text-xs text-gray-500">+{service.features.length - 2} more features</div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button
                      onClick={() => onSelectService(service.id)}
                      className="w-full group-hover:shadow-md transition-shadow"
                      size="lg"
                    >
                      Book Now
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Help text */}
      <div className="text-center mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Need help choosing?</strong> All our services are performed by qualified professionals. Contact us if you have questions
          about which service is right for you.
        </p>
      </div>
    </div>
  );
};

export default EnhancedServiceSelection;
