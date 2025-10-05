import { Appliance, MaintenanceTask, Contact } from '@/types/appliance';
import { apiClient } from './api';

// Fallback localStorage functions (for development/offline mode)
const APPLIANCES_KEY = 'homebase_appliances';
const MAINTENANCE_KEY = 'homebase_maintenance';
const CONTACTS_KEY = 'homebase_contacts';

// Check if we should use API or localStorage
// Enhanced logic to detect API unavailability and auto-fallback
const useAPI = (() => {
  // Check if we're in development
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Check for immediate fallback triggers
  const shouldUseFallback = (() => {
    try {
      // Check if we've detected API issues recently
      const lastApiCheck = localStorage.getItem('homebase_last_api_check');
      const lastApiStatus = localStorage.getItem('homebase_api_status');
      
      if (lastApiCheck && lastApiStatus === 'unavailable') {
        const checkTime = new Date(lastApiCheck);
        const now = new Date();
        // If API was unavailable in the last 5 minutes, stay in fallback mode
        if ((now.getTime() - checkTime.getTime()) < 5 * 60 * 1000) {
          console.log('💾 Recent API failure detected - staying in fallback mode');
          return true;
        }
      }
      
      // Quick check for obvious API URL issues
      const apiUrl = import.meta.env.VITE_API_URL || 
        (isDev ? 'http://localhost:3001/api' : 'https://homebase-gear-guard.onrender.com/api');
      
      console.log('🔍 Checking API configuration...');
      console.log('Current hostname:', window.location.hostname);
      console.log('Intended API URL:', apiUrl);
      
      // If production is trying to use localhost, force localStorage mode
      if (!isDev && apiUrl.includes('localhost')) {
        console.warn('⚠️ Production detected with localhost API URL - forcing localStorage mode');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking API config:', error);
      return true;
    }
  })();
  
  if (shouldUseFallback) {
    console.log('💾 Using localStorage fallback mode due to API issues');
    return false;
  }
  
  console.log('🌐 Attempting API mode with auto-fallback');
  return true;
})();

// Helper function to check if error indicates API unavailability
const isConnectionError = (error: any): boolean => {
  if (!error || typeof error !== 'object') return false;
  const message = error.message || '';
  
  // Check for various connection issues including our enhanced error messages
  return message.includes('Tenant or user not found') || 
         message.includes('ENETUNREACH') || 
         message.includes('connection refused') ||
         message.includes('timeout') ||
         message.includes('Failed to fetch') ||
         message.includes('Content Security Policy') ||
         message.includes('CSP') ||
         message.includes('503') ||
         message.includes('Service Unavailable') ||
         message.includes('Database unavailable') ||
         message.includes('violates the following Content Security Policy directive');
};

// Function to record API failure and switch to fallback mode
const recordApiFailure = () => {
  localStorage.setItem('homebase_last_api_check', new Date().toISOString());
  localStorage.setItem('homebase_api_status', 'unavailable');
  console.log('💾 API failure recorded - switching to localStorage mode');
};

// Function to record API success
const recordApiSuccess = () => {
  localStorage.setItem('homebase_last_api_check', new Date().toISOString());
  localStorage.setItem('homebase_api_status', 'available');
  console.log('✅ API success recorded');
};

// Appliance storage functions with enhanced fallback
export const getAppliances = async (): Promise<Appliance[]> => {
  if (useAPI) {
    try {
      console.log('🔄 Fetching appliances from API...');
      const result = await apiClient.get<Appliance[]>('/appliances');
      console.log('✅ API call successful:', result);
      recordApiSuccess();
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch appliances from API:', error);
      
      // Record API failure for future fallback decisions
      recordApiFailure();
      
      // If it's a connection error, provide specific guidance and fallback
      if (isConnectionError(error)) {
        console.log('💾 API unavailable - falling back to localStorage automatically');
        const localData = localStorage.getItem(APPLIANCES_KEY);
        return localData ? JSON.parse(localData) : [];
      }
      
      // For other errors, provide general error message and fallback
      console.log('💾 Unknown API error - falling back to localStorage');
      const localData = localStorage.getItem(APPLIANCES_KEY);
      return localData ? JSON.parse(localData) : [];
    }
  } else {
    console.log('💾 Using localStorage mode');
    const data = localStorage.getItem(APPLIANCES_KEY);
    return data ? JSON.parse(data) : [];
  }
};

export const saveAppliances = (appliances: Appliance[]): void => {
  if (!useAPI) {
    localStorage.setItem(APPLIANCES_KEY, JSON.stringify(appliances));
  }
  // When using API, this function is not needed as data is saved on server
};

export const addAppliance = async (appliance: Omit<Appliance, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appliance> => {
  if (useAPI) {
    try {
      return await apiClient.post<Appliance>('/appliances', appliance);
    } catch (error) {
      console.error('Failed to create appliance via API:', error);
      
      // If it's a connection error (including CSP violations), throw specific error
      if (isConnectionError(error)) {
        throw new Error('🚨 Cannot save data - Connection failed. Using localStorage mode instead.');
      }
      
      // For other errors, fall back to localStorage
      console.warn('Falling back to localStorage due to API error');
      return addApplianceLocal(appliance);
    }
  } else {
    return addApplianceLocal(appliance);
  }
};

// Local localStorage version for fallback
const addApplianceLocal = (appliance: Omit<Appliance, 'id' | 'createdAt' | 'updatedAt'>): Appliance => {
  const data = localStorage.getItem(APPLIANCES_KEY);
  const appliances = data ? JSON.parse(data) : [];
  const newAppliance: Appliance = {
    ...appliance,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  appliances.push(newAppliance);
  localStorage.setItem(APPLIANCES_KEY, JSON.stringify(appliances));
  return newAppliance;
};

export const updateAppliance = async (id: string, updates: Partial<Appliance>): Promise<Appliance | null> => {
  if (useAPI) {
    try {
      return await apiClient.put<Appliance>(`/appliances/${id}`, updates);
    } catch (error) {
      console.error('Failed to update appliance via API, falling back to localStorage:', error);
      // Fallback to localStorage
      return updateApplianceLocal(id, updates);
    }
  } else {
    return updateApplianceLocal(id, updates);
  }
};

// Local localStorage version for fallback
const updateApplianceLocal = (id: string, updates: Partial<Appliance>): Appliance | null => {
  const data = localStorage.getItem(APPLIANCES_KEY);
  const appliances = data ? JSON.parse(data) : [];
  const index = appliances.findIndex((a: Appliance) => a.id === id);
  if (index === -1) return null;
  
  appliances[index] = { ...appliances[index], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(APPLIANCES_KEY, JSON.stringify(appliances));
  return appliances[index];
};

export const deleteAppliance = async (id: string): Promise<void> => {
  if (useAPI) {
    try {
      await apiClient.delete(`/appliances/${id}`);
      return;
    } catch (error) {
      console.error('Failed to delete appliance via API, falling back to localStorage:', error);
      // Fallback to localStorage
      deleteApplianceLocal(id);
    }
  } else {
    deleteApplianceLocal(id);
  }
};

// Local localStorage version for fallback
const deleteApplianceLocal = (id: string): void => {
  const data = localStorage.getItem(APPLIANCES_KEY);
  const appliances = data ? JSON.parse(data) : [];
  const filteredAppliances = appliances.filter((a: Appliance) => a.id !== id);
  localStorage.setItem(APPLIANCES_KEY, JSON.stringify(filteredAppliances));
  
  // Also delete related maintenance tasks and contacts
  const maintenanceData = localStorage.getItem(MAINTENANCE_KEY);
  const maintenance = maintenanceData ? JSON.parse(maintenanceData) : [];
  const filteredMaintenance = maintenance.filter((m: MaintenanceTask) => m.applianceId !== id);
  localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(filteredMaintenance));
  
  const contactsData = localStorage.getItem(CONTACTS_KEY);
  const contacts = contactsData ? JSON.parse(contactsData) : [];
  const filteredContacts = contacts.filter((c: Contact) => c.applianceId !== id);
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(filteredContacts));
};

// Maintenance task storage functions with enhanced fallback
export const getMaintenanceTasks = async (): Promise<MaintenanceTask[]> => {
  if (useAPI) {
    try {
      console.log('🔄 Fetching maintenance tasks from API...');
      const result = await apiClient.get<MaintenanceTask[]>('/maintenance');
      console.log('✅ Maintenance API call successful:', result);
      recordApiSuccess();
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch maintenance tasks from API:', error);
      
      // Record API failure and fallback to localStorage
      recordApiFailure();
      
      console.log('💾 Maintenance API unavailable - falling back to localStorage');
      const data = localStorage.getItem(MAINTENANCE_KEY);
      return data ? JSON.parse(data) : [];
    }
  } else {
    console.log('💾 Using localStorage for maintenance tasks');
    const data = localStorage.getItem(MAINTENANCE_KEY);
    return data ? JSON.parse(data) : [];
  }
};

export const saveMaintenanceTasks = (tasks: MaintenanceTask[]): void => {
  if (!useAPI) {
    localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(tasks));
  }
  // When using API, this function is not needed as data is saved on server
};

export const addMaintenanceTask = async (task: Omit<MaintenanceTask, 'id' | 'createdAt'>): Promise<MaintenanceTask> => {
  if (useAPI) {
    try {
      return await apiClient.post<MaintenanceTask>('/maintenance', task);
    } catch (error) {
      console.error('Failed to create maintenance task via API, falling back to localStorage:', error);
      // Fallback to localStorage
      return addMaintenanceTaskLocal(task);
    }
  } else {
    return addMaintenanceTaskLocal(task);
  }
};

// Local localStorage version for fallback
const addMaintenanceTaskLocal = (task: Omit<MaintenanceTask, 'id' | 'createdAt'>): MaintenanceTask => {
  const data = localStorage.getItem(MAINTENANCE_KEY);
  const tasks = data ? JSON.parse(data) : [];
  const newTask: MaintenanceTask = {
    ...task,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(tasks));
  return newTask;
};

export const updateMaintenanceTask = async (id: string, updates: Partial<MaintenanceTask>): Promise<MaintenanceTask | null> => {
  if (useAPI) {
    try {
      return await apiClient.put<MaintenanceTask>(`/maintenance/${id}`, updates);
    } catch (error) {
      console.error('Failed to update maintenance task via API, falling back to localStorage:', error);
      // Fallback to localStorage
      return updateMaintenanceTaskLocal(id, updates);
    }
  } else {
    return updateMaintenanceTaskLocal(id, updates);
  }
};

// Local localStorage version for fallback
const updateMaintenanceTaskLocal = (id: string, updates: Partial<MaintenanceTask>): MaintenanceTask | null => {
  const data = localStorage.getItem(MAINTENANCE_KEY);
  const tasks = data ? JSON.parse(data) : [];
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  tasks[index] = { ...tasks[index], ...updates };
  localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(tasks));
  return tasks[index];
};

