import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Minus, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import potatoImg from "@/assets/potato.jpg";
import onionImg from "@/assets/onion.jpg";
import tomatoImg from "@/assets/tomato.jpg";
import oilImg from "@/assets/oil.jpg";

interface Item {
  id: string;
  name: string;
  price_per_kg: number;
  available_qty: number;
  image_url?: string;
  supplier_id: string;
}

interface ItemSelectionProps {
  language: 'hi' | 'en';
  onBack: () => void;
  onAddToCart: (items: any[]) => void;
  supplierId?: string;
}

export const ItemSelection = ({ language, onBack, onAddToCart, supplierId }: ItemSelectionProps) => {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const text = {
    hi: {
      title: "सामान चुनें",
      subtitle: "क्या खरीदना है?",
      addToCart: "कार्ट में डालें",
      perKg: "प्रति किलो",
      perLiter: "प्रति लीटर",
      quantity: "मात्रा",
      total: "कुल"
    },
    en: {
      title: "Select Items",
      subtitle: "What do you want to buy?",
      addToCart: "Add to Cart",
      perKg: "per kg",
      perLiter: "per liter",
      quantity: "Quantity",
      total: "Total"
    }
  };

  const t = text[language];

  useEffect(() => {
    fetchItems();
  }, [supplierId]);

  const fetchItems = async () => {
    try {
      let query = supabase.from('items').select('*');
      
      if (supplierId) {
        query = query.eq('supplier_id', supplierId);
      }
      
      const { data, error } = await query.order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getItemImage = (item: Item) => {
    if (item.image_url) return item.image_url;
    
    // Fallback images based on name
    if (item.name.toLowerCase().includes('potato') || item.name.includes('आलू')) return potatoImg;
    if (item.name.toLowerCase().includes('onion') || item.name.includes('प्याज')) return onionImg;
    if (item.name.toLowerCase().includes('tomato') || item.name.includes('टमाटर')) return tomatoImg;
    if (item.name.toLowerCase().includes('oil') || item.name.includes('तेल')) return oilImg;
    
    return potatoImg; // Default fallback
  };

  const updateQuantity = (itemId: string, change: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      const currentQty = newCart[itemId] || 0;
      const newQty = Math.max(0, currentQty + change);
      
      if (newQty === 0) {
        delete newCart[itemId];
      } else {
        newCart[itemId] = newQty;
      }
      
      return newCart;
    });
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((sum, [itemId, qty]) => {
      const item = items.find(i => i.id === itemId);
      return sum + (item ? item.price_per_kg * qty : 0);
    }, 0);
  };

  const handleAddToCart = () => {
    const cartItems = Object.entries(cart).map(([itemId, quantity]) => {
      const item = items.find(i => i.id === itemId);
      return { 
        ...item, 
        quantity,
        pricePerKg: item?.price_per_kg || 0 // For compatibility
      };
    });
    onAddToCart(cartItems);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">{language === 'hi' ? 'कोई आइटम नहीं मिला' : 'No items found'}</h3>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-fresh">
      {/* Header */}
      <div className="bg-white shadow-card p-4 sticky top-0 z-10">
        <div className="flex items-center mb-2">
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

      {/* Items Grid */}
      <div className="p-4">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-6">No items available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-20">
            {items.map((item) => {
              const quantity = cart[item.id] || 0;
              const displayName = item.name;

              return (
                <Card key={item.id} className="p-3 shadow-card">
                  <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={getItemImage(item)} 
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="text-center mb-3">
                    <h3 className="font-semibold text-lg mb-1">
                      {displayName}
                    </h3>
                    <div className="text-primary font-bold text-xl">
                      ₹{item.price_per_kg}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.perKg}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Available: {item.available_qty}kg
                    </div>
                  </div>

                {quantity === 0 ? (
                  <Button 
                    variant="outline"
                    size="mobile"
                    className="w-full"
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-muted rounded-lg p-2">
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="h-8 w-8"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                       <div className="text-center">
                         <div className="font-bold text-lg">{quantity}</div>
                         <div className="text-xs text-muted-foreground">
                           kg
                         </div>
                       </div>
                      
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="h-8 w-8"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="text-center text-sm text-primary font-semibold">
                      ₹{item.price_per_kg * quantity}
                    </div>
                  </div>
                )}
                 </Card>
               );
             })}
           </div>
         )}
       </div>

      {/* Floating Cart Button */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-floating">
          <Button 
            variant="fresh"
            size="mobile"
            className="w-full relative"
            onClick={handleAddToCart}
            disabled={loading || Object.keys(cart).length === 0}
          >
            <ShoppingCart className="w-6 h-6 mr-3" />
            {loading ? (
              <span className="flex items-center justify-center"><span className="animate-spin mr-2">⏳</span>Adding...</span>
            ) : t.addToCart}
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -right-2 bg-warning text-warning-foreground"
            >
              {getTotalItems()}
            </Badge>
            <div className="ml-auto text-right">
              <div className="text-sm opacity-90">
                {t.total}: ₹{getTotalPrice()}
              </div>
            </div>
          </Button>
        </div>
      )}
    </div>
  );
};