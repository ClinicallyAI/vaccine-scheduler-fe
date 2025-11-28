import React from "react";
import { Pharmacy } from "@/lib/types";

interface PharmacyHeaderProps {
  pharmacy: Pharmacy;
}

const PharmacyHeader: React.FC<PharmacyHeaderProps> = ({ pharmacy }) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container max-w-5xl py-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          {pharmacy.logo && <img src={pharmacy.logo} alt={`${pharmacy.name} logo`} className="h-12 w-12 object-contain mr-3" />}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{pharmacy.name}</h1>
            <p className="text-sm text-gray-500">{pharmacy.address}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Powered by</span>
            <span className="font-bold text-primary text-lg">Clinically AI</span>
          </div>
          <a href={pharmacy.email} className="text-sm text-primary hover:underline mt-1">
            {pharmacy.email}
          </a>
          <p className="text-sm text-gray-500">{pharmacy.phone_number}</p>
        </div>
      </div>
    </div>
  );
};

export default PharmacyHeader;
