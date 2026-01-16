import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Clock, Users, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useOrder } from "@/context/OrderContext";

interface Zone {
  id: string;
  name: string; // value to store
  label: string; // display label
}

export const CreateGroupOrder = () => {
  const [selectedZone, setSelectedZone] = useState('');
  const [duration, setDuration] = useState('2'); // hours
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useOrder();

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const { data, error } = await supabase.from('zones').select('*').order('name');
      if (error) throw error;

      if (data) {
        setZones(data.map(z => ({
          id: z.id,
          name: z.name,
          label: `${z.display_name_hi} / ${z.display_name_en}`
        })));
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
      // Fallback
      setZones([
        { id: 'A', name: 'Zone A', label: 'चांदनी चौक / Chandni Chowk' },
        { id: 'B', name: 'Zone B', label: 'करोल बाग / Karol Bagh' },
        { id: 'C', name: 'Zone C', label: 'लाजपत नगर / Lajpat Nagar' },
        { id: 'D', name: 'Zone D', label: 'गाजीपुर मंडी / Ghazipur Mandi' },
        { id: 'E', name: 'Zone E', label: 'साकेत / Saket' },
        { id: 'F', name: 'Zone F', label: 'द्वारका / Dwarka' },
      ]);
    }
  }

  const text = {
    hi: {
      title: "नया ग्रुप ऑर्डर बनाएं",
      subtitle: "वेंडर्स के लिए ग्रुप ऑर्डर शुरू करें",
      selectZone: "डिलीवरी जोन चुनें",
      duration: "ऑर्डर की अवधि (घंटे)",
      create: "ग्रुप ऑर्डर बनाएं",
      success: "ग्रुप ऑर्डर सफलतापूर्वक बनाया गया!"
    },
    en: {
      title: "Create New Group Order",
      subtitle: "Start a group order for vendors",
      selectZone: "Select Delivery Zone",
      duration: "Order Duration (Hours)",
      create: "Create Group Order",
      success: "Group order created successfully!"
    }
  };

  const t = text[language];

  const handleCreateOrder = async () => {
    if (!selectedZone || !userProfile?.id) {
      toast({
        title: language === 'hi' ? "त्रुटि" : "Error",
        description: language === 'hi' ?
          "कृपया एक ज़ोन चुनें" :
          "Please select a zone",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Verify supplier has items in inventory
      const { data: inventoryCheck, error: itemsCheckError } = await supabase
        .from('items')
        .select('id')
        .eq('supplier_id', userProfile.id);

      if (itemsCheckError) throw itemsCheckError;

      if (!inventoryCheck?.length) {
        toast({
          title: language === 'hi' ? "त्रुटि" : "Error",
          description: language === 'hi' ?
            "कृपया पहले अपनी इन्वेंटरी में आइटम जोड़ें" :
            "Please add items to your inventory first",
          variant: "destructive"
        });
        return;
      }

      // Create group order
      const closeAt = new Date();
      closeAt.setHours(closeAt.getHours() + parseInt(duration));

      const { data: groupOrder, error: groupError } = await supabase
        .from('group_orders')
        .insert([{
          supplier_id: userProfile.id,
          zone: selectedZone,
          close_at: closeAt.toISOString(),
          status: 'forming'
        }])
        .select()
        .single();

      if (groupError) throw groupError;

      // Get supplier's items and add them to group order
      const { data: supplierItems, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('supplier_id', userProfile.id);

      if (itemsError) throw itemsError;

      if (supplierItems && supplierItems.length > 0) {
        const groupOrderItems = supplierItems.map(item => ({
          group_order_id: groupOrder.id,
          item_id: item.id,
          name: item.name,
          price_per_kg: item.price_per_kg,
          total_qty: 0
        }));

        const { error: itemsInsertError } = await supabase
          .from('group_order_items')
          .insert(groupOrderItems);

        if (itemsInsertError) throw itemsInsertError;
      }

      toast({
        title: "Success",
        description: t.success,
      });

      navigate('/supplier/dashboard');
    } catch (error) {
      console.error('Error creating group order:', error);
      toast({
        title: "Error",
        description: "Failed to create group order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-fresh flex flex-col p-4 relative">
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <svg className="animate-spin h-10 w-10 text-primary" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      )}
      {/* Header */}
      <div className="bg-white shadow-card p-4">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={() => navigate('/supplier/dashboard')}
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
      <div className="p-4 space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Zone Selection */}
            <div className="space-y-2">
              <Label className="text-lg font-medium">{t.selectZone}</Label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="h-14">
                  <SelectValue placeholder="Select zone..." />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.name}>
                      {zone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-lg font-medium">{t.duration}</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="h-14">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Hour</SelectItem>
                  <SelectItem value="2">2 Hours</SelectItem>
                  <SelectItem value="4">4 Hours</SelectItem>
                  <SelectItem value="6">6 Hours</SelectItem>
                  <SelectItem value="12">12 Hours</SelectItem>
                  <SelectItem value="24">24 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-primary-soft/10">
                <div className="flex items-center">
                  <Clock className="w-6 h-6 text-primary mr-3" />
                  <div>
                    <div className="font-medium">Auto-Close</div>
                    <div className="text-sm text-muted-foreground">
                      {duration}h duration
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-success/10">
                <div className="flex items-center">
                  <Package className="w-6 h-6 text-success mr-3" />
                  <div>
                    <div className="font-medium">Items Ready</div>
                    <div className="text-sm text-muted-foreground">
                      From inventory
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        {/* Create Button */}
        <Button
          variant="mobile"
          size="mobile"
          className="w-full"
          onClick={handleCreateOrder}
          disabled={!selectedZone || loading}
        >
          <Users className="w-5 h-5 mr-2" />
          {loading ? "Creating..." : t.create}
        </Button>
      </div>
    </div>
  );
};