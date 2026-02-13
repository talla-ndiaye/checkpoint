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
import ManagerUsers from "./pages/manager/Users";
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
import AdminSettings from "./pages/admin/Settings";
import UsersManagement from "./pages/admin/Users";
import KioskRegistration from "./pages/KioskRegistration";
import PublicInvitation from "./pages/public/PublicInvitation";
import Contact from "./pages/Contact";
import ContactMessages from "./pages/admin/ContactMessages";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/i/:code" element={<PublicInvitation />} />

            {/* General Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/access-history" element={<ProtectedRoute><AccessHistory /></ProtectedRoute>} />
            <Route path="/access-history/:id" element={<ProtectedRoute><AccessLogDetails /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/sites" element={<ProtectedRoute allowedRoles={['super_admin']}><Sites /></ProtectedRoute>} />
            <Route path="/admin/managers" element={<ProtectedRoute allowedRoles={['super_admin']}><Managers /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['super_admin']}><UsersManagement /></ProtectedRoute>} />
            <Route path="/admin/messages" element={<ProtectedRoute allowedRoles={['super_admin']}><ContactMessages /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['super_admin']}><AdminSettings /></ProtectedRoute>} />

            {/* Manager Routes */}
            <Route path="/manager/companies" element={<ProtectedRoute allowedRoles={['manager']}><Companies /></ProtectedRoute>} />
            <Route path="/manager/companies/:companyId/employees" element={<ProtectedRoute allowedRoles={['manager']}><ManagerEmployees /></ProtectedRoute>} />
            <Route path="/manager/employees" element={<ProtectedRoute allowedRoles={['manager']}><ManagerEmployees /></ProtectedRoute>} />
            <Route path="/manager/users" element={<ProtectedRoute allowedRoles={['manager']}><ManagerUsers /></ProtectedRoute>} />
            <Route path="/manager/guardians" element={<ProtectedRoute allowedRoles={['manager']}><Guardians /></ProtectedRoute>} />
            <Route path="/manager/company-admins" element={<ProtectedRoute allowedRoles={['manager']}><CompanyAdmins /></ProtectedRoute>} />

            {/* Company Admin Routes */}
            <Route path="/employees" element={<ProtectedRoute allowedRoles={['company_admin']}><CompanyAdminEmployees /></ProtectedRoute>} />

            {/* Employee Routes */}
            <Route path="/invitations" element={<ProtectedRoute allowedRoles={['employee']}><Invitations /></ProtectedRoute>} />
            <Route path="/invitation/:id" element={<ProtectedRoute allowedRoles={['employee']}><InvitationDetails /></ProtectedRoute>} />
            <Route path="/my-qr" element={<ProtectedRoute allowedRoles={['employee']}><MyQRCode /></ProtectedRoute>} />

            {/* Guardian Routes */}
            <Route path="/scan" element={<ProtectedRoute allowedRoles={['guardian']}><ScanPage /></ProtectedRoute>} />
            <Route path="/scan/id-card" element={<ProtectedRoute allowedRoles={['guardian']}><IDCardScanPage /></ProtectedRoute>} />
            <Route path="/scan/bulk-exit" element={<ProtectedRoute allowedRoles={['guardian']}><BulkExitPage /></ProtectedRoute>} />

            {/* Misc */}
            <Route path="/kiosk" element={<KioskRegistration />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
