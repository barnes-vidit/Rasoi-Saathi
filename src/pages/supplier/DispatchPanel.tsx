import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Camera, Truck, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrder } from "@/context/OrderContext";

export const DispatchPanel = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [groupOrders, setGroupOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { language } = useOrder();

  const text = {
    hi: {
      title: 'डिस्पैच पैनल',
      back: 'वापस',
      status: 'स्थिति',
      orders: 'ऑर्डर',
      markDispatched: 'भेजा हुआ मार्क करें',
      uploadProof: 'प्रूफ अपलोड करें',
      dispatched: 'भेजा गया',
      forming: 'बन रहा है',
      closed: 'बंद',
      noOrders: 'कोई ऑर्डर नहीं मिला',
      totalValue: 'कुल मूल्य',
      vendors: 'विक्रेता'
    },
    en: {
      title: 'Dispatch Panel',
      back: 'Back',
      status: 'Status',
      orders: 'Orders',
      markDispatched: 'Mark as Dispatched',
      uploadProof: 'Upload Proof',
      dispatched: 'Dispatched',
      forming: 'Forming',
      closed: 'Closed',
      noOrders: 'No orders found',
      totalValue: 'Total Value',
      vendors: 'Vendors'
    }
  };

  useEffect(() => {
    fetchGroupOrders();
  }, [userProfile]);

  const fetchGroupOrders = async () => {
    if (!userProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('group_orders')
        .select(`
          *,
          vendor_orders (
            id,
            quantity,
            vendor_id,
            vendors (name),
            items (name, price_per_kg)
          )
        `)
        .eq('supplier_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGroupOrders(data || []);
    } catch (error) {
      console.error('Error fetching group orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, groupOrderId: string) => {
    if (!userProfile?.id) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${groupOrderId}-${Date.now()}.${fileExt}`;
      const filePath = `delivery-proofs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('delivery-proofs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('delivery-proofs')
        .getPublicUrl(filePath);

      // Save delivery proof record
      const { error: insertError } = await supabase
        .from('delivery_proofs')
        .insert({
          supplier_id: userProfile.id,
          group_order_id: groupOrderId,
          file_url: urlData.publicUrl,
          type: file.type.startsWith('image/') ? 'image' : 'audio'
        });

      if (insertError) throw insertError;

      // Update group order status
      const { error: updateError } = await supabase
        .from('group_orders')
        .update({ status: 'dispatched' })
        .eq('id', groupOrderId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Delivery proof uploaded and order marked as dispatched",
      });

      fetchGroupOrders();
    } catch (error) {
      console.error('Error uploading proof:', error);
      toast({
        title: "Error",
        description: "Failed to upload delivery proof",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const calculateOrderValue = (vendorOrders: any[]) => {
    return vendorOrders.reduce((total, order) => {
      return total + (order.quantity * order.items?.price_per_kg || 0);
    }, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'forming': return 'bg-yellow-500';
      case 'closed': return 'bg-blue-500';
      case 'dispatched': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/supplier/dashboard')}>
            {text[language].back}
          </Button>
          <h1 className="text-xl font-bold">{text[language].title}</h1>
          <div></div>
        </div>

        {groupOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{text[language].noOrders}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {groupOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {text[language].orders} #{order.id.slice(0, 8)}
                    </CardTitle>
                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                      {order.status === 'dispatched' ? <Truck className="w-4 h-4 mr-1" /> : <Package className="w-4 h-4 mr-1" />}
                      {text[language][order.status as keyof typeof text.en] || order.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {text[language].vendors}: {order.vendor_orders?.length || 0} |
                    {text[language].totalValue}: ₹{calculateOrderValue(order.vendor_orders || []).toFixed(2)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.vendor_orders?.map((vendorOrder: any) => (
                      <div key={vendorOrder.id} className="flex justify-between items-center p-2 bg-muted rounded">
                        <div>
                          <p className="font-medium">{vendorOrder.vendors?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {vendorOrder.items?.name} - {vendorOrder.quantity}kg
                          </p>
                        </div>
                        <p className="font-semibold">
                          ₹{(vendorOrder.quantity * vendorOrder.items?.price_per_kg).toFixed(2)}
                        </p>
                      </div>
                    ))}

                    {/* Show upload for closed or forming orders to dispatch them? Usually closed -> dispatched */}
                    {order.status !== 'dispatched' && order.status !== 'delivered' && (
                      <div className="mt-4">
                        <Label htmlFor={`proof-${order.id}`}>
                          {text[language].uploadProof}
                        </Label>
                        <Input
                          id={`proof-${order.id}`}
                          type="file"
                          accept="image/*,audio/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file, order.id);
                            }
                          }}
                          disabled={uploading}
                          className="mt-2"
                        />
                        <Button
                          className="w-full mt-2"
                          disabled={uploading}
                          onClick={() => document.getElementById(`proof-${order.id}`)?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {text[language].markDispatched}
                        </Button>
                      </div>
                    )}
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