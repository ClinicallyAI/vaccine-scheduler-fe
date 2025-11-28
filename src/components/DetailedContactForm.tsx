import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { normalizePhone } from "@/utils/phoneNumberClean";

interface DetailedContactFormProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

const DetailedContactForm: React.FC<DetailedContactFormProps> = ({ formData, updateFormData, onNextStep, onPrevStep }) => {
  const [personalInfo, setPersonalInfo] = useState({
    fullName: formData.personalInfo.fullName || "",
    phone: formData.personalInfo.phone || "",
    email: formData.personalInfo.email || "",
    address: formData.personalInfo.address || "",
    nhiNumber: formData.personalInfo.nhiNumber || "",
    gpContact: formData.personalInfo.gpContact || "",
    bookerInfo: formData.personalInfo.bookerInfo || {
      name: "",
      phone: "",
      email: "",
      relationship: "",
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!personalInfo.fullName || !personalInfo.phone || !personalInfo.email) {
      alert("Please fill in all required fields");
      return;
    }

    if (
      formData.personalInfo.bookingType === "other" &&
      (!personalInfo.bookerInfo.name || !personalInfo.bookerInfo.phone || !personalInfo.bookerInfo.email)
    ) {
      alert("Please fill in all booker information");
      return;
    }

    updateFormData({
      personalInfo: {
        ...formData.personalInfo,
        ...personalInfo,
        phone: normalizePhone(personalInfo.phone),
        bookerInfo: {
          ...personalInfo.bookerInfo,
          phone: normalizePhone(personalInfo.bookerInfo.phone),
        },
      },
    });

    onNextStep();
  };

  return (
    <div className="animate-fade-in">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Contact Details</CardTitle>
          <p className="text-gray-500 text-center">Please provide your contact information</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                {formData.personalInfo.bookingType === "other" ? "Patient Information" : "Your Information"}
              </h3>

              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={personalInfo.fullName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={personalInfo.address}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                  placeholder="Enter address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nhiNumber">NHI Number</Label>
                  <Input
                    id="nhiNumber"
                    value={personalInfo.nhiNumber}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, nhiNumber: e.target.value })}
                    placeholder="ABC1234"
                  />
                </div>
                <div>
                  <Label htmlFor="gpContact">GP Contact</Label>
                  <Input
                    id="gpContact"
                    value={personalInfo.gpContact}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, gpContact: e.target.value })}
                    placeholder="GP name or clinic"
                  />
                </div>
              </div>
            </div>

            {/* Booker Information (if booking for someone else) */}
            {formData.personalInfo.bookingType === "other" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Your Information (Person Making Booking)</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bookerName">Your Name *</Label>
                    <Input
                      id="bookerName"
                      value={personalInfo.bookerInfo.name}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          bookerInfo: { ...personalInfo.bookerInfo, name: e.target.value },
                        })
                      }
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="relationship">Relationship *</Label>
                    <Select
                      value={personalInfo.bookerInfo.relationship}
                      onValueChange={(value) =>
                        setPersonalInfo({
                          ...personalInfo,
                          bookerInfo: { ...personalInfo.bookerInfo, relationship: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="guardian">Guardian</SelectItem>
                        <SelectItem value="spouse">Spouse/Partner</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bookerPhone">Your Phone *</Label>
                    <Input
                      id="bookerPhone"
                      type="tel"
                      value={personalInfo.bookerInfo.phone}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          bookerInfo: { ...personalInfo.bookerInfo, phone: e.target.value },
                        })
                      }
                      placeholder="Enter your phone"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bookerEmail">Your Email *</Label>
                    <Input
                      id="bookerEmail"
                      type="email"
                      value={personalInfo.bookerInfo.email}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          bookerInfo: { ...personalInfo.bookerInfo, email: e.target.value },
                        })
                      }
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={onPrevStep} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1">
                Continue to Review
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailedContactForm;
