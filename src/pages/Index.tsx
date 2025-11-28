import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPharmacyName } from "@/utils/idToPharmacyNameMap";
import api from "@/services/axios"; // <-- uses your axios instance with auth
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner"; // optional spinner

interface Pharmacy {
  id: string;
  name: string;
  phone_number?: string;
  email?: string;
  address?: string;
}

const Index = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const res = await api.get("https://sms-demo-fszn.onrender.com/tenants"); // adjust endpoint as needed
        setPharmacies(res.data.data); // or res.data if that's how your backend returns
      } catch (err: any) {
        setError("Failed to load pharmacies.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-clinically-50 to-clinically-100">
      <header className="bg-white shadow-sm">
        <div className="container max-w-7xl py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-primary">Clinically AI</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="bg-white container max-w-7xl py-12">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Pharmacy Booking Platform</h2>
          <p className="text-xl text-gray-600">
            Book appointments with your local pharmacy quickly and easily. Browse our partner pharmacies below.
          </p>
        </div>

        {/* Conditional rendering for loading, error, and data */}
        {loading && (
          <div className="text-center py-12">
            <Spinner />
            <p className="text-gray-500 mt-2">Loading pharmacies...</p>
          </div>
        )}

        {!loading && error && <div className="text-center text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pharmacies.map((pharmacy) => (
              <Card key={pharmacy.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader className="bg-primary/10">
                  <CardTitle>{pharmacy.name}</CardTitle>
                  {pharmacy.address && <CardDescription>{pharmacy.address}</CardDescription>}
                </CardHeader>
                <CardContent className="pt-6 flex-1">
                  <div className="space-y-2">
                    {pharmacy.phone_number && (
                      <div className="flex">
                        <span className="font-medium w-24">Phone:</span>
                        <span>{pharmacy.phone_number}</span>
                      </div>
                    )}
                    {pharmacy.email && (
                      <div className="flex">
                        <span className="font-medium w-24">Email:</span>
                        <span className="truncate">{pharmacy.email}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button asChild className="w-full">
                    <Link to={`/pharmacy/${getPharmacyName(pharmacy.id)}`} state={{ pharmacy }}>
                      Book Appointment
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-auto py-8 bg-gray-900 text-white">
        <div className="container max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Clinically AI</h3>
              <p className="text-gray-300">Connecting patients with pharmacy services through an advanced booking platform.</p>
            </div>
            <div className="text-right">
              <p className="text-gray-300">© {new Date().getFullYear()} Clinically AI</p>
              <p className="text-gray-300">All rights reserved</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
