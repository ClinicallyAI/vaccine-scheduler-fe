import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft } from "lucide-react";
import { useAgeCalculation } from "@/hooks/useAgeCalculation";
import { BookingFormData } from "@/lib/types";

interface BasicInfoFormProps {
  formData: BookingFormData;
  updateFormData: (data: Partial<BookingFormData>) => void;
  onNextStep: () => void;
  onPrevStep?: () => void;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ formData, updateFormData, onNextStep, onPrevStep }) => {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [bookingType, setBookingType] = useState<"myself" | "other">(formData.personalInfo.bookingType || "myself");
  const [isPregnant, setIsPregnant] = useState<"yes" | "no" | "">(
    formData.personalInfo.isPregnantOrBreastfeeding ? "yes" : formData.personalInfo.isPregnantOrBreastfeeding === false ? "no" : ""
  );

  const { ageInYears, displayAge } = useAgeCalculation(day, month, year);

  useEffect(() => {
    setDay(formData.personalInfo.dateOfBirth?.getDate().toString() || "");
    setMonth((formData.personalInfo.dateOfBirth?.getMonth() + 1).toString() || "");
    setYear(formData.personalInfo.dateOfBirth?.getFullYear().toString() || "");
  }, [formData.personalInfo.dateOfBirth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!day || !month || !year) {
      alert("Please select a complete date of birth");
      return;
    }

    const dateOfBirth = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    updateFormData({
      personalInfo: {
        ...formData.personalInfo,
        dateOfBirth,
        bookingType,
        isPregnantOrBreastfeeding: isPregnant === "yes",
      },
    });

    onNextStep();
  };

  const shouldShowPregnancyQuestion = ageInYears >= 13;

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Booking Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Who is this booking for?</Label>
              <RadioGroup
                value={bookingType}
                onValueChange={(value: "myself" | "other") => setBookingType(value)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="myself" id="myself" />
                  <Label htmlFor="myself">Myself</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Someone else</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Date of Birth */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Date of Birth {bookingType === "other" && "(of the person receiving the service)"}
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <Select value={day} onValueChange={setDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <SelectItem key={d} value={d.toString()}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((m, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {displayAge && <p className="text-sm text-gray-600">Age: {displayAge}</p>}
            </div>

            {/* Pregnancy Question - Only for ages 13+ */}
            {shouldShowPregnancyQuestion && (
              <div className="space-y-3">
                <div>
                  {bookingType === "other" ? (
                    <Label className="text-base font-medium">Is the person you are booking for pregnant?</Label>
                  ) : (
                    <Label className="text-base font-medium">Are you currently pregnant?</Label>
                  )}
                  <p className="text-sm text-gray-600 mt-1">Certain vaccines are recommended during pregnancy</p>
                </div>
                <RadioGroup
                  value={isPregnant}
                  onValueChange={(value: "yes" | "no") => setIsPregnant(value)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="pregnant-yes" />
                    <Label htmlFor="pregnant-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="pregnant-no" />
                    <Label htmlFor="pregnant-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            <div className="flex justify-between pt-4">
              {onPrevStep && (
                <Button type="button" variant="outline" onClick={onPrevStep} className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              <Button type="submit" className="ml-auto" size="lg">
                Continue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicInfoForm;