export const deleteMaintenanceTask = async (id: string): Promise<void> => {
  if (useAPI) {
    try {
      await apiClient.delete(`/maintenance/${id}`);
      return;
    } catch (error) {
      console.error('Failed to delete maintenance task via API, falling back to localStorage:', error);
      // Fallback to localStorage
      deleteMaintenanceTaskLocal(id);
    }
  } else {
    deleteMaintenanceTaskLocal(id);
  }
};

// Local localStorage version for fallback
const deleteMaintenanceTaskLocal = (id: string): void => {
  const data = localStorage.getItem(MAINTENANCE_KEY);
  const tasks = data ? JSON.parse(data) : [];
  const filteredTasks = tasks.filter(t => t.id !== id);
  localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(filteredTasks));
};

// Contact storage functions
export const getContacts = async (): Promise<Contact[]> => {
  if (useAPI) {
    try {
      return await apiClient.get<Contact[]>('/contacts');
    } catch (error) {
      console.error('Failed to fetch contacts from API, falling back to localStorage:', error);
      // Fallback to localStorage
      const data = localStorage.getItem(CONTACTS_KEY);
      return data ? JSON.parse(data) : [];
    }
  } else {
    const data = localStorage.getItem(CONTACTS_KEY);
    return data ? JSON.parse(data) : [];
  }
};

