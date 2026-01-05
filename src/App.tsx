import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Sites from "./pages/admin/Sites";
import Companies from "./pages/manager/Companies";
import Employees from "./pages/manager/Employees";
import Guardians from "./pages/manager/Guardians";
import CompanyAdmins from "./pages/manager/CompanyAdmins";
import Invitations from "./pages/employee/Invitations";
import MyQRCode from "./pages/employee/MyQRCode";
import AccessHistory from "./pages/AccessHistory";
import Reports from "./pages/Reports";
import ScanPage from "./pages/guardian/ScanPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/sites" element={<Sites />} />
            <Route path="/manager/companies" element={<Companies />} />
            <Route path="/manager/companies/:companyId/employees" element={<Employees />} />
            <Route path="/manager/employees" element={<Employees />} />
            <Route path="/manager/guardians" element={<Guardians />} />
            <Route path="/manager/company-admins" element={<CompanyAdmins />} />
            <Route path="/invitations" element={<Invitations />} />
            <Route path="/my-qr" element={<MyQRCode />} />
            <Route path="/access-history" element={<AccessHistory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/scan" element={<ScanPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
