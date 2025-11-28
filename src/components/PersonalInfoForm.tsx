
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BookingFormData } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";
import { calculateAge } from "@/utils/ageCalculation";

interface PersonalInfoFormProps {
  formData: BookingFormData;
  updateFormData: (data: Partial<BookingFormData>) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

// Simplified schema
const personalInfoSchema = z.object({
  fullName: z.string().min(1, { message: "Name is required" }),
  dobDay: z.string().min(1, { message: "Day is required" }),
  dobMonth: z.string().min(1, { message: "Month is required" }),
  dobYear: z.string().min(1, { message: "Year is required" }),
  nhiNumber: z.string().optional(),
  gpContact: z.string().optional(),
  bookingType: z.enum(["myself", "other"], {
    required_error: "Please select who you're booking for",
  }),
  bookerName: z.string().optional(),
  bookerPhone: z.string().optional(),
  bookerEmail: z.string().optional(),
  bookerRelationship: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  isPregnantOrPlanningPregnancy: z.enum(["yes", "no"]).optional(),
})
.refine(
  (data) => {
    // Validate the date is valid
    const day = parseInt(data.dobDay);
    const month = parseInt(data.dobMonth);
    const year = parseInt(data.dobYear);
    
    try {
      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && 
            date.getMonth() === month - 1 && 
            date.getDate() === day;
    } catch (e) {
      return false;
    }
  },
  {
    message: "Invalid date",
    path: ["dobDay"],
  }
)
.refine(
  (data) => {
    const { ageInYears } = calculateAge(data.dobDay, data.dobMonth, data.dobYear);
    // For patients under 16, validate booker info is required
    if (ageInYears < 16) {
      return !!data.bookerName && !!data.bookerPhone && !!data.bookerEmail;
    }
    return true;
  },
  {
    message: "Guardian information is required for patients under 16",
    path: ["bookerName"],
  }
)
.refine(
  (data) => {
    // For booking for other (regardless of age), validate booker info
    if (data.bookingType === "other") {
      return !!data.bookerName && !!data.bookerPhone && !!data.bookerEmail;
    }
    return true;
  },
  {
    message: "Booker information is required when booking for someone else",
    path: ["bookerName"],
  }
)
.refine(
  (data) => {
    const { ageInYears } = calculateAge(data.dobDay, data.dobMonth, data.dobYear);
    // For patients 16+ booking for themselves, validate contact info
    if (ageInYears >= 16 && data.bookingType === "myself") {
      return !!data.phone && !!data.email && !!data.address;
    }
    return true;
  },
  {
    message: "Contact information is required",
    path: ["phone"],
  }
);

type FormData = z.infer<typeof personalInfoSchema>;

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  formData,
  updateFormData,
  onNextStep,
  onPrevStep,
}) => {
  const [age, setAge] = useState<number>(0);
  const [bookingType, setBookingType] = useState<string>(formData.personalInfo.bookingType || "myself");
  const [showSection2, setShowSection2] = useState<boolean>(false);
  
  // Generate day, month, year arrays for dropdowns
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const months = [
    "1", "2", "3", "4", "5", "6", 
    "7", "8", "9", "10", "11", "12"
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: 120 }, 
    (_, i) => (currentYear - i).toString()
  );

  // Parse existing date of birth if it exists
  const existingDob = formData.personalInfo.dateOfBirth;
  const defaultDobDay = existingDob ? existingDob.getDate().toString() : "";
  const defaultDobMonth = existingDob ? (existingDob.getMonth() + 1).toString() : "";
  const defaultDobYear = existingDob ? existingDob.getFullYear().toString() : "";

  const form = useForm<FormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: formData.personalInfo.fullName || "",
      dobDay: defaultDobDay,
      dobMonth: defaultDobMonth,
      dobYear: defaultDobYear,
      nhiNumber: formData.personalInfo.nhiNumber || "",
      gpContact: formData.personalInfo.gpContact || "",
      bookingType: formData.personalInfo.bookingType || "myself",
      bookerName: formData.personalInfo.bookerInfo?.name || "",
      bookerPhone: formData.personalInfo.bookerInfo?.phone || "",
      bookerEmail: formData.personalInfo.bookerInfo?.email || "",
      bookerRelationship: formData.personalInfo.bookerInfo?.relationship || "",
      phone: formData.personalInfo.phone || "",
      email: formData.personalInfo.email || "",
      address: formData.personalInfo.address || "",
      isPregnantOrPlanningPregnancy: formData.personalInfo.isPregnantOrPlanningPregnancy ? "yes" : "no",
    },
  });

  // Calculate age whenever date inputs change
  useEffect(() => {
    const day = form.getValues("dobDay");
    const month = form.getValues("dobMonth");
    const year = form.getValues("dobYear");

    const { ageInYears } = calculateAge(day, month, year);
    setAge(ageInYears);
  }, [
    form.watch("dobDay"),
    form.watch("dobMonth"),
    form.watch("dobYear")
  ]);

  // Update booking type state when it changes in the form
  useEffect(() => {
    const currentBookingType = form.watch("bookingType");
    if (currentBookingType !== bookingType) {
      setBookingType(currentBookingType);
    }
  }, [form.watch("bookingType"), bookingType]);

  // Check if section 1 is complete to show section 2
  useEffect(() => {
    const fullName = form.watch("fullName");
    const dobDay = form.watch("dobDay");
    const dobMonth = form.watch("dobMonth");
    const dobYear = form.watch("dobYear");
    const currentBookingType = form.watch("bookingType");
    const pregnancyAnswer = form.watch("isPregnantOrPlanningPregnancy");

    // Section 1 is complete if basic info is filled
    const basicInfoComplete = fullName && dobDay && dobMonth && dobYear;
    
    // For users 16+, also need booking type selection
    const bookingTypeComplete = age < 16 || currentBookingType;
    
    // For users 13+, also need pregnancy answer
    const pregnancyComplete = age < 13 || (pregnancyAnswer === "yes" || pregnancyAnswer === "no");

    setShowSection2(basicInfoComplete && bookingTypeComplete && pregnancyComplete);
  }, [
    form.watch("fullName"),
    form.watch("dobDay"),
    form.watch("dobMonth"),
    form.watch("dobYear"),
    form.watch("bookingType"),
    form.watch("isPregnantOrPlanningPregnancy"),
    age
  ]);

  function onSubmit(data: FormData) {
    // Create a Date object from the selected values
    try {
      const day = parseInt(data.dobDay);
      const month = parseInt(data.dobMonth) - 1;
      const year = parseInt(data.dobYear);
      const dateOfBirth = new Date(year, month, day);

      if (age < 3) {
        toast({
          variant: "destructive",
          title: "Age Restriction",
          description: "Children under 3 years old need to be vaccinated by a GP. Please consult your doctor.",
        });
        return;
      }

      // For patients under 16, use booker info as contact info
      const contactPhone = age < 16 ? data.bookerPhone : data.phone;
      const contactEmail = age < 16 ? data.bookerEmail : data.email;
      const contactAddress = age < 16 ? "" : data.address;
      
      const bookerInfo = (data.bookingType === "other" || age < 16)
        ? {
            name: data.bookerName || "",
            phone: data.bookerPhone || "",
            email: data.bookerEmail || "",
            relationship: data.bookerRelationship || "",
          }
        : undefined;

      updateFormData({
        personalInfo: {
          fullName: data.fullName,
          dateOfBirth: dateOfBirth,
          phone: contactPhone || "",
          email: contactEmail || "",
          address: contactAddress || "",
          nhiNumber: data.nhiNumber,
          gpContact: data.gpContact,
          bookingType: data.bookingType,
          bookerInfo,
          isPregnantOrBreastfeeding: data.isPregnantOrPlanningPregnancy === "yes",
          isPregnantOrPlanningPregnancy: data.isPregnantOrPlanningPregnancy === "yes",
          privacyConsentGiven: false, // Default to false, will be set in PrivacyConsentStep
        },
      });
      
      onNextStep();
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Invalid Date",
        description: "Please enter a valid date of birth",
      });
    }
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-2">Personal Information</h2>
      <p className="text-gray-500 text-center mb-6">
        Please provide the required details below
      </p>

      {age < 3 && age > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
            <div>
              <h3 className="font-medium text-red-800">Age Restriction</h3>
              <p className="text-sm text-red-700">
                Children under 3 years old need to be vaccinated by a GP. If you continue, you will need to consult your doctor.
              </p>
            </div>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Basic Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Patient Information</h3>
            
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient's Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Date of Birth (DD/MM/YYYY)</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="dobDay"
                  render={({ field }) => (
                    <FormItem>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {days.map(day => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dobMonth"
                  render={({ field }) => (
                    <FormItem>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dobYear"
                  render={({ field }) => (
                    <FormItem>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map(year => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {age > 0 && (() => {
                const day = form.watch("dobDay");
                const month = form.watch("dobMonth");
                const year = form.watch("dobYear");
                const { displayAge } = calculateAge(day, month, year);

                return (
                  <div className={`mt-2 text-sm ${age < 3 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                    Calculated Age: {displayAge}
                    {age < 3 && " (Children under 3 years need to be vaccinated by a GP)"}
                  </div>
                );
              })()}
            </div>

            {/* Optional NHI and GP fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nhiNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      NHI Number <span className="text-gray-500">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="ABC1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gpContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      GP Contact <span className="text-gray-500">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. Smith, Example Clinic" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Booking type for 16+ */}
            {age >= 16 && (
              <FormField
                control={form.control}
                name="bookingType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Who is this booking for?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="myself" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Myself
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="other" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Someone else
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Pregnancy Question for 13+ */}
            {age >= 13 && (
              <FormField
                control={form.control}
                name="isPregnantOrPlanningPregnancy"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-medium">
                      Is the person you are booking for pregnant?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Yes
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            No
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Section 2: Contact/Booker Information */}
          {showSection2 && (
            <div className="space-y-4 border-t pt-6 animate-fade-in">
              {/* Guardian/Booker Information */}
              {(age < 16 || bookingType === "other") && (
                <>
                  <h3 className="text-lg font-medium">
                    {age < 16 ? "Parent/Guardian Information" : "Your Information (Booker)"}
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="bookerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{age < 16 ? "Parent/Guardian Name" : "Your Name"}</FormLabel>
                        <FormControl>
                          <Input placeholder="Full Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bookerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{age < 16 ? "Parent/Guardian Phone" : "Your Phone"}</FormLabel>
                          <FormControl>
                            <Input placeholder="+64 21 123 4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bookerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{age < 16 ? "Parent/Guardian Email" : "Your Email"}</FormLabel>
                          <FormControl>
                            <Input placeholder="email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bookerRelationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship to Patient</FormLabel>
                        <FormControl>
                          <Input placeholder="Parent, Guardian, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Contact Information for 16+ booking for themselves */}
              {age >= 16 && bookingType === "myself" && (
                <>
                  <h3 className="text-lg font-medium">Your Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+64 21 123 4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="example@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Example St, City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onPrevStep}>
              Back
            </Button>
            <Button type="submit">Continue</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PersonalInfoForm;
