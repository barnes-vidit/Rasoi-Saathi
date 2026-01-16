import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Package,
  CheckCircle,
  Truck
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useOrder } from "@/context/OrderContext";

interface GroupOrderItem {
  name: string;
  quantity: number;
  unit: string;
}

interface GroupOrder {
  id: string;
  area: string;
  items: GroupOrderItem[];
  vendorCount: number;
  scheduledTime: string;
  totalValue: number;
  status: 'forming' | 'closed' | 'accepted' | 'dispatched';
}

export const IncomingGroupOrders = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const navigate = useNavigate();
  const { language } = useOrder();

  // Translation text
  const text = {
    hi: {
      title: "आने वाले ग्रुप ऑर्डर",
      subtitle: "क्षेत्र के अनुसार समूहीकृत",
      area: "क्षेत्र",
      vendors: "दुकानदार",
      scheduledFor: "निर्धारित समय",
      totalValue: "कुल मूल्य",
      acceptDispatch: "स्वीकार करें और भेजें",
      accepted: "स्वीकार किया गया",
      dispatched: "भेजा गया",
      pending: "लंबित"
    },
    en: {
      title: "Incoming Group Orders",
      subtitle: "Grouped by delivery area",
      area: "Area",
      vendors: "vendors",
      scheduledFor: "Scheduled for",
      totalValue: "Total Value",
      acceptDispatch: "Accept & Dispatch",
      accepted: "Accepted",
      dispatched: "Dispatched",
      pending: "Pending"
    }
  };

  const t = text[language];

  useEffect(() => {
    fetchGroupOrders();

    // Set up real-time subscription
    const channel = supabase
      .channel('incoming-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_orders',
          filter: `supplier_id=eq.${userProfile?.id}`
        },
        () => {
          fetchGroupOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile?.id, language]);

  const fetchGroupOrders = async () => {
    if (!userProfile?.id) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('group_orders')
        .select(`
          *,
          group_order_items:group_order_items(*),
          vendor_orders:vendor_orders(*)`)
        .eq('supplier_id', userProfile.id)
        .not('status', 'eq', 'delivered')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const orders: GroupOrder[] = data.map(order => ({
        id: order.id,
        area: order.zone,
        items: order.group_order_items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit || 'kg' // default unit if missing
        })),
        vendorCount: order.vendor_orders.length,
        scheduledTime: new Date(order.close_at).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        totalValue: 0, // Calculate total value if needed, or rely on stored fields
        status: order.status as GroupOrder['status']
      }));

      setGroupOrders(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: language === 'hi' ? "त्रुटि" : "Error",
        description: language === 'hi' ? "ऑर्डर लोड करने में समस्या" : "Error loading orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    // Add logic to accept order if needed, or just navigate to Dispatch Panel?
    // For now, assuming "Accept & Dispatch" moves it to dispatched or just updates status.
    // But typically "dispatch" happens in DispatchPanel.
    // This view seems to be "View Incoming Orders".
    // Maybe this should just update status to 'accepted' then show 'accepted'.
    // or navigate to dispatch.

    // Let's implement status update to 'accepted' (if not already) then maybe dispatch.
    // But button says "Accept & Dispatch".

    // I will navigate to Dispatch Panel for now or stick to simple status update.
    // The original code passed `onAcceptOrder` which presumably did something.

    try {
      const { error } = await supabase
        .from('group_orders')
        .update({ status: 'dispatched' }) // Or accepted? The text says Accept & Dispatch
        .eq('id', orderId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Order Dispatched' });
      fetchGroupOrders();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const allZones = Array.from(new Set(groupOrders.map(order => order.area)));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'forming': // 'pending' in interface but 'forming' in DB usually
        return <Badge variant="default">{t.pending}</Badge>;
      case 'accepted':
        return <Badge className="bg-warning text-warning-foreground">{t.accepted}</Badge>;
      case 'dispatched':
        return <Badge className="bg-success text-success-foreground">{t.dispatched}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getActionButton = (order: GroupOrder) => {
    switch (order.status) {
      case 'forming': // pending
        return (
          <Button
            variant="fresh"
            size="mobile"
            className="w-full"
            onClick={() => handleAcceptOrder(order.id)}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {t.acceptDispatch}
          </Button>
        );
      case 'accepted':
        return (
          <Button
            variant="warning"
            size="mobile"
            className="w-full"
            disabled
          >
            <Clock className="w-5 h-5 mr-2" />
            {t.accepted}
          </Button>
        );
      case 'dispatched':
        return (
          <Button
            variant="success"
            size="mobile"
            className="w-full"
            disabled
          >
            <Truck className="w-5 h-5 mr-2" />
            {t.dispatched}
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-fresh">
      {/* Header */}
      <div className="bg-white shadow-card p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/supplier/dashboard')}
          className="mr-3"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <div className="text-lg font-bold text-primary">RasoiLink</div>
          <h1 className="text-lg font-semibold text-foreground">
            {t.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Zone Filter */}
      <div className="px-4 pt-4">
        <select
          className="w-full p-2 rounded border border-muted-foreground bg-white mb-4"
          value={selectedZone}
          onChange={e => setSelectedZone(e.target.value)}
        >
          <option value="all">{language === 'hi' ? 'सभी क्षेत्र' : 'All Zones'}</option>
          {allZones.map(zone => (
            <option key={zone} value={zone}>{zone}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : groupOrders.filter(order => selectedZone === 'all' || order.area === selectedZone).length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{language === 'hi' ? 'कोई ऑर्डर नहीं मिला' : 'No orders found'}</h3>
          </Card>
        ) : (
          groupOrders
            .filter(order => selectedZone === 'all' || order.area === selectedZone)
            .map(order => (
              <Card key={order.id} className="p-4 shadow-card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <MapPin className="w-5 h-5 text-primary mr-2" />
                      <span className="font-semibold text-lg">
                        {order.area}
                      </span>
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm mb-2">
                      <Clock className="w-4 h-4 mr-1" />
                      {t.scheduledFor}: {order.scheduledTime}
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm mb-2">
                      <Users className="w-4 h-4 mr-1" />
                      {order.vendorCount} {t.vendors}
                    </div>
                    {/* <div className="flex items-center text-muted-foreground text-sm mb-2">
                  <Package className="w-4 h-4 mr-1" />
                  {t.totalValue}: ₹{order.totalValue}
                </div> */}
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                  </div>
                </div>
                {/* Items Preview */}
                <div className="mb-2">
                  <div className="grid grid-cols-2 gap-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground ml-1">
                          ({item.quantity}{item.unit})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  {getActionButton(order)}
                </div>
              </Card>
            ))
        )}
      </div>
    </div>
  );
};