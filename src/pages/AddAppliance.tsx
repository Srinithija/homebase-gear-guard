import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addAppliance, updateAppliance, getAppliances } from '@/utils/storage';
import { calculateWarrantyExpiry } from '@/utils/dateUtils';
import { Appliance } from '@/types/appliance';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';

const AddAppliance = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    warrantyPeriodMonths: 12,
    purchaseLocation: '',
    manualLink: '',
    receiptLink: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadApplianceData = async () => {
      if (isEditing && id) {
        try {
          const appliances = await getAppliances();
          const appliance = appliances.find(a => a.id === id);
          if (appliance) {
            setFormData({
              name: appliance.name,
              brand: appliance.brand,
              model: appliance.model,
              serialNumber: appliance.serialNumber || '',
              purchaseDate: appliance.purchaseDate,
              warrantyPeriodMonths: appliance.warrantyPeriodMonths,
              purchaseLocation: appliance.purchaseLocation || '',
              manualLink: appliance.manualLink || '',
              receiptLink: appliance.receiptLink || '',
            });
          } else {
            navigate('/appliances');
          }
        } catch (error) {
          console.error('Error loading appliance data:', error);
          toast({
            title: "Error",
            description: "Failed to load appliance data.",
            variant: "destructive",
          });
          navigate('/appliances');
        }
      }
    };

    loadApplianceData();
  }, [isEditing, id, navigate, toast]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Appliance name is required';
    }
    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }
    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    } else if (new Date(formData.purchaseDate) > new Date()) {
      newErrors.purchaseDate = 'Purchase date cannot be in the future';
    }
    if (formData.warrantyPeriodMonths < 0) {
      newErrors.warrantyPeriodMonths = 'Warranty period cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const warrantyExpiry = calculateWarrantyExpiry(formData.purchaseDate, formData.warrantyPeriodMonths);
    
    try {
      if (isEditing && id) {
        const updatedAppliance = await updateAppliance(id, {
          ...formData,
          warrantyExpiry,
        });
        if (updatedAppliance) {
          toast({
            title: "Appliance updated",
            description: `${formData.name} has been successfully updated.`,
          });
          navigate('/appliances');
        }
      } else {
        const newAppliance = await addAppliance({
          ...formData,
          warrantyExpiry,
        });
        toast({
          title: "Appliance added",
          description: `${formData.name} has been successfully added.`,
        });
        navigate('/appliances');
      }
    } catch (error) {
      console.error('Error saving appliance:', error);
      toast({
        title: "Error",
        description: "An error occurred while saving the appliance.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate('/appliances')} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Appliances
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isEditing ? 'Edit Appliance' : 'Add New Appliance'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update appliance information' : 'Enter the details of your new appliance'}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Appliance Information</CardTitle>
              <CardDescription>
                Fill in the details below. Required fields are marked with an asterisk (*).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Appliance Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Kitchen Refrigerator"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="brand">Brand *</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      placeholder="e.g., Samsung"
                      className={errors.brand ? 'border-red-500' : ''}
                    />
                    {errors.brand && <p className="text-sm text-red-500 mt-1">{errors.brand}</p>}
                  </div>

                  <div>
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      placeholder="e.g., RF28R7351SG"
                      className={errors.model ? 'border-red-500' : ''}
                    />
                    {errors.model && <p className="text-sm text-red-500 mt-1">{errors.model}</p>}
                  </div>

                  <div>
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input
                      id="serialNumber"
                      value={formData.serialNumber}
                      onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {/* Purchase & Warranty Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purchaseDate">Purchase Date *</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                      className={errors.purchaseDate ? 'border-red-500' : ''}
                    />
                    {errors.purchaseDate && <p className="text-sm text-red-500 mt-1">{errors.purchaseDate}</p>}
                  </div>

                  <div>
                    <Label htmlFor="warrantyPeriodMonths">Warranty Period (months) *</Label>
                    <Input
                      id="warrantyPeriodMonths"
                      type="number"
                      min="0"
                      value={formData.warrantyPeriodMonths}
                      onChange={(e) => handleInputChange('warrantyPeriodMonths', parseInt(e.target.value) || 0)}
                      className={errors.warrantyPeriodMonths ? 'border-red-500' : ''}
                    />
                    {errors.warrantyPeriodMonths && <p className="text-sm text-red-500 mt-1">{errors.warrantyPeriodMonths}</p>}
                  </div>
                </div>

                {/* Optional Information */}
                <div>
                  <Label htmlFor="purchaseLocation">Purchase Location</Label>
                  <Input
                    id="purchaseLocation"
                    value={formData.purchaseLocation}
                    onChange={(e) => handleInputChange('purchaseLocation', e.target.value)}
                    placeholder="e.g., Best Buy, Amazon"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="manualLink">Manual URL</Label>
                    <Input
                      id="manualLink"
                      type="url"
                      value={formData.manualLink}
                      onChange={(e) => handleInputChange('manualLink', e.target.value)}
                      placeholder="https://example.com/manual.pdf"
                    />
                  </div>

                  <div>
                    <Label htmlFor="receiptLink">Receipt URL</Label>
                    <Input
                      id="receiptLink"
                      type="url"
                      value={formData.receiptLink}
                      onChange={(e) => handleInputChange('receiptLink', e.target.value)}
                      placeholder="https://example.com/receipt.pdf"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    {isEditing ? 'Update Appliance' : 'Add Appliance'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/appliances')}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AddAppliance;