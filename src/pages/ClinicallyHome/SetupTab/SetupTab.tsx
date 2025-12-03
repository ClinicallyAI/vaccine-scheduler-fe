import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Users, Folder } from "lucide-react";
import { TENANT } from "@/services/auth";

const SetupTab: React.FC = () => {
  const navigate = useNavigate();
  const tenantId = Number(TENANT);
  const showAdminButton = tenantId === 2 || tenantId === 10;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Patient booking system</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Configure your pharmacy's booking system</p>
          </div>
          {showAdminButton && <Button onClick={() => navigate("/clinically-home/admin-setup")}>Admin Setup</Button>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium">Opening Hours</h4>
                <p className="text-sm text-muted-foreground">Set your daily schedule</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium">Staff</h4>
                <p className="text-sm text-muted-foreground">Manage team schedules</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Folder className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium">Services</h4>
                <p className="text-sm text-muted-foreground">Configure available services</p>
              </div>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default SetupTab;
