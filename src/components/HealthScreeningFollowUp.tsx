
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";

interface HealthScreeningFollowUpProps {
  questionType: "vaccination4Weeks" | "bloodThinners";
  onContinue: (answers: Record<string, string>) => void;
  onStop: () => void;
  onBack: () => void;
}

const HealthScreeningFollowUp: React.FC<HealthScreeningFollowUpProps> = ({
  questionType,
  onContinue,
  onStop,
  onBack,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswerChange = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (questionType === "bloodThinners") {
      // Check if any answer indicates need to see GP
      if (answers.stable === "No" || answers.recentBleeding === "Yes") {
        onStop();
        return;
      }
    }
    onContinue(answers);
  };

  const isFormValid = () => {
    if (questionType === "vaccination4Weeks") {
      return answers.vaccine && answers.when;
    }
    if (questionType === "bloodThinners") {
      return answers.stable && answers.recentBleeding;
    }
    return false;
  };

  if (questionType === "vaccination4Weeks") {
    return (
      <div className="animate-fade-in max-w-3xl mx-auto">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-yellow-500 mr-2" />
              <CardTitle className="text-yellow-700">Vaccination History</CardTitle>
            </div>
            <CardDescription className="text-yellow-600">
              Please provide more details about your recent vaccination
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="vaccine" className="text-base font-medium mb-2 block">
                Which vaccination did you receive?
              </Label>
              <Input
                id="vaccine"
                value={answers.vaccine || ""}
                onChange={(e) => handleAnswerChange("vaccine", e.target.value)}
                placeholder="e.g., COVID-19, Flu, etc."
              />
            </div>

            <div>
              <Label htmlFor="when" className="text-base font-medium mb-2 block">
                When did you receive it?
              </Label>
              <Input
                id="when"
                value={answers.when || ""}
                onChange={(e) => handleAnswerChange("when", e.target.value)}
                placeholder="e.g., 2 weeks ago, last month"
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={!isFormValid()}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questionType === "bloodThinners") {
    return (
      <div className="animate-fade-in max-w-3xl mx-auto">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-yellow-500 mr-2" />
              <CardTitle className="text-yellow-700">Blood Thinners Information</CardTitle>
            </div>
            <CardDescription className="text-yellow-600">
              We need to check if it's safe to proceed with vaccination
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-3 block">
                Is your condition stable?
              </Label>
              <RadioGroup
                value={answers.stable || ""}
                onValueChange={(value) => handleAnswerChange("stable", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="stable-yes" />
                  <Label htmlFor="stable-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="stable-no" />
                  <Label htmlFor="stable-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">
                Have you had any recent bleeding?
              </Label>
              <RadioGroup
                value={answers.recentBleeding || ""}
                onValueChange={(value) => handleAnswerChange("recentBleeding", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="bleeding-yes" />
                  <Label htmlFor="bleeding-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="bleeding-no" />
                  <Label htmlFor="bleeding-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={!isFormValid()}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default HealthScreeningFollowUp;
