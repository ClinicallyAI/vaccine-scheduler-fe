import { useState } from "react";
import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Users, Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";
import OpeningHoursConfig from "@/components/admin/OpeningHours";
import StaffManagement from "@/components/admin/StaffManagement";
import ServiceConfiguration from "@/components/admin/ServiceConfiguration";

export default function PharmacySetUp() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("opening-hours");

  // Setup completion tracking
  const [setupProgress] = useState({
    openingHours: false,
    staff: false,
    services: false,
  });

  const getTabBadge = (isCompleted: boolean) => {
    return isCompleted ? (
      <Badge variant="default" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
        ✓
      </Badge>
    ) : null;
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/clinically-home")}
              className="text-primary-foreground hover:bg-primary/90"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Pharmacy Setup</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="opening-hours" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Opening Hours
              {getTabBadge(setupProgress.openingHours)}
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Staff
              {getTabBadge(setupProgress.staff)}
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center">
              <Folder className="h-4 w-4 mr-2" />
              Services
              {getTabBadge(setupProgress.services)}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="opening-hours">
            <OpeningHoursConfig />
          </TabsContent>

          <TabsContent value="staff">
            <StaffManagement />
          </TabsContent>

          <TabsContent value="services">
            <ServiceConfiguration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
