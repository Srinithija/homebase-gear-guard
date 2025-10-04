import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAppliances, deleteAppliance } from '@/utils/storage';
import { getWarrantyStatus, formatDate } from '@/utils/dateUtils';
import { Appliance, FilterStatus } from '@/types/appliance';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';

const Appliances = () => {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [filteredAppliances, setFilteredAppliances] = useState<Appliance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const { toast } = useToast();

  useEffect(() => {
    const loadAppliances = async () => {
      try {
        const loadedAppliances = await getAppliances();
        setAppliances(loadedAppliances);
        setFilteredAppliances(loadedAppliances);
      } catch (error) {
        console.error('Failed to load appliances:', error);
        toast({
          title: "Error",
          description: "Failed to load appliances.",
          variant: "destructive",
        });
      }
    };

    loadAppliances();
  }, []);

  useEffect(() => {
    let filtered = appliances.filter(appliance => {
      const searchMatch = 
        appliance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appliance.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appliance.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appliance.serialNumber && appliance.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!searchMatch) return false;

      if (filterStatus === 'all') return true;
      
      const warrantyStatus = getWarrantyStatus(appliance.warrantyExpiry);
      return warrantyStatus === filterStatus;
    });

    setFilteredAppliances(filtered);
  }, [appliances, searchTerm, filterStatus]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This will also delete all associated maintenance tasks and contacts.`)) {
      try {
        await deleteAppliance(id);
        const updatedAppliances = await getAppliances();
        setAppliances(updatedAppliances);
        toast({
          title: "Appliance deleted",
          description: `${name} has been successfully deleted.`,
        });
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'expiring-soon':
        return <Badge variant="destructive">Expiring Soon</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Appliances</h1>
              <p className="text-muted-foreground">
                Manage your home appliances and their warranties
              </p>
            </div>
            <Button asChild>
              <Link to="/add-appliance">
                <Plus className="w-4 h-4 mr-2" />
                Add Appliance
              </Link>
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, brand, model, or serial number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={(value: FilterStatus) => setFilterStatus(value)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Appliances</SelectItem>
                  <SelectItem value="active">Active Warranty</SelectItem>
                  <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired Warranty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appliances List */}
        {filteredAppliances.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              {appliances.length === 0 ? (
                <>
                  <h3 className="text-lg font-semibold mb-2">No appliances yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding your first appliance to track warranties and maintenance.
                  </p>
                  <Button asChild>
                    <Link to="/add-appliance">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Appliance
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-2">No matching appliances</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or filter criteria.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAppliances.map((appliance) => {
              const status = getWarrantyStatus(appliance.warrantyExpiry);
              return (
                <Card key={appliance.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{appliance.name}</CardTitle>
                        <CardDescription>
                          {appliance.brand} {appliance.model}
                        </CardDescription>
                      </div>
                      {getStatusBadge(status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Purchase Date:</span>
                        <span className="ml-2 text-muted-foreground">
                          {formatDate(appliance.purchaseDate)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Warranty Expires:</span>
                        <span className="ml-2 text-muted-foreground">
                          {formatDate(appliance.warrantyExpiry)}
                        </span>
                      </div>
                      {appliance.serialNumber && (
                        <div>
                          <span className="font-medium">Serial:</span>
                          <span className="ml-2 text-muted-foreground font-mono text-xs">
                            {appliance.serialNumber}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link to={`/appliance/${appliance.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link to={`/edit-appliance/${appliance.id}`}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(appliance.id, appliance.name)}
                        className="px-3"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Appliances;