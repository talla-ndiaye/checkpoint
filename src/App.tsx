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
import Managers from "./pages/admin/Managers";
import Companies from "./pages/manager/Companies";
import ManagerEmployees from "./pages/manager/Employees";
import Guardians from "./pages/manager/Guardians";
import CompanyAdmins from "./pages/manager/CompanyAdmins";
import CompanyAdminEmployees from "./pages/company-admin/Employees";
import Invitations from "./pages/employee/Invitations";
import InvitationDetails from "./pages/employee/InvitationDetails";
import MyQRCode from "./pages/employee/MyQRCode";
import AccessHistory from "./pages/AccessHistory";
import AccessLogDetails from "./pages/AccessLogDetails";
import Reports from "./pages/Reports";
import ScanPage from "./pages/guardian/ScanPage";
import IDCardScanPage from "./pages/guardian/IDCardScanPage";
import BulkExitPage from "./pages/guardian/BulkExitPage";
import Analytics from "./pages/Analytics";
import PublicInvitation from "./pages/public/PublicInvitation";
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
            <Route path="/admin/managers" element={<Managers />} />
            <Route path="/manager/companies" element={<Companies />} />
            <Route path="/manager/companies/:companyId/employees" element={<ManagerEmployees />} />
            <Route path="/manager/employees" element={<ManagerEmployees />} />
            <Route path="/manager/guardians" element={<Guardians />} />
            <Route path="/manager/company-admins" element={<CompanyAdmins />} />
            <Route path="/employees" element={<CompanyAdminEmployees />} />
            <Route path="/invitations" element={<Invitations />} />
            <Route path="/invitation/:id" element={<InvitationDetails />} />
            <Route path="/my-qr" element={<MyQRCode />} />
            <Route path="/access-history" element={<AccessHistory />} />
            <Route path="/access-history/:id" element={<AccessLogDetails />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/scan/id-card" element={<IDCardScanPage />} />
            <Route path="/scan/bulk-exit" element={<BulkExitPage />} />
            <Route path="/analytics" element={<Analytics />} />
            {/* Public routes (no auth required) */}
            <Route path="/i/:code" element={<PublicInvitation />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
