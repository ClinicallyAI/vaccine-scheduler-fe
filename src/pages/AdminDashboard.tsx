
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { getAllPharmacies, updatePharmacyData } from "@/lib/data";
import { Pharmacy } from "@/lib/types";
import { Building2, Clock, Mail, MapPin, Phone, Save } from "lucide-react";

const AdminDashboard = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>("");
  const [pharmacyData, setPharmacyData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
  });

  const [businessHours, setBusinessHours] = useState({
    weekdays: "",
    weekends: "",
    saturday: "",
    sunday: "",
  });

  // Load pharmacies on component mount
  useEffect(() => {
    const allPharmacies = getAllPharmacies();
    setPharmacies(allPharmacies);
    if (allPharmacies.length > 0) {
      setSelectedPharmacyId(allPharmacies[0].id);
    }
  }, []);

  // Update form data when selected pharmacy changes
  useEffect(() => {
    if (selectedPharmacyId) {
      const pharmacy = pharmacies.find(p => p.id === selectedPharmacyId);
      if (pharmacy) {
        setPharmacyData({
          name: pharmacy.name,
          address: pharmacy.address,
          city: pharmacy.city,
          state: pharmacy.state,
          zipCode: pharmacy.zipCode,
          phone: pharmacy.phone,
          email: pharmacy.email,
        });

        setBusinessHours({
          weekdays: pharmacy.businessHours?.weekdays || "",
          weekends: pharmacy.businessHours?.weekends || "",
          saturday: pharmacy.businessHours?.saturday || "",
          sunday: pharmacy.businessHours?.sunday || "",
        });
      }
    }
  }, [selectedPharmacyId, pharmacies]);

  const handlePharmacyUpdate = (field: string, value: string) => {
    setPharmacyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBusinessHoursUpdate = (field: string, value: string) => {
    setBusinessHours(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const savePharmacyDetails = () => {
    if (!selectedPharmacyId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a pharmacy first.",
      });
      return;
    }

    const success = updatePharmacyData(selectedPharmacyId, {
      ...pharmacyData,
      businessHours
    });

    if (success) {
      // Update local state to reflect changes
      const updatedPharmacies = getAllPharmacies();
      setPharmacies(updatedPharmacies);
      
      toast({
        title: "Pharmacy Details Updated",
        description: "Your pharmacy information has been successfully saved and will appear in the booking interface.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update pharmacy details.",
      });
    }
    
    console.log("Saving pharmacy data:", pharmacyData);
    console.log("Saving business hours:", businessHours);
  };

  const saveBusinessHours = () => {
    if (!selectedPharmacyId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a pharmacy first.",
      });
      return;
    }

    const success = updatePharmacyData(selectedPharmacyId, {
      businessHours
    });

    if (success) {
      const updatedPharmacies = getAllPharmacies();
      setPharmacies(updatedPharmacies);
      
      toast({
        title: "Business Hours Updated",
        description: "Your business hours have been successfully saved.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update business hours.",
      });
    }
    
    console.log("Saving business hours:", businessHours);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-2">Manage your pharmacy details and settings</p>
        </div>

        {/* Pharmacy Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Pharmacy</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedPharmacyId} onValueChange={setSelectedPharmacyId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a pharmacy to manage" />
              </SelectTrigger>
              <SelectContent>
                {pharmacies.map((pharmacy) => (
                  <SelectItem key={pharmacy.id} value={pharmacy.id}>
                    {pharmacy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Tabs defaultValue="pharmacy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pharmacy">Pharmacy Details</TabsTrigger>
            <TabsTrigger value="hours">Business Hours</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>

          <TabsContent value="pharmacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Pharmacy Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Pharmacy Name</Label>
                    <Input
                      id="name"
                      value={pharmacyData.name}
                      onChange={(e) => handlePharmacyUpdate("name", e.target.value)}
                      placeholder="Enter pharmacy name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={pharmacyData.phone}
                      onChange={(e) => handlePharmacyUpdate("phone", e.target.value)}
                      placeholder="(09) 375 1537"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={pharmacyData.email}
                      onChange={(e) => handlePharmacyUpdate("email", e.target.value)}
                      placeholder="dispensary.262queenst@unichem.co.nz"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Street Address
                    </Label>
                    <Input
                      id="address"
                      value={pharmacyData.address}
                      onChange={(e) => handlePharmacyUpdate("address", e.target.value)}
                      placeholder="262 Queen Street"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={pharmacyData.city}
                      onChange={(e) => handlePharmacyUpdate("city", e.target.value)}
                      placeholder="Auckland Central"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Region</Label>
                    <Input
                      id="state"
                      value={pharmacyData.state}
                      onChange={(e) => handlePharmacyUpdate("state", e.target.value)}
                      placeholder="Auckland"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Postal Code</Label>
                    <Input
                      id="zipCode"
                      value={pharmacyData.zipCode}
                      onChange={(e) => handlePharmacyUpdate("zipCode", e.target.value)}
                      placeholder="1010"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={savePharmacyDetails} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Pharmacy Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="weekdays">Monday - Friday</Label>
                    <Input
                      id="weekdays"
                      value={businessHours.weekdays}
                      onChange={(e) => handleBusinessHoursUpdate("weekdays", e.target.value)}
                      placeholder="9:00 AM – 7:00 PM"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weekends">Saturday - Sunday (if same hours)</Label>
                    <Input
                      id="weekends"
                      value={businessHours.weekends}
                      onChange={(e) => handleBusinessHoursUpdate("weekends", e.target.value)}
                      placeholder="10:00 AM – 6:00 PM"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="saturday">Saturday (if different from weekends)</Label>
                    <Input
                      id="saturday"
                      value={businessHours.saturday}
                      onChange={(e) => handleBusinessHoursUpdate("saturday", e.target.value)}
                      placeholder="9:00 AM – 2:00 PM"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sunday">Sunday (if different from weekends)</Label>
                    <Input
                      id="sunday"
                      value={businessHours.sunday}
                      onChange={(e) => handleBusinessHoursUpdate("sunday", e.target.value)}
                      placeholder="Closed"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={saveBusinessHours} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Business Hours
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Service Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Service management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Availability Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Availability management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
