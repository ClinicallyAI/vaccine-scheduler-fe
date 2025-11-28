
import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface HealthWarningDialogProps {
  yesAnswers: string[];
  onContinue: () => void;
  onBack: () => void;
}

const HealthWarningDialog: React.FC<HealthWarningDialogProps> = ({
  yesAnswers,
  onContinue,
  onBack,
}) => {
  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
            <CardTitle className="text-red-700">Health Warning</CardTitle>
          </div>
          <CardDescription className="text-red-600">
            Based on your responses, there are some concerns that need attention
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="font-medium">
            You answered "Yes" to the following health questions:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            {yesAnswers.map((answer, index) => (
              <li key={index} className="text-gray-700">{answer}</li>
            ))}
          </ul>
          
          <div className="bg-white p-4 rounded-md border border-gray-200 mt-4">
            <h4 className="font-semibold mb-2">Recommendations:</h4>
            <p>
              Based on your answers, we recommend that you consult with a healthcare 
              professional before proceeding with this service. You can:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Contact your GP for further advice</li>
              <li>Speak to a pharmacist at our location</li>
              <li>Reschedule your appointment for a later date</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Go Back
          </Button>
          <Button 
            variant="default" 
            className="bg-red-600 hover:bg-red-700" 
            onClick={onContinue}
          >
            Continue Anyway
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default HealthWarningDialog;