export const saveContacts = (contacts: Contact[]): void => {
  if (!useAPI) {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  }
  // When using API, this function is not needed as data is saved on server
};

export const addContact = async (contact: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact> => {
  if (useAPI) {
    try {
      return await apiClient.post<Contact>('/contacts', contact);
    } catch (error) {
      console.error('Failed to create contact via API, falling back to localStorage:', error);
      // Fallback to localStorage
      return addContactLocal(contact);
    }
  } else {
    return addContactLocal(contact);
  }
};

// Local localStorage version for fallback
const addContactLocal = (contact: Omit<Contact, 'id' | 'createdAt'>): Contact => {
  const data = localStorage.getItem(CONTACTS_KEY);
  const contacts = data ? JSON.parse(data) : [];
  const newContact: Contact = {
    ...contact,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  contacts.push(newContact);
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  return newContact;
};

export const updateContact = async (id: string, updates: Partial<Contact>): Promise<Contact | null> => {
  if (useAPI) {
    try {
      return await apiClient.put<Contact>(`/contacts/${id}`, updates);
    } catch (error) {
      console.error('Failed to update contact via API, falling back to localStorage:', error);
      // Fallback to localStorage
      return updateContactLocal(id, updates);
    }
  } else {
    return updateContactLocal(id, updates);
  }
};

// Local localStorage version for fallback
const updateContactLocal = (id: string, updates: Partial<Contact>): Contact | null => {
  const data = localStorage.getItem(CONTACTS_KEY);
  const contacts = data ? JSON.parse(data) : [];
  const index = contacts.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  contacts[index] = { ...contacts[index], ...updates };
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  return contacts[index];
};

export const deleteContact = async (id: string): Promise<void> => {
  if (useAPI) {
    try {
      await apiClient.delete(`/contacts/${id}`);
      return;
    } catch (error) {
      console.error('Failed to delete contact via API, falling back to localStorage:', error);
      // Fallback to localStorage
      deleteContactLocal(id);
    }
  } else {
    deleteContactLocal(id);
  }
};

// Local localStorage version for fallback
const deleteContactLocal = (id: string): void => {
  const data = localStorage.getItem(CONTACTS_KEY);
  const contacts = data ? JSON.parse(data) : [];
  const filteredContacts = contacts.filter(c => c.id !== id);
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(filteredContacts));
};