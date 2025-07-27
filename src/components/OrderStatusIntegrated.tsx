import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, Truck, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderStatusIntegratedProps {
  language: 'hi' | 'en';
  onBack: () => void;
}

export const OrderStatusIntegrated: React.FC<OrderStatusIntegratedProps> = ({
  language,
  onBack
}) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const text = {
    hi: {
      title: 'मेरे ऑर्डर',
      back: 'वापस',
      status: 'स्थिति',
      total: 'कुल',
      forming: 'बन रहा है',
      closed: 'बंद',
      dispatched: 'भेजा गया',
      delivered: 'डिलीवर',
      noOrders: 'कोई ऑर्डर नहीं मिला',
      supplier: 'सप्लायर'
    },
    en: {
      title: 'My Orders',
      back: 'Back',
      status: 'Status',
      total: 'Total',
      forming: 'Forming',
      closed: 'Closed',
      dispatched: 'Dispatched',
      delivered: 'Delivered',
      noOrders: 'No orders found',
      supplier: 'Supplier'
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userProfile]);

  const fetchOrders = async () => {
    if (!userProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('vendor_orders')
        .select(`
          *,
          group_orders (
            id,
            status,
            created_at,
            suppliers (name)
          ),
          items (name, price_per_kg)
        `)
        .eq('vendor_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'forming': return 'bg-yellow-500';
      case 'closed': return 'bg-blue-500';
      case 'dispatched': return 'bg-orange-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'forming': return <Clock className="w-4 h-4" />;
      case 'closed': return <Package className="w-4 h-4" />;
      case 'dispatched': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-4 flex flex-col p-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full mb-4" />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-4">
      <div className="sticky top-0 z-10 bg-background px-4 pt-4 pb-2 shadow-sm flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="mr-2">
          {text[language].back}
        </Button>
        <h1 className="text-xl font-bold flex-1 text-center">{text[language].title}</h1>
        <div className="w-12" />
      </div>
      <div className="max-w-md mx-auto px-2 mt-2">
        {orders.length === 0 ? (
          <Card className="mt-12 animate-fade-in">
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg font-medium">{text[language].noOrders}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="animate-fade-in shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {order.items?.name}
                    </CardTitle>
                    <Badge className={`${getStatusColor(order.group_orders?.status)} text-white`}>
                      {getStatusIcon(order.group_orders?.status)}
                      <span className="ml-1">
                        {text[language][order.group_orders?.status as keyof typeof text.en] || order.group_orders?.status}
                      </span>
                    </Badge>
                  </div>
                  <CardDescription>
                    {text[language].supplier}: {order.group_orders?.suppliers?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {order.quantity} kg
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ₹{order.items?.price_per_kg}/kg
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {text[language].total}: ₹{(order.quantity * order.items?.price_per_kg).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.group_orders?.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};