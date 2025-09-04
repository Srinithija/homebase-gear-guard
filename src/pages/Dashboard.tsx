import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Calendar, CheckCircle, Plus, Wrench } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAppliances, getMaintenanceTasks } from '@/utils/storage';
import { getWarrantyStatus, isExpiringSoon, formatDate } from '@/utils/dateUtils';
import { Appliance, MaintenanceTask } from '@/types/appliance';
import Navigation from '@/components/Navigation';

const Dashboard = () => {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);

  useEffect(() => {
    setAppliances(getAppliances());
    setMaintenanceTasks(getMaintenanceTasks());
  }, []);

  const warrantyStats = {
    active: appliances.filter(a => getWarrantyStatus(a.warrantyExpiry) === 'active').length,
    expiringSoon: appliances.filter(a => getWarrantyStatus(a.warrantyExpiry) === 'expiring-soon').length,
    expired: appliances.filter(a => getWarrantyStatus(a.warrantyExpiry) === 'expired').length,
  };

  const upcomingMaintenance = maintenanceTasks
    .filter(task => !task.completed && isExpiringSoon(task.reminderDate, 14))
    .sort((a, b) => new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime())
    .slice(0, 5);

  const recentAppliances = appliances
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your Home Appliance Tracker. Manage your appliances, warranties, and maintenance schedules.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appliances</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appliances.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Warranties</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{warrantyStats.active}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{warrantyStats.expiringSoon}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired Warranties</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{warrantyStats.expired}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Appliances */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Recent Appliances
              </CardTitle>
              <CardDescription>
                Your most recently added appliances
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentAppliances.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No appliances added yet</p>
                  <Button asChild>
                    <Link to="/add-appliance">Add Your First Appliance</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAppliances.map((appliance) => {
                    const status = getWarrantyStatus(appliance.warrantyExpiry);
                    return (
                      <div key={appliance.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{appliance.name}</p>
                          <p className="text-sm text-muted-foreground">{appliance.brand} {appliance.model}</p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              status === 'active' ? 'default' :
                              status === 'expiring-soon' ? 'destructive' : 'secondary'
                            }
                          >
                            {status === 'active' ? 'Active' :
                             status === 'expiring-soon' ? 'Expiring Soon' : 'Expired'}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Expires: {formatDate(appliance.warrantyExpiry)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/appliances">View All Appliances</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Maintenance
              </CardTitle>
              <CardDescription>
                Maintenance tasks due in the next 14 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingMaintenance.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming maintenance tasks</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingMaintenance.map((task) => {
                    const appliance = appliances.find(a => a.id === task.applianceId);
                    return (
                      <div key={task.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium">{task.taskName}</p>
                          <Badge variant="outline">{formatDate(task.reminderDate)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{appliance?.name}</p>
                        <p className="text-sm text-muted-foreground">{task.serviceProviderName}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;