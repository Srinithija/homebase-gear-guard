import { pgTable, uuid, varchar, text, integer, timestamp, boolean, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Appliances table
export const appliances = pgTable('appliances', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  brand: varchar('brand', { length: 255 }).notNull(),
  model: varchar('model', { length: 255 }).notNull(),
  serialNumber: varchar('serial_number', { length: 255 }),
  purchaseDate: date('purchase_date').notNull(),
  warrantyPeriodMonths: integer('warranty_period_months').notNull(),
  warrantyExpiry: date('warranty_expiry').notNull(),
  purchaseLocation: varchar('purchase_location', { length: 255 }),
  manualLink: text('manual_link'),
  receiptLink: text('receipt_link'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Maintenance tasks table
export const maintenanceTasks = pgTable('maintenance_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  applianceId: uuid('appliance_id').notNull().references(() => appliances.id, { onDelete: 'cascade' }),
  taskName: varchar('task_name', { length: 255 }).notNull(),
  date: date('date').notNull(),
  frequency: varchar('frequency', { length: 50 }).notNull(), // 'one-time', 'yearly', 'bi-yearly', 'quarterly', 'monthly'
  serviceProviderName: varchar('service_provider_name', { length: 255 }).notNull(),
  serviceProviderContact: varchar('service_provider_contact', { length: 255 }).notNull(),
  reminderDate: date('reminder_date').notNull(),
  completed: boolean('completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Contacts table
export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  applianceId: uuid('appliance_id').notNull().references(() => appliances.id, { onDelete: 'cascade' }),
  contactName: varchar('contact_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const appliancesRelations = relations(appliances, ({ many }) => ({
  maintenanceTasks: many(maintenanceTasks),
  contacts: many(contacts),
}));

export const maintenanceTasksRelations = relations(maintenanceTasks, ({ one }) => ({
  appliance: one(appliances, {
    fields: [maintenanceTasks.applianceId],
    references: [appliances.id],
  }),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
  appliance: one(appliances, {
    fields: [contacts.applianceId],
    references: [appliances.id],
  }),
}));