export interface Appliance {
  id: string;
  name: string;
  brand: string;
  model: string;
  serialNumber?: string;
  purchaseDate: string;
  warrantyPeriodMonths: number;
  warrantyExpiry: string;
  purchaseLocation?: string;
  manualLink?: string;
  receiptLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceTask {
  id: string;
  applianceId: string;
  taskName: string;
  date: string;
  frequency: 'one-time' | 'yearly' | 'bi-yearly' | 'quarterly' | 'monthly';
  serviceProviderName: string;
  serviceProviderContact: string;
  reminderDate: string;
  completed: boolean;
  createdAt: string;
}

export interface Contact {
  id: string;
  applianceId: string;
  contactName: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export type FilterStatus = 'all' | 'active' | 'expired' | 'expiring-soon';