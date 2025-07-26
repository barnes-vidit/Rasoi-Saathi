import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Star, Truck, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import vendorIcon from "@/assets/vendor-icon.jpg";

interface Supplier {
  id: string;
  name: string;
  phone: string;
  delivery_zones: string[];
  created_at: string;
}

interface VendorSelectionProps {
  language: 'hi' | 'en';
  onBack: () => void;
  onVendorSelect: (supplierId: string) => void;
}

export const VendorSelection = ({ language, onBack, onVendorSelect }: VendorSelectionProps) => {
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const text = {
    hi: {
      title: "होलसेल वेंडर चुनें",
      subtitle: "अपने एरिया के बेस्ट वेंडर से खरीदें",
      selectVendor: "वेंडर चुनें",
      rating: "रेटिंग",
      deliveryTime: "डिलीवरी टाइम",
      specialties: "स्पेशैलिटी",
      continue: "आगे बढ़ें",
      vegetables: "सब्जियां",
      grains: "अनाज",
      spices: "मसाले",
      oil: "तेल"
    },
    en: {
      title: "Choose Wholesale Vendor",
      subtitle: "Buy from the best vendors in your area",
      selectVendor: "Select Vendor",
      rating: "Rating",
      deliveryTime: "Delivery",
      specialties: "Specialties",
      continue: "Continue",
      vegetables: "Vegetables",
      grains: "Grains", 
      spices: "Spices",
      oil: "Oil"
    }
  };

  const t = text[language];

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch suppliers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierSelect = (supplierId: string) => {
    setSelectedSupplier(supplierId);
  };

  const handleContinue = () => {
    if (selectedSupplier) {
      onVendorSelect(selectedSupplier);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-fresh flex items-center justify-center">
        <div className="text-lg">Loading suppliers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-fresh">
      {/* Header */}
      <div className="bg-white shadow-card p-4">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="icon-lg"
            onClick={onBack}
            className="mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <div className="text-lg font-bold text-primary mb-1">RasoiLink</div>
            <h1 className="text-2xl font-bold text-foreground">
              {t.title}
            </h1>
            <p className="text-muted-foreground">
              {t.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Supplier List */}
        <div className="space-y-4">
          {suppliers.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">No suppliers available</p>
            </div>
          ) : (
            suppliers.map((supplier) => (
              <Card 
                key={supplier.id} 
                className={`p-4 shadow-card cursor-pointer transition-all ${
                  selectedSupplier === supplier.id 
                    ? 'ring-2 ring-primary bg-primary-soft/20' 
                    : 'hover:shadow-floating'
                }`}
                onClick={() => handleSupplierSelect(supplier.id)}
              >
                <div className="flex items-start space-x-4">
                  {/* Supplier Image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img 
                      src={vendorIcon} 
                      alt={supplier.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Supplier Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-foreground truncate">
                          {supplier.name}
                        </h3>
                        
                        <div className="flex items-center text-muted-foreground text-sm mb-2">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{supplier.phone}</span>
                        </div>
                      </div>

                      {selectedSupplier === supplier.id && (
                        <Badge variant="default" className="ml-2">
                          Selected
                        </Badge>
                      )}
                    </div>

                    {/* Delivery Zones */}
                    <div className="flex flex-wrap gap-2">
                      {supplier.delivery_zones.slice(0, 3).map((zone, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {zone}
                        </Badge>
                      ))}
                      {supplier.delivery_zones.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{supplier.delivery_zones.length - 3} more zones
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Continue Button */}
        <div className="sticky bottom-4 pt-4">
          <Button 
            variant="mobile"
            size="mobile"
            className="w-full"
            onClick={handleContinue}
            disabled={!selectedSupplier}
          >
            <Truck className="w-5 h-5 mr-2" />
            {t.continue}
          </Button>
        </div>
      </div>
    </div>
  );
};