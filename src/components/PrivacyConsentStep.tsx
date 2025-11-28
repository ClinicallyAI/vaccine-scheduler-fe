import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Shield } from "lucide-react";
import { BookingFormData } from "@/lib/types";

interface PrivacyConsentStepProps {
  formData: BookingFormData;
  updateFormData: (data: Partial<BookingFormData>) => void;
  onNextStep: () => void;
  onPrevStep?: () => void;
}

const PrivacyConsentStep: React.FC<PrivacyConsentStepProps> = ({ formData, updateFormData, onNextStep, onPrevStep }) => {
  const [consentGiven, setConsentGiven] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!consentGiven) {
      alert("Please read and accept the privacy statement to continue");
      return;
    }

    updateFormData({
      personalInfo: {
        ...formData.personalInfo,
        privacyConsentGiven: true,
      },
    });

    onNextStep();
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Privacy and how we use your information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <p className="text-gray-700 leading-relaxed">
                To book vaccinations through Clinically AI, you will need to provide us with some personal information. This information is
                stored securely, and is only used to facilitate your vaccination appointments and provide healthcare recommendations.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We will also share relevant information with healthcare providers involved in your care.
              </p>
              <div className="pt-2">
                <a
                  href="https://get.yourclinicallyai.com/privacy-policy"
                  className="text-primary hover:text-primary/80 underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Clinically AI privacy statement
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
              <Checkbox
                id="privacy-consent"
                checked={consentGiven}
                onCheckedChange={(checked) => setConsentGiven(!!checked)}
                className="mt-1"
              />
              <label htmlFor="privacy-consent" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                I have read this privacy statement, and understand how the information I provide will be used.
              </label>
            </div>

            <div className="flex justify-between pt-4">
              {onPrevStep && (
                <Button type="button" variant="outline" onClick={onPrevStep} className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              <Button type="submit" className="ml-auto" size="lg" disabled={!consentGiven}>
                Continue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyConsentStep;
