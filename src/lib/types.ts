export type UserRole = 'super_admin' | 'manager' | 'guardian' | 'company_admin' | 'employee';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  siteId?: string;
  companyId?: string;
  createdAt: string;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  managerId?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  siteId: string;
  adminId?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  userId: string;
  companyId: string;
  qrCode: string;
  uniqueCode: string;
  createdAt: string;
}

export interface Guardian {
  id: string;
  userId: string;
  siteId: string;
  createdAt: string;
}

export interface Invitation {
  id: string;
  employeeId: string;
  visitorName: string;
  visitorPhone: string;
  visitDate: string;
  visitTime: string;
  qrCode: string;
  alphaCode: string;
  status: 'pending' | 'used' | 'expired' | 'cancelled';
  createdAt: string;
}

export interface AccessLog {
  id: string;
  userId: string;
  actionType: 'entry' | 'exit' | 'invitation_used';
  siteId: string;
  timestamp: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Administrateur',
  manager: 'Gestionnaire',
  guardian: 'Gardien',
  company_admin: 'Admin Entreprise',
  employee: 'Employé',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'role-super-admin',
  manager: 'role-manager',
  guardian: 'role-guardian',
  company_admin: 'role-company-admin',
  employee: 'role-employee',
};
