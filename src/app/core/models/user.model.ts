export type Role = 'admin' | 'vendedor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  token: string;
  isActive: boolean;
  lastLogin: Date | null;
}
