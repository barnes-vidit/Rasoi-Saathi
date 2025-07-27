import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Package, Upload, IndianRupee, Weight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface InventoryManagementProps {
  language: 'hi' | 'en';
  onBack: () => void;
}

interface Item {
  id: string;
  name: string;
  price_per_kg: number;
  available_qty: number;
  image_url?: string;
}

export const InventoryManagement = ({ language, onBack }: InventoryManagementProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price_per_kg: '',
    available_qty: ''
  });
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', price_per_kg: '', available_qty: '' });
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const text = {
    hi: {
      title: "इन्वेंटरी प्रबंधन",
      subtitle: "अपने आइटम्स को मैनेज करें",
      addNew: "नया आइटम जोड़ें",
      itemName: "आइटम का नाम",
      pricePerKg: "दर (₹/किलो)",
      quantity: "उपलब्ध मात्रा (किलो)",
      save: "सेव करें",
      cancel: "कैंसल करें",
      success: "आइटम सफलतापूर्वक जोड़ा गया!",
      noItems: "कोई आइटम नहीं मिला",
      addFirst: "पहला आइटम जोड़ें"
    },
    en: {
      title: "Inventory Management",
      subtitle: "Manage your items",
      addNew: "Add New Item",
      itemName: "Item Name",
      pricePerKg: "Price (₹/kg)",
      quantity: "Available Quantity (kg)",
      save: "Save Item",
      cancel: "Cancel",
      success: "Item added successfully!",
      noItems: "No items found",
      addFirst: "Add your first item"
    }
  };

  const t = text[language];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    if (!userProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('supplier_id', userProfile.id)
        .order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleAddItem = async () => {
    if (!formData.name || !formData.price_per_kg || !userProfile?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('items')
        .insert([{
          supplier_id: userProfile.id,
          name: formData.name,
          price_per_kg: parseFloat(formData.price_per_kg),
          available_qty: parseFloat(formData.available_qty) || 0
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: t.success,
      });

      setFormData({ name: '', price_per_kg: '', available_qty: '' });
      setShowAddForm(false);
      fetchItems();
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item: Item) => {
    setEditItemId(item.id);
    setEditFormData({
      name: item.name,
      price_per_kg: item.price_per_kg.toString(),
      available_qty: item.available_qty.toString()
    });
    setShowAddForm(false);
  };

  const handleSaveEdit = async () => {
    if (!editItemId || !editFormData.name || !editFormData.price_per_kg) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('items')
        .update({
          name: editFormData.name,
          price_per_kg: parseFloat(editFormData.price_per_kg),
          available_qty: parseFloat(editFormData.available_qty) || 0
        })
        .eq('id', editItemId);
      if (error) throw error;
      toast({ title: 'Success', description: 'Item updated!' });
      setEditItemId(null);
      fetchItems();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update item', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('items').delete().eq('id', itemId);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Item deleted.' });
      fetchItems();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete item', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-fresh flex flex-col p-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full mb-4" />
        ))}
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
          <Button
            variant="mobile"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="w-5 h-5 mr-2" />
            {t.addNew}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Add Item Form */}
        {showAddForm && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t.itemName}</Label>
                <Input
                  placeholder="e.g., Onions, Potatoes, Tomatoes"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="h-12"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.pricePerKg}</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="50"
                      value={formData.price_per_kg}
                      onChange={(e) => setFormData({...formData, price_per_kg: e.target.value})}
                      className="h-12 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t.quantity}</Label>
                  <div className="relative">
                    <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="100"
                      value={formData.available_qty}
                      onChange={(e) => setFormData({...formData, available_qty: e.target.value})}
                      className="h-12 pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="mobile"
                  onClick={handleAddItem}
                  disabled={!formData.name || !formData.price_per_kg || loading}
                  className="flex-1"
                >
                  {loading ? "Adding..." : t.save}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  {t.cancel}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Items List */}
        <div className="space-y-4">
          {items.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t.noItems}</h3>
              <Button
                variant="mobile"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                {t.addFirst}
              </Button>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary-soft/20 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{item.name}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="secondary" className="text-sm">
                          ₹{item.price_per_kg}/kg
                        </Badge>
                        <Badge variant="outline" className="text-sm">
                          {item.available_qty}kg available
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditItem(item)}>
                      ✏️
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteItem(item.id)} disabled={loading}>
                      🗑️
                    </Button>
                  </div>
                </div>
                {/* Inline Edit Form */}
                {editItemId === item.id && (
                  <div className="mt-4 space-y-2">
                    <Input
                      placeholder={t.itemName}
                      value={editFormData.name}
                      onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="h-10"
                    />
                    <Input
                      type="number"
                      placeholder={t.pricePerKg}
                      value={editFormData.price_per_kg}
                      onChange={e => setEditFormData({ ...editFormData, price_per_kg: e.target.value })}
                      className="h-10"
                    />
                    <Input
                      type="number"
                      placeholder={t.quantity}
                      value={editFormData.available_qty}
                      onChange={e => setEditFormData({ ...editFormData, available_qty: e.target.value })}
                      className="h-10"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button variant="mobile" onClick={handleSaveEdit} disabled={loading}>
                        {loading ? 'Saving...' : t.save}
                      </Button>
                      <Button variant="outline" onClick={() => setEditItemId(null)}>
                        {t.cancel}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};