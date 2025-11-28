import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ServiceTypeSelectionProps {
  onSelectType: (type: "vaccinations" | "general") => void;
  vaccinationCount: number;
  generalServiceCount: number;
}

const ServiceTypeSelection: React.FC<ServiceTypeSelectionProps> = ({ onSelectType, vaccinationCount, generalServiceCount }) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-2">What service do you need?</h2>
      <p className="text-gray-500 text-center mb-8">Choose the type of service you're looking for</p>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto">
        {/* Vaccinations */}

        <Card className="border border-gray-200 hover:border-primary hover:shadow-lg transition-all cursor-pointer group">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl mb-2">Vaccinations</CardTitle>
            <Badge variant="outline" className="mx-auto">
              {vaccinationCount} available
            </Badge>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">Protect yourself and your family with our comprehensive vaccination services</p>
            <Button onClick={() => onSelectType("vaccinations")} disabled={vaccinationCount === 0} className="w-full" size="lg">
              {vaccinationCount === 0 ? "Coming soon" : "Make a Booking"}
            </Button>
          </CardContent>
        </Card>

        {/* General Services */}
        <Card className="border border-gray-200 hover:border-primary hover:shadow-lg transition-all cursor-pointer group">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl mb-2">General Pharmacy Services</CardTitle>
            <Badge variant="outline" className="mx-auto">
              {generalServiceCount} available
            </Badge>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">Quick and convenient pharmacy services for your everyday needs</p>
            <Button onClick={() => onSelectType("general")} className="w-full" size="lg">
              Make a Booking
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceTypeSelection;
