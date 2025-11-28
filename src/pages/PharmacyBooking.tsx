import React, { useState, useEffect, useRef } from "react";
import { useParams, Navigate, useLocation } from "react-router-dom";
import { TimeSlot, Pharmacy, Service, Recommendation } from "@/lib/types";
import { getPharmacyId } from "@/utils/idToPharmacyNameMap";
import { Badge } from "@/components/ui/badge";
import api from "@/services/axios";
import PharmacyHeader from "@/components/PharmacyHeader";
import DynamicBookingProgress from "@/components/DynamicBookingProgress";
import ServiceTypeSelection from "@/components/ServiceTypeSelection";
import BasicInfoForm from "@/components/BasicInfoForm";
import PrivacyConsentStep from "@/components/PrivacyConsentStep";
import ServiceSelection from "@/components/ServiceSelection";
import AppointmentBooking from "@/components/AppointmentBooking";
import DetailedContactForm from "@/components/DetailedContactForm";
import SimpleContactForm from "@/components/SimpleContactForm";
import ConfirmationStep from "@/components/ConfirmationStep";
import BookingConfirmation from "@/components/BookingConfirmation";
import { Button } from "@/components/ui/button";

const PharmacyBooking = () => {
  const id = getPharmacyId(useParams<{ name: string }>().name);
  const location = useLocation();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(location.state?.pharmacy || null);
  const [loadingPharmacy, setLoadingPharmacy] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [currentStep, setCurrentStep] = useState(0);
  const [serviceType, setServiceType] = useState<"vaccinations" | "general" | null>(null);

  const [formData, setFormData] = useState({
    services: [] as string[],
    pharmacyId: pharmacy?.id || "",
    recommendedServiceId: undefined as string | undefined,
    recommendationAccepted: false,
    calculatedAge: 0,
    personalInfo: {
      fullName: "",
      dateOfBirth: null as Date | null,
      phone: "",
      email: "",
      address: "",
      nhiNumber: "",
      gpContact: "",
      bookingType: "myself" as "myself" | "other",
      bookerInfo: undefined,
      isPregnantOrBreastfeeding: false,
      isPregnantOrPlanningPregnancy: false,
      privacyConsentGiven: false,
    },
    appointment: {
      date: "",
      timeSlot: null as TimeSlot | null,
      type: "scheduled" as "scheduled" | "walk-in",
    },
  });

  // NEW: tiny modal state for recommendations
  const [recModalOpen, setRecModalOpen] = useState(false);
  const [recModalPrimaryId, setRecModalPrimaryId] = useState<string>("");
  const [recModalPrimaryName, setRecModalPrimaryName] = useState<string>("");
  const [recModalOptions, setRecModalOptions] = useState<
    { id: string; label: string; description: string; price: Number; price_is_varies: Boolean }[]
  >([]);

  const recSelectedRef = useRef<Set<string>>(new Set()); // holds currently ticked options

  useEffect(() => {
    const fetchPharmacy = async () => {
      if (!pharmacy && id) {
        setLoadingPharmacy(true);
        try {
          const response = await api.get(`/tenants/${id}`);
          setPharmacy(response.data.data[0]);
        } catch (error) {
          console.error("Failed to fetch pharmacy:", error);
        } finally {
          setLoadingPharmacy(false);
        }
      }
    };
    fetchPharmacy();
  }, [id, pharmacy]);

  // Fetch services after pharmacy is loaded
  useEffect(() => {
    const fetchServices = async () => {
      if (!pharmacy?.id) return;
      setLoadingServices(true);
      try {
        const response = await api.get(`/services/${pharmacy.id}`);
        const result = response.data;

        // NEW: normalize recommendations to [{ serviceId: number }] and drop invalid/self refs
        const normalized: Service[] = (result.data ?? [])
          .filter((s: any) => s.is_active)
          .map((s: any) => {
            const idStr = String(s.id);
            const recs: Recommendation[] = Array.isArray(s.recommendations)
              ? s.recommendations
                  .map((r: any) => {
                    const v = typeof r === "number" ? r : r?.serviceId;
                    return { serviceId: Number(v) };
                  })
                  .filter((r) => Number.isFinite(r.serviceId) && String(r.serviceId) !== idStr)
              : [];
            return { ...s, recommendations: recs };
          });

        setServices(normalized);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, [pharmacy?.id]);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  if (loadingPharmacy || !pharmacy) {
    return <div className="text-center py-10">Loading pharmacy...</div>;
  }

  if (loadingServices) {
    return <div className="text-center py-10">Loading services...</div>;
  }

  const getFilteredServices = () => {
    if (!serviceType) return services;
    return services.filter((service) => (serviceType === "vaccinations" ? service.is_medical : !service.is_medical));
  };

  const getTotalSteps = () => {
    return serviceType === "vaccinations" ? 8 : 6;
  };

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData({ ...formData, ...data });
  };

  const handleSelectServiceType = (type: "vaccinations" | "general") => {
    setServiceType(type);
    setCurrentStep(1);
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, getTotalSteps() - 1));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => {
      if (prev === 0 && serviceType) setServiceType(null);
      return Math.max(prev - 1, 0);
    });
  };

  const handleSelectService = (serviceIds: string[]) => {
    const recommendationAccepted = serviceIds.length > 1;
    const recommendedServiceId = recommendationAccepted ? serviceIds[1] : undefined;

    updateFormData({ services: serviceIds, recommendationAccepted, recommendedServiceId });
    handleNextStep();
  };

  const handleSelectServiceWithRecommendations = (serviceIds: string[]) => {
    // If multiple services already chosen upstream, just pass through as-is.
    if (!serviceIds?.length || serviceIds.length > 1) return handleSelectService(serviceIds);

    const primaryId = String(serviceIds[0]);
    const primary = services.find((s) => String(s.id) === primaryId);
    if (!primary) return handleSelectService([primaryId]);

    const recIds = (primary.recommendations ?? []).map((r) => String(r.serviceId)).filter((sid) => sid !== primaryId);

    if (!recIds.length) {
      // no recommendations → proceed
      return handleSelectService([primaryId]);
    }

    const options = recIds
      .map((sid) => {
        const svc = services.find((s) => String(s.id) === sid);
        if (!svc) return null;
        return {
          id: String(svc.id),
          label: String(svc.name ?? `Service ${sid}`),
          description: String(svc.description ?? ""),
          price: svc.price,
          price_is_varies: svc.price_is_varies,
        };
      })
      .filter((x): x is { id: string; label: string; description: string; price: number; price_is_varies: boolean } => !!x);

    if (!options.length) return handleSelectService([primaryId]);

    recSelectedRef.current = new Set(options.map((o) => o.id)); // preselect all
    setRecModalPrimaryId(primaryId);
    setRecModalPrimaryName(String(primary.name ?? "Selected service"));
    setRecModalOptions(options);
    setRecModalOpen(true);
  };

  // NEW: modal confirm/cancel handlers
  const confirmRecommendations = () => {
    const chosen = Array.from(recSelectedRef.current);
    const finalIds = [recModalPrimaryId, ...chosen]; // primary first → preserves your existing semantics
    setRecModalOpen(false);
    handleSelectService(finalIds);
  };

  const cancelRecommendations = () => {
    setRecModalOpen(false);
    handleSelectService([recModalPrimaryId]); // proceed with only primary
  };

  const getProgressStep = () => {
    return Math.max(0, currentStep - 1);
  };

  const renderCurrentStep = () => {
    if (currentStep === 0) {
      const vaccinationServices = services.filter((s) => s.is_medical);
      const generalServices = services.filter((s) => !s.is_medical);

      return (
        <ServiceTypeSelection
          onSelectType={handleSelectServiceType}
          vaccinationCount={vaccinationServices.length}
          generalServiceCount={generalServices.length}
        />
      );
    }

    if (serviceType === "vaccinations") {
      switch (currentStep) {
        case 1:
          return (
            <BasicInfoForm formData={formData} updateFormData={updateFormData} onNextStep={handleNextStep} onPrevStep={handlePrevStep} />
          );
        case 2:
          return (
            <PrivacyConsentStep
              formData={formData}
              updateFormData={updateFormData}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
            />
          );
        case 3:
          return (
            <ServiceSelection
              services={getFilteredServices()}
              onSelectService={handleSelectServiceWithRecommendations}
              onPrevStep={handlePrevStep}
              age={formData.calculatedAge}
              serviceType={serviceType}
            />
          );
        case 4:
          return (
            <AppointmentBooking
              formData={formData}
              pharmacy={pharmacy}
              updateFormData={updateFormData}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              allServices={services}
            />
          );
        case 5:
          return (
            <DetailedContactForm
              formData={formData}
              updateFormData={updateFormData}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
            />
          );
        case 6:
          return (
            <ConfirmationStep
              formData={formData}
              pharmacy={pharmacy}
              allServices={services}
              onConfirm={handleNextStep}
              onBack={handlePrevStep}
            />
          );
        case 7:
          return <BookingConfirmation formData={formData} pharmacy={pharmacy} allServices={services} />;
        default:
          return null;
      }
    }

    if (serviceType === "general") {
      switch (currentStep) {
        case 1:
          return (
            <ServiceSelection
              services={getFilteredServices()}
              onSelectService={handleSelectServiceWithRecommendations}
              onPrevStep={handlePrevStep}
              age={formData.calculatedAge}
              serviceType={serviceType}
            />
          );
        case 2:
          return (
            <AppointmentBooking
              formData={formData}
              pharmacy={pharmacy}
              updateFormData={updateFormData}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              allServices={services}
            />
          );
        case 3:
          return (
            <SimpleContactForm
              formData={formData}
              updateFormData={updateFormData}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
            />
          );
        case 4:
          return (
            <ConfirmationStep
              formData={formData}
              pharmacy={pharmacy}
              allServices={services}
              onConfirm={handleNextStep}
              onBack={handlePrevStep}
            />
          );
        case 5:
          return <BookingConfirmation formData={formData} pharmacy={pharmacy} allServices={services} />;
        default:
          return null;
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PharmacyHeader pharmacy={pharmacy} />
      <div className="flex-1 py-8">
        {serviceType && (
          <DynamicBookingProgress currentStep={getProgressStep()} totalSteps={getTotalSteps()} serviceId={formData.services[0] || ""} />
        )}
        <div className="container max-w-5xl">{renderCurrentStep()}</div>
      </div>
      {recModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
          <div className="w-[92vw] max-w-xl rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Recommended services</h3>
            <p className="text-sm text-gray-600 mb-3">
              People often add these with <span className="font-medium">{recModalPrimaryName}</span>:
            </p>
            <div className="space-y-2">
              {recModalOptions.map((opt) => (
                <label
                  key={opt.id}
                  className="grid grid-cols-[auto,1fr,auto] items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                >
                  {/* Checkbox (left) */}
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mt-1"
                    onChange={(e) => {
                      if (e.currentTarget.checked) recSelectedRef.current.add(opt.id);
                      else recSelectedRef.current.delete(opt.id);
                    }}
                  />

                  {/* Name + description (middle) */}
                  <div>
                    <div className="font-medium text-gray-900">{opt.label}</div>
                    {opt.description ? <div className="text-sm text-gray-600 whitespace-pre-wrap">{opt.description}</div> : null}
                  </div>

                  {/* Price (right, aligned) */}
                  <div className="text-right">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {opt.price_is_varies ? "Varies" : Number(opt.price) === 0 ? "Free" : `$${opt.price}`}
                    </Badge>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={cancelRecommendations} className="flex items-center">
                No thanks
              </Button>
              <Button className="ml-auto" size="lg" onClick={confirmRecommendations}>
                Add selected
              </Button>
            </div>
          </div>
        </div>
      )}
      <footer className="py-6 bg-white border-t">
        <div className="container text-center text-gray-500 text-sm">© {new Date().getFullYear()} Clinically AI. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default PharmacyBooking;
