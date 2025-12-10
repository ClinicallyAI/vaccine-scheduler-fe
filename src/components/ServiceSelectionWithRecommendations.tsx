import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ArrowLeft, Clock, DollarSign, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Service } from "@/lib/types";
import { getVaccineRecommendations, RecommendedService } from "@/services/vaccineRecommendationsApi";
import { toast } from "sonner";

interface ServiceSelectionWithRecommendationsProps {
  services: Service[];
  onSelectService: (serviceIds: string[]) => void;
  onPrevStep?: () => void;
  dateOfBirth: Date | null;
  isPregnant: boolean;
  serviceType: "vaccinations" | "general";
  tenantId: string | number;
}

const ServiceSelectionWithRecommendations: React.FC<ServiceSelectionWithRecommendationsProps> = ({
  services,
  onSelectService,
  onPrevStep,
  dateOfBirth,
  isPregnant,
  serviceType,
  tenantId,
}) => {
  // Calculate age from dateOfBirth for UI display
  const calculateAge = (dob: Date | null): number => {
    if (!dob) return 0;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Return fractional age for infants
    if (age === 0) {
      const months = monthDiff < 0 ? 12 + monthDiff : monthDiff;
      return months / 12;
    }

    return age;
  };

  const age = calculateAge(dateOfBirth);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showOtherServices, setShowOtherServices] = useState(false);
  const [recommended, setRecommended] = useState<RecommendedService[]>([]);
  const [others, setOthers] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiDataLoaded, setApiDataLoaded] = useState(false); // Track if we've loaded API data for pharmacy 2

  // Defensive: ensure recommended and others are always arrays
  const safeRecommended = Array.isArray(recommended) ? recommended : [];
  const safeOthers = Array.isArray(others) ? others : [];

  // Fetch recommendations
  useEffect(() => {
    async function fetchRecommendations() {
      // Reset API loaded flag when key parameters change
      setApiDataLoaded(false);

      // For non-vaccination services, don't fetch recommendations
      if (serviceType !== "vaccinations") {
        setRecommended([]);
        setOthers(services);
        return;
      }

      // If no date of birth, can't get recommendations
      if (!dateOfBirth) {
        setRecommended([]);
        setOthers(services);
        return;
      }

      // Only use vaccine recommendations for tenantId "2"
      // For other tenants, call the endpoint but don't use the response
      if (!["10", "2"].includes(String(tenantId))) {
        // Still call the endpoint for tracking/testing purposes
        try {
          await getVaccineRecommendations(String(tenantId), dateOfBirth, isPregnant);
        } catch (error) {
          // Silently ignore error for non-pharmacy-2 tenants
        }
        // Use default behavior - no recommendations, all services shown
        setRecommended([]);
        setOthers(services);
        return;
      }

      // For pharmacy ID 2: Use the API recommendations
      setLoading(true);
      try {
        const result = await getVaccineRecommendations(String(tenantId), dateOfBirth, isPregnant);

        // Ensure we have arrays even if the API returns unexpected data
        const recommendedServices = Array.isArray(result?.recommended) ? result.recommended : [];
        const otherServices = Array.isArray(result?.others) ? result.others : [];

        setRecommended(recommendedServices);
        setOthers(otherServices);
        setApiDataLoaded(true); // Mark that we've successfully loaded API data
      } catch (error) {
        toast.error("Failed to load vaccine recommendations. Using default services.");
        setRecommended([]);
        setOthers(services);
        setApiDataLoaded(false);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [dateOfBirth, isPregnant, serviceType, tenantId]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) => (prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]));
  };

  const handleContinue = () => {
    if (selectedServices.length === 0) {
      alert("Please select at least one service");
      return;
    }
    onSelectService(selectedServices);
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "funded":
        return "default";
      case "fees_apply":
        return "secondary";
      case "eligibility_confirmed":
        return "outline";
      default:
        return "outline";
    }
  };

  const getBadgeText = (status: string) => {
    switch (status) {
      case "funded":
        return "Funded";
      case "fees_apply":
        return "Fees apply";
      case "eligibility_confirmed":
        return "Eligibility to be confirmed";
      default:
        return "";
    }
  };

  const shouldShowPrice = (status?: string) => {
    return status === "fees_apply";
  };

  const renderServiceCardWithOutRecommendation = (service: RecommendedService | Service, showBadge: boolean) => {
    return (
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
    );
  };

  const renderServiceCard = (service: RecommendedService | Service, showBadge: boolean) => {
    const recommendationStatus = "recommendationStatus" in service ? service.recommendationStatus : undefined;

    return (
      <Card
        key={service.id}
        className="border border-border hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer"
      >
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
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <h3 className="text-lg font-semibold text-foreground">{service.name}</h3>
                    {showBadge &&
                      recommendationStatus &&
                      (recommendationStatus === "eligibility_confirmed" ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-block cursor-help">
                              <Badge variant={getBadgeVariant(recommendationStatus)}>{getBadgeText(recommendationStatus)}</Badge>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>
                              You meet the age criteria. Your vaccinator will confirm clinical and funding eligibility at your appointment.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Badge variant={getBadgeVariant(recommendationStatus)}>{getBadgeText(recommendationStatus)}</Badge>
                      ))}
                  </div>
                  <p className="text-muted-foreground mb-2">{service.description}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration_minutes} minutes
                    </div>
                    {shouldShowPrice(recommendationStatus) && (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {service.price ? `$${service.price}` : "Price varies"}
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{serviceType === "vaccinations" ? "Select Vaccinations" : "Select Services"}</CardTitle>
        </CardHeader>
        <CardContent>
          {(tenantId === 2 || tenantId === 10) &&
            (serviceType === "vaccinations" ? (
              <>
                {/* Empty State - No Recommendations */}
                {safeRecommended.length === 0 && (
                  <div className="mb-6 p-6 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/30">
                    <div className="text-center space-y-3">
                      <div className="flex justify-center">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <Info className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">No vaccinations recommended at this time</h3>
                      <p className="text-sm text-muted-foreground">
                        {age < 0.115
                          ? "Infants under 6 weeks should consult with their healthcare provider."
                          : "Based on your information, we don't have specific recommendations. You can still select from all available services below."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Recommended Section */}
                {safeRecommended.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Recommendations</h3>
                    <p className="text-sm text-foreground/70 mb-4" role="note">
                      Based on age and pregnancy status. Your vaccinating pharmacist will determine the final clinical and funding
                      eligibility.
                    </p>
                    <div className="space-y-4">{safeRecommended.map((service) => renderServiceCard(service, true))}</div>
                  </div>
                )}

                {/* All Other Services Section */}
                {safeOthers.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowOtherServices(!showOtherServices)}
                      className="w-full flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors mb-4"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">All Other Services</h3>
                        <Badge variant="outline" className="text-xs">
                          {safeOthers.length} available
                        </Badge>
                      </div>
                      {showOtherServices ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>

                    {showOtherServices && <div className="space-y-4">{safeOthers.map((service) => renderServiceCard(service, false))}</div>}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">{services.map((service) => renderServiceCard(service, false))}</div>
            ))}

          {!(tenantId === 2 || tenantId === 10) && (
            <div className="space-y-4">{services.map((service) => renderServiceCardWithOutRecommendation(service, false))}</div>
          )}

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

export default ServiceSelectionWithRecommendations;
