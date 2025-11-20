import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Prescriptions from "./pages/Prescriptions";
import Appointments from "./pages/Appointments";
import Donations from "./pages/Donations";
import Settings from "./pages/Settings";
import RoleManagement from "./pages/RoleManagement";
import PharmacistPrescriptions from "./pages/PharmacistPrescriptions";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/patients" element={<DashboardLayout><Patients /></DashboardLayout>} />
          <Route path="/prescriptions" element={<DashboardLayout><Prescriptions /></DashboardLayout>} />
          <Route path="/appointments" element={<DashboardLayout><Appointments /></DashboardLayout>} />
          <Route path="/donations" element={<DashboardLayout><Donations /></DashboardLayout>} />
          <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
          <Route path="/role-management" element={<DashboardLayout><RoleManagement /></DashboardLayout>} />
          <Route path="/pharmacist-prescriptions" element={<DashboardLayout><PharmacistPrescriptions /></DashboardLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
