import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Minus, ShoppingCart } from "lucide-react";
import potatoImg from "@/assets/potato.jpg";
import onionImg from "@/assets/onion.jpg";
import tomatoImg from "@/assets/tomato.jpg";
import oilImg from "@/assets/oil.jpg";

interface Item {
  id: string;
  name: string;
  nameHi: string;
  image: string;
  pricePerKg: number;
  unit: string;
}

interface ItemSelectionProps {
  language: 'hi' | 'en';
  onBack: () => void;
  onAddToCart: (items: any[]) => void;
}

export const ItemSelection = ({ language, onBack, onAddToCart }: ItemSelectionProps) => {
  const [cart, setCart] = useState<Record<string, number>>({});

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

  const items: Item[] = [
    {
      id: '1',
      name: 'Potato',
      nameHi: 'आलू',
      image: potatoImg,
      pricePerKg: 25,
      unit: 'kg'
    },
    {
      id: '2',
      name: 'Onion',
      nameHi: 'प्याज',
      image: onionImg,
      pricePerKg: 30,
      unit: 'kg'
    },
    {
      id: '3',
      name: 'Tomato',
      nameHi: 'टमाटर',
      image: tomatoImg,
      pricePerKg: 40,
      unit: 'kg'
    },
    {
      id: '4',
      name: 'Cooking Oil',
      nameHi: 'खाना पकाने का तेल',
      image: oilImg,
      pricePerKg: 120,
      unit: 'liter'
    }
  ];

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
      return sum + (item ? item.pricePerKg * qty : 0);
    }, 0);
  };

  const handleAddToCart = () => {
    const cartItems = Object.entries(cart).map(([itemId, quantity]) => {
      const item = items.find(i => i.id === itemId);
      return { ...item, quantity };
    });
    onAddToCart(cartItems);
  };

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
        <div className="grid grid-cols-2 gap-4 mb-20">
          {items.map((item) => {
            const quantity = cart[item.id] || 0;
            const displayName = language === 'hi' ? item.nameHi : item.name;
            const unitText = item.unit === 'kg' ? t.perKg : t.perLiter;

            return (
              <Card key={item.id} className="p-3 shadow-card">
                <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={item.image} 
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="text-center mb-3">
                  <h3 className="font-semibold text-lg mb-1">
                    {displayName}
                  </h3>
                  <div className="text-primary font-bold text-xl">
                    ₹{item.pricePerKg}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {unitText}
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
                          {item.unit}
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
                      ₹{item.pricePerKg * quantity}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Floating Cart Button */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-floating">
          <Button 
            variant="fresh"
            size="mobile"
            className="w-full relative"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-6 h-6 mr-3" />
            {t.addToCart}
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