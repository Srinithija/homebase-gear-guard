import { Appliance, MaintenanceTask, Contact } from '@/types/appliance';

const APPLIANCES_KEY = 'homebase_appliances';
const MAINTENANCE_KEY = 'homebase_maintenance';
const CONTACTS_KEY = 'homebase_contacts';

// Appliance storage functions
export const getAppliances = (): Appliance[] => {
  const data = localStorage.getItem(APPLIANCES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveAppliances = (appliances: Appliance[]): void => {
  localStorage.setItem(APPLIANCES_KEY, JSON.stringify(appliances));
};

export const addAppliance = (appliance: Omit<Appliance, 'id' | 'createdAt' | 'updatedAt'>): Appliance => {
  const appliances = getAppliances();
  const newAppliance: Appliance = {
    ...appliance,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  appliances.push(newAppliance);
  saveAppliances(appliances);
  return newAppliance;
};

export const updateAppliance = (id: string, updates: Partial<Appliance>): Appliance | null => {
  const appliances = getAppliances();
  const index = appliances.findIndex(a => a.id === id);
  if (index === -1) return null;
  
  appliances[index] = { ...appliances[index], ...updates, updatedAt: new Date().toISOString() };
  saveAppliances(appliances);
  return appliances[index];
};

export const deleteAppliance = (id: string): void => {
  const appliances = getAppliances().filter(a => a.id !== id);
  saveAppliances(appliances);
  
  // Also delete related maintenance tasks and contacts
  const maintenance = getMaintenanceTasks().filter(m => m.applianceId !== id);
  saveMaintenanceTasks(maintenance);
  
  const contacts = getContacts().filter(c => c.applianceId !== id);
  saveContacts(contacts);
};

// Maintenance task storage functions
export const getMaintenanceTasks = (): MaintenanceTask[] => {
  const data = localStorage.getItem(MAINTENANCE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveMaintenanceTasks = (tasks: MaintenanceTask[]): void => {
  localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(tasks));
};

export const addMaintenanceTask = (task: Omit<MaintenanceTask, 'id' | 'createdAt'>): MaintenanceTask => {
  const tasks = getMaintenanceTasks();
  const newTask: MaintenanceTask = {
    ...task,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  saveMaintenanceTasks(tasks);
  return newTask;
};

export const updateMaintenanceTask = (id: string, updates: Partial<MaintenanceTask>): MaintenanceTask | null => {
  const tasks = getMaintenanceTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  tasks[index] = { ...tasks[index], ...updates };
  saveMaintenanceTasks(tasks);
  return tasks[index];
};

export const deleteMaintenanceTask = (id: string): void => {
  const tasks = getMaintenanceTasks().filter(t => t.id !== id);
  saveMaintenanceTasks(tasks);
};

// Contact storage functions
export const getContacts = (): Contact[] => {
  const data = localStorage.getItem(CONTACTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveContacts = (contacts: Contact[]): void => {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
};

export const addContact = (contact: Omit<Contact, 'id' | 'createdAt'>): Contact => {
  const contacts = getContacts();
  const newContact: Contact = {
    ...contact,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  contacts.push(newContact);
  saveContacts(contacts);
  return newContact;
};

export const updateContact = (id: string, updates: Partial<Contact>): Contact | null => {
  const contacts = getContacts();
  const index = contacts.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  contacts[index] = { ...contacts[index], ...updates };
  saveContacts(contacts);
  return contacts[index];
};

export const deleteContact = (id: string): void => {
  const contacts = getContacts().filter(c => c.id !== id);
  saveContacts(contacts);
};