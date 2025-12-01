import React from "react";
import ClinicallyHome from "./pages/ClinicallyHome";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PharmacyBooking from "./pages/PharmacyBooking";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import RescheduleBooking from "./pages/RescheduleBookings";
import CancelBooking from "./pages/CancelBooking";
import PharmacySetUp from "./pages/PharmacySetUp";
import { useVersionCheck } from "./hooks/useVersionCheck";

// Create a client outside of the component
const queryClient = new QueryClient();

const App = () => {
  useVersionCheck();
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/clinically-home"
                element={
                  <PrivateRoute>
                    <ClinicallyHome />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Index />} />
              <Route path="/pharmacy/:name" element={<PharmacyBooking />} />
              <Route path="/pharmacy/reschedule/:token" element={<RescheduleBooking />} />
              <Route path="/pharmacy/cancel/:token" element={<CancelBooking />} />
              <Route
                path="/clinically-home/admin-setup"
                element={
                  <PrivateRoute>
                    <PharmacySetUp />
                  </PrivateRoute>
                }
              />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
