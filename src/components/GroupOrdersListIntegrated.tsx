import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Users, ShoppingCart, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGroupOrders } from "@/hooks/useRealtime";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GroupOrdersListIntegratedProps {
  language: 'hi' | 'en';
  onJoinOrder: (orderId: string) => void;
  onStartOrder: () => void;
}

export const GroupOrdersListIntegrated = ({ 
  language, 
  onJoinOrder, 
  onStartOrder 
}: GroupOrdersListIntegratedProps) => {
  const { userProfile, signOut } = useAuth();
  const { groupOrders, loading } = useGroupOrders(userProfile?.zone);
  const [joining, setJoining] = useState<string | null>(null);
  const { toast } = useToast();

  const text = {
    hi: {
      title: "ग्रुप ऑर्डर",
      subtitle: "अपने एरिया के ऑर्डर देखें",
      noOrders: "कोई ऑर्डर नहीं मिला",
      startNew: "नया ऑर्डर शुरू करें",
      join: "ज्वाइन करें",
      forming: "बन रहा है",
      closed: "बंद",
      members: "सदस्य",
      timeLeft: "बचा समय",
      logout: "लॉग आउट"
    },
    en: {
      title: "Group Orders",
      subtitle: "Orders in your area",
      noOrders: "No orders found",
      startNew: "Start New Order",
      join: "Join",
      forming: "Forming",
      closed: "Closed",
      members: "Members",
      timeLeft: "Time Left",
      logout: "Logout"
    }
  };

  const t = text[language];

  const handleJoinOrder = async (groupOrderId: string) => {
    if (!userProfile?.id) return;
    
    setJoining(groupOrderId);
    try {
      // Check if already joined
      const { data: existingOrder } = await supabase
        .from('vendor_orders')
        .select('id')
        .eq('group_order_id', groupOrderId)
        .eq('vendor_id', userProfile.id)
        .maybeSingle();

      if (existingOrder) {
        toast({
          title: "Already Joined",
          description: "You have already joined this group order",
          variant: "destructive",
        });
        return;
      }

      // Call the join-group-order Edge function
      const { data, error } = await supabase.functions.invoke('join-group-order', {
        body: {
          groupOrderId,
          items: [] // Will be populated when user adds items
        }
      });

      if (error) throw error;

      toast({
        title: "Joined Successfully",
        description: "You have joined the group order. Now select your items!",
      });

      onJoinOrder(groupOrderId);
    } catch (error: any) {
      console.error('Error joining order:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join group order",
        variant: "destructive",
      });
    } finally {
      setJoining(null);
    }
  };

  const getTimeLeft = (closeAt: string) => {
    const now = new Date();
    const closeTime = new Date(closeAt);
    const diff = closeTime.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const getOrderTotal = (order: any) => {
    return order.group_order_items?.reduce((total: number, item: any) => 
      total + (item.total_qty * item.price_per_kg), 0) || 0;
  };

  const getMemberCount = (order: any) => {
    // Count unique vendors who have placed orders
    const vendors = new Set();
    order.vendor_orders?.forEach((vo: any) => vendors.add(vo.vendor_id));
    return vendors.size;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-fresh flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-fresh flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 mt-4">
        <div className="flex-1">
          <div className="text-lg font-bold text-primary mb-1">RasoiLink</div>
          <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle} - {userProfile?.zone}</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={signOut}
        >
          {t.logout}
        </Button>
      </div>

      {/* Orders List */}
      <div className="flex-1">
        {groupOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-6">{t.noOrders}</p>
            <Button 
              variant="mobile"
              size="mobile"
              onClick={onStartOrder}
              className="w-full max-w-xs"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t.startNew}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {groupOrders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={order.status === 'forming' ? 'default' : 'secondary'}>
                        {order.status === 'forming' ? t.forming : t.closed}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        by {order.suppliers?.name}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4" />
                        <span>{getMemberCount(order)} {t.members}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{getTimeLeft(order.close_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      ₹{getOrderTotal(order).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.group_order_items?.length || 0} items
                    </div>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {order.group_order_items?.slice(0, 4).map((item: any) => (
                      <div key={item.id} className="text-sm">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground ml-1">
                          ({item.total_qty}kg)
                        </span>
                      </div>
                    ))}
                  </div>
                  {(order.group_order_items?.length || 0) > 4 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      +{(order.group_order_items?.length || 0) - 4} more items
                    </div>
                  )}
                </div>

                <Button
                  variant="mobile"
                  size="mobile"
                  className="w-full"
                  onClick={() => handleJoinOrder(order.id)}
                  disabled={order.status !== 'forming' || joining === order.id}
                >
                  {joining === order.id ? "Joining..." : t.join}
                </Button>
              </Card>
            ))}

            {/* Start New Order Button */}
            <Button 
              variant="outline"
              size="mobile"
              onClick={onStartOrder}
              className="w-full"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t.startNew}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};