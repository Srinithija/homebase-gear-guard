import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addMaintenanceTask } from '@/utils/storage';
import { calculateReminderDate } from '@/utils/dateUtils';
import { useToast } from '@/hooks/use-toast';

interface AddMaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applianceId: string;
  onSuccess: () => void;
}

const AddMaintenanceDialog = ({ open, onOpenChange, applianceId, onSuccess }: AddMaintenanceDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    taskName: '',
    date: '',
    frequency: 'one-time' as const,
    serviceProviderName: '',
    serviceProviderContact: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.taskName.trim()) {
      newErrors.taskName = 'Task name is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.serviceProviderName.trim()) {
      newErrors.serviceProviderName = 'Service provider name is required';
    }
    if (!formData.serviceProviderContact.trim()) {
      newErrors.serviceProviderContact = 'Service provider contact is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const reminderDate = calculateReminderDate(formData.date, formData.frequency);
    
    try {
      addMaintenanceTask({
        applianceId,
        taskName: formData.taskName,
        date: formData.date,
        frequency: formData.frequency,
        serviceProviderName: formData.serviceProviderName,
        serviceProviderContact: formData.serviceProviderContact,
        reminderDate,
        completed: false,
      });

      toast({
        title: "Maintenance task added",
        description: `${formData.taskName} has been scheduled.`,
      });

      // Reset form
      setFormData({
        taskName: '',
        date: '',
        frequency: 'one-time',
        serviceProviderName: '',
        serviceProviderContact: '',
      });
      setErrors({});
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add maintenance task.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Maintenance Task</DialogTitle>
          <DialogDescription>
            Schedule a maintenance task for this appliance.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="taskName">Task Name *</Label>
            <Input
              id="taskName"
              value={formData.taskName}
              onChange={(e) => handleInputChange('taskName', e.target.value)}
              placeholder="e.g., Filter replacement, Deep cleaning"
              className={errors.taskName ? 'border-red-500' : ''}
            />
            {errors.taskName && <p className="text-sm text-red-500 mt-1">{errors.taskName}</p>}
          </div>

          <div>
            <Label htmlFor="date">Scheduled Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
          </div>

          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={formData.frequency} onValueChange={(value) => handleInputChange('frequency', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one-time">One-time</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="bi-yearly">Bi-yearly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="serviceProviderName">Service Provider Name *</Label>
            <Input
              id="serviceProviderName"
              value={formData.serviceProviderName}
              onChange={(e) => handleInputChange('serviceProviderName', e.target.value)}
              placeholder="e.g., ABC Appliance Service"
              className={errors.serviceProviderName ? 'border-red-500' : ''}
            />
            {errors.serviceProviderName && <p className="text-sm text-red-500 mt-1">{errors.serviceProviderName}</p>}
          </div>

          <div>
            <Label htmlFor="serviceProviderContact">Contact Information *</Label>
            <Input
              id="serviceProviderContact"
              value={formData.serviceProviderContact}
              onChange={(e) => handleInputChange('serviceProviderContact', e.target.value)}
              placeholder="Phone number or email"
              className={errors.serviceProviderContact ? 'border-red-500' : ''}
            />
            {errors.serviceProviderContact && <p className="text-sm text-red-500 mt-1">{errors.serviceProviderContact}</p>}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">Add Task</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMaintenanceDialog;