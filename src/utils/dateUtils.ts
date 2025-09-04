export const calculateWarrantyExpiry = (purchaseDate: string, warrantyMonths: number): string => {
  const purchase = new Date(purchaseDate);
  const expiry = new Date(purchase);
  expiry.setMonth(expiry.getMonth() + warrantyMonths);
  return expiry.toISOString().split('T')[0];
};

export const calculateReminderDate = (date: string, frequency: string): string => {
  const baseDate = new Date(date);
  const reminderDate = new Date(baseDate);
  
  switch (frequency) {
    case 'monthly':
      reminderDate.setMonth(reminderDate.getMonth() + 1);
      break;
    case 'quarterly':
      reminderDate.setMonth(reminderDate.getMonth() + 3);
      break;
    case 'bi-yearly':
      reminderDate.setMonth(reminderDate.getMonth() + 6);
      break;
    case 'yearly':
      reminderDate.setFullYear(reminderDate.getFullYear() + 1);
      break;
    default: // one-time
      return date;
  }
  
  return reminderDate.toISOString().split('T')[0];
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString();
};

export const isExpiringSoon = (date: string, days: number = 30): boolean => {
  const expiry = new Date(date);
  const soon = new Date();
  soon.setDate(soon.getDate() + days);
  return expiry <= soon && expiry >= new Date();
};

export const isExpired = (date: string): boolean => {
  return new Date(date) < new Date();
};

export const getWarrantyStatus = (expiryDate: string): 'active' | 'expired' | 'expiring-soon' => {
  if (isExpired(expiryDate)) return 'expired';
  if (isExpiringSoon(expiryDate)) return 'expiring-soon';
  return 'active';
};