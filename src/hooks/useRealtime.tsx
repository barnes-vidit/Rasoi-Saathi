import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGroupOrders = (zone?: string) => {
  const [groupOrders, setGroupOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!zone) return;

    const fetchGroupOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('group_orders')
          .select(`
            *,
            group_order_items (
              *,
              items (*)
            ),
            suppliers (
              id,
              name,
              phone
            )
          `)
          .eq('zone', zone)
          .in('status', ['forming', 'closed'])
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGroupOrders(data || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to fetch group orders",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGroupOrders();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('group-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_orders',
          filter: `zone=eq.${zone}`
        },
        () => {
          fetchGroupOrders();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_order_items'
        },
        () => {
          fetchGroupOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [zone, toast]);

  return { groupOrders, loading, refetch: () => setLoading(true) };
};

export const useVendorOrders = (vendorId?: string) => {
  const [vendorOrders, setVendorOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) return;

    const fetchVendorOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('vendor_orders')
          .select(`
            *,
            group_orders (
              *,
              suppliers (name, phone)
            ),
            items (*)
          `)
          .eq('vendor_id', vendorId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setVendorOrders(data || []);
      } catch (error) {
        console.error('Error fetching vendor orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorOrders();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('vendor-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendor_orders',
          filter: `vendor_id=eq.${vendorId}`
        },
        () => {
          fetchVendorOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendorId]);

  return { vendorOrders, loading };
};

export const useSupplierOrders = (supplierId?: string) => {
  const [supplierOrders, setSupplierOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supplierId) return;

    const fetchSupplierOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('group_orders')
          .select(`
            *,
            group_order_items (
              *,
              items (*)
            ),
            vendor_orders (
              *,
              vendors (name, phone)
            )
          `)
          .eq('supplier_id', supplierId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSupplierOrders(data || []);
      } catch (error) {
        console.error('Error fetching supplier orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierOrders();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('supplier-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_orders',
          filter: `supplier_id=eq.${supplierId}`
        },
        () => {
          fetchSupplierOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supplierId]);

  return { supplierOrders, loading };
};

export const useItems = (supplierId?: string) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supplierId) return;

    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('supplier_id', supplierId)
          .order('name');

        if (error) throw error;
        setItems(data || []);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `supplier_id=eq.${supplierId}`
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supplierId]);

  return { items, loading, refetch: () => setLoading(true) };
};