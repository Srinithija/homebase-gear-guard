import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Plus, Calendar, Phone, Mail, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAppliances, getMaintenanceTasks, getContacts, deleteAppliance, updateMaintenanceTask } from '@/utils/storage';
import { getWarrantyStatus, formatDate } from '@/utils/dateUtils';
import { Appliance, MaintenanceTask, Contact } from '@/types/appliance';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import AddMaintenanceDialog from '@/components/AddMaintenanceDialog';
import AddContactDialog from '@/components/AddContactDialog';

const ApplianceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [appliance, setAppliance] = useState<Appliance | null>(null);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);

  useEffect(() => {
    const loadApplianceData = async () => {
      if (!id) return;
      
      try {
        const appliances = await getAppliances();
        const foundAppliance = appliances.find(a => a.id === id);
        
        if (!foundAppliance) {
          navigate('/appliances');
          return;
        }
        
        setAppliance(foundAppliance);
        
        const [tasks, applianceContacts] = await Promise.all([
          getMaintenanceTasks(),
          getContacts()
        ]);
        
        setMaintenanceTasks(tasks.filter(t => t.applianceId === id));
        setContacts(applianceContacts.filter(c => c.applianceId === id));
      } catch (error) {
        console.error('Failed to load appliance data:', error);
        toast({
          title: "Error",
          description: "Failed to load appliance data.",
          variant: "destructive",
        });
      }
    };

    loadApplianceData();
  }, [id, navigate, toast]);

  const handleDelete = async () => {
    if (!appliance) return;
    
    if (window.confirm(`Are you sure you want to delete "${appliance.name}"? This will also delete all associated maintenance tasks and contacts.`)) {
      try {
        await deleteAppliance(appliance.id);
        toast({
          title: "Appliance deleted",
          description: `${appliance.name} has been successfully deleted.`,
        });
        navigate('/appliances');
      } catch (error) {
        console.error('Failed to delete appliance:', error);
        toast({
          title: "Error",
          description: "Failed to delete appliance.",
          variant: "destructive",
        });
      }
    }
  };

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      await updateMaintenanceTask(taskId, { completed });
      if (id) {
        const tasks = await getMaintenanceTasks();
        setMaintenanceTasks(tasks.filter(t => t.applianceId === id));
      }
      toast({
        title: completed ? "Task completed" : "Task marked as pending",
        description: "Maintenance task status updated.",
      });
    } catch (error) {
      console.error('Failed to update maintenance task:', error);
      toast({
        title: "Error",
        description: "Failed to update maintenance task.",
        variant: "destructive",
      });
    }
  };

  const refreshData = async () => {
    if (!id) return;
    try {
      const [tasks, applianceContacts] = await Promise.all([
        getMaintenanceTasks(),
        getContacts()
      ]);
      setMaintenanceTasks(tasks.filter(t => t.applianceId === id));
      setContacts(applianceContacts.filter(c => c.applianceId === id));
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  if (!appliance) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Loading appliance details...</p>
          </div>
        </div>
      </div>
    );
  }

  const warrantyStatus = getWarrantyStatus(appliance.warrantyExpiry);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active Warranty</Badge>;
      case 'expiring-soon':
        return <Badge variant="destructive">Warranty Expiring Soon</Badge>;
      case 'expired':
        return <Badge variant="secondary">Warranty Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown Status</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/appliances')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Appliances
          </Button>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{appliance.name}</h1>
              <p className="text-muted-foreground">{appliance.brand} {appliance.model}</p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to={`/edit-appliance/${appliance.id}`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">Brand & Model</p>
                <p className="text-muted-foreground">{appliance.brand} {appliance.model}</p>
              </div>
              {appliance.serialNumber && (
                <div>
                  <p className="font-medium">Serial Number</p>
                  <p className="text-muted-foreground font-mono text-sm">{appliance.serialNumber}</p>
                </div>
              )}
              <div>
                <p className="font-medium">Purchase Date</p>
                <p className="text-muted-foreground">{formatDate(appliance.purchaseDate)}</p>
              </div>
              {appliance.purchaseLocation && (
                <div>
                  <p className="font-medium">Purchase Location</p>
                  <p className="text-muted-foreground">{appliance.purchaseLocation}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Warranty Information */}
          <Card>
            <CardHeader>
              <CardTitle>Warranty Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="font-medium">Status</p>
                {getStatusBadge(warrantyStatus)}
              </div>
              <div>
                <p className="font-medium">Period</p>
                <p className="text-muted-foreground">{appliance.warrantyPeriodMonths} months</p>
              </div>
              <div>
                <p className="font-medium">Expires On</p>
                <p className="text-muted-foreground">{formatDate(appliance.warrantyExpiry)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {appliance.manualLink && (
                <Button asChild variant="outline" size="sm" className="w-full justify-start">
                  <a href={appliance.manualLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Manual
                  </a>
                </Button>
              )}
              {appliance.receiptLink && (
                <Button asChild variant="outline" size="sm" className="w-full justify-start">
                  <a href={appliance.receiptLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Receipt
                  </a>
                </Button>
              )}
              {!appliance.manualLink && !appliance.receiptLink && (
                <p className="text-sm text-muted-foreground">No links available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Maintenance and Contacts */}
        <Card>
          <Tabs defaultValue="maintenance" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="maintenance">Maintenance Tasks</TabsTrigger>
                <TabsTrigger value="contacts">Service Contacts</TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <TabsContent value="maintenance">
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <CardDescription>
                    Track maintenance schedules and service history
                  </CardDescription>
                  <Button onClick={() => setShowMaintenanceDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </div>
                
                {maintenanceTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No maintenance tasks scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {maintenanceTasks.map((task) => (
                      <div key={task.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{task.taskName}</h4>
                            <Badge variant={task.completed ? "default" : "secondary"}>
                              {task.completed ? "Completed" : "Pending"}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTaskComplete(task.id, !task.completed)}
                          >
                            {task.completed ? <Clock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Date:</span> {formatDate(task.date)}
                          </div>
                          <div>
                            <span className="font-medium">Frequency:</span> {task.frequency}
                          </div>
                          <div>
                            <span className="font-medium">Next:</span> {formatDate(task.reminderDate)}
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="font-medium text-sm">Service Provider:</span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            {task.serviceProviderName} - {task.serviceProviderContact}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </TabsContent>

            <TabsContent value="contacts">
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <CardDescription>
                    Store service provider and warranty contact information
                  </CardDescription>
                  <Button onClick={() => setShowContactDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
                
                {contacts.length === 0 ? (
                  <div className="text-center py-8">
                    <Phone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No service contacts added</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contacts.map((contact) => (
                      <div key={contact.id} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{contact.contactName}</h4>
                        <div className="space-y-2">
                          {contact.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <a href={`tel:${contact.phone}`} className="text-sm hover:underline">
                                {contact.phone}
                              </a>
                            </div>
                          )}
                          {contact.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <a href={`mailto:${contact.email}`} className="text-sm hover:underline">
                                {contact.email}
                              </a>
                            </div>
                          )}
                          {contact.notes && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground">{contact.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Dialogs */}
        <AddMaintenanceDialog
          open={showMaintenanceDialog}
          onOpenChange={setShowMaintenanceDialog}
          applianceId={appliance.id}
          onSuccess={refreshData}
        />
        
        <AddContactDialog
          open={showContactDialog}
          onOpenChange={setShowContactDialog}
          applianceId={appliance.id}
          onSuccess={refreshData}
        />
      </main>
    </div>
  );
};

export default ApplianceDetail;