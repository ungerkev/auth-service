export type Tenant = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeSubscriptionCancelAt: Date | null;
};
