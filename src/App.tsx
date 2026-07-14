import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import PharmacistDashboard from "./pages/PharmacistDashboard";
import PatientDetails from "./pages/PatientDetails";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";
import DownloadChapter4 from "./pages/DownloadChapter4";
import InstituteApproval from "./pages/InstituteApproval";
import BackendManagement from "./pages/BackendManagement";
import Chat from "./pages/Chat";
import PharmacyInventory from "./pages/PharmacyInventory";
import Theatre from "./pages/Theatre";
import PatientPortal from "./pages/PatientPortal";
import NUSTAccessible from "./pages/NUSTAccessible";

const queryClient = new QueryClient();

import { useEffect } from "react";

function SmoothAnchorHandler() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = (e.target as Element).closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href === "#") return; // leave plain "#" anchors alone
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth" });
        try {
          history.replaceState(null, "", href);
        } catch {}
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SmoothAnchorHandler />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<NUSTAccessible />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute><DashboardLayout><Patients /></DashboardLayout></ProtectedRoute>} />
            <Route path="/patients/:id" element={<ProtectedRoute><DashboardLayout><PatientDetails /></DashboardLayout></ProtectedRoute>} />
            <Route path="/prescriptions" element={<ProtectedRoute><DashboardLayout><Prescriptions /></DashboardLayout></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><DashboardLayout><Appointments /></DashboardLayout></ProtectedRoute>} />
            <Route path="/donations" element={<ProtectedRoute><DashboardLayout><Donations /></DashboardLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
            <Route path="/role-management" element={<ProtectedRoute><DashboardLayout><RoleManagement /></DashboardLayout></ProtectedRoute>} />
            <Route path="/pharmacist" element={<ProtectedRoute><DashboardLayout><PharmacistDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/pharmacist-prescriptions" element={<ProtectedRoute><DashboardLayout><PharmacistPrescriptions /></DashboardLayout></ProtectedRoute>} />
            <Route path="/institute-approval" element={<ProtectedRoute><DashboardLayout><InstituteApproval /></DashboardLayout></ProtectedRoute>} />
            <Route path="/backend-management" element={<ProtectedRoute><DashboardLayout><BackendManagement /></DashboardLayout></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><DashboardLayout><Chat /></DashboardLayout></ProtectedRoute>} />
            <Route path="/pharmacy-inventory" element={<ProtectedRoute><DashboardLayout><PharmacyInventory /></DashboardLayout></ProtectedRoute>} />
            <Route path="/theatre" element={<ProtectedRoute><DashboardLayout><Theatre /></DashboardLayout></ProtectedRoute>} />
            <Route path="/patient" element={<ProtectedRoute><DashboardLayout><PatientPortal /></DashboardLayout></ProtectedRoute>} />
            <Route path="/download-chapter4" element={<DownloadChapter4 />} />
            <Route path="/nu-st-accessible" element={<NUSTAccessible />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
