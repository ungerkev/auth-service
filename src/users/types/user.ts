export type User = {
  id: string;
  email: string;
  emailVerified: boolean;
  password?: string | null;
  passwordRequired: boolean;
  lastLogin: Date | null;
  activeTenantId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
