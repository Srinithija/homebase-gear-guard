import { z } from 'zod';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface FilterParams {
  search?: string;
  status?: 'all' | 'active' | 'expired' | 'expiring-soon';
}

export interface ApplianceStats {
  total: number;
  active: number;
  expiringSoon: number;
  expired: number;
}

export type FrequencyType = 'one-time' | 'yearly' | 'bi-yearly' | 'quarterly' | 'monthly';

// Zod Validation Schemas
export const ApplianceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  brand: z.string().min(1, 'Brand is required').max(255),
  model: z.string().min(1, 'Model is required').max(255),
  serialNumber: z.string().max(255).optional(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  warrantyPeriodMonths: z.number().int().positive('Warranty period must be positive'),
  warrantyExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  purchaseLocation: z.string().max(255).optional(),
  manualLink: z.string().url().optional().or(z.literal('')),
  receiptLink: z.string().url().optional().or(z.literal('')),
});

export const MaintenanceTaskSchema = z.object({
  applianceId: z.string().uuid('Invalid appliance ID'),
  taskName: z.string().min(1, 'Task name is required').max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  frequency: z.enum(['one-time', 'yearly', 'bi-yearly', 'quarterly', 'monthly']),
  serviceProviderName: z.string().min(1, 'Service provider name is required').max(255),
  serviceProviderContact: z.string().min(1, 'Service provider contact is required').max(255),
  reminderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  completed: z.boolean().default(false),
});

export const ContactSchema = z.object({
  applianceId: z.string().uuid('Invalid appliance ID'),
  contactName: z.string().min(1, 'Contact name is required').max(255),
  phone: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  notes: z.string().optional(),
});

export const UpdateApplianceSchema = ApplianceSchema.partial();
export const UpdateMaintenanceTaskSchema = MaintenanceTaskSchema.partial();
export const UpdateContactSchema = ContactSchema.partial();

// Parameter validation schemas
export const UUIDSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const QueryFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'expired', 'expiring-soon']).optional(),
  applianceId: z.string().uuid().optional(),
});

export type CreateApplianceInput = z.infer<typeof ApplianceSchema>;
export type CreateMaintenanceTaskInput = z.infer<typeof MaintenanceTaskSchema>;
export type CreateContactInput = z.infer<typeof ContactSchema>;
export type UpdateApplianceInput = z.infer<typeof UpdateApplianceSchema>;
export type UpdateMaintenanceTaskInput = z.infer<typeof UpdateMaintenanceTaskSchema>;
export type UpdateContactInput = z.infer<typeof UpdateContactSchema>;