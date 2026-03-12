import type { UserRole } from './auth';

export interface UserItem {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  isActive: boolean;
}

export interface CreateUserRequest {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId?: string;
}
