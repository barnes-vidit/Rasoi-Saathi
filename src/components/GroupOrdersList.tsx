import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Clock, 
  Truck, 
  Plus,
  ShoppingCart,
  MapPin
} from "lucide-react";
import groupBuyingHero from "@/assets/group-buying-hero.jpg";

interface GroupOrder {
  id: string;
  items: string[];
  pricePerKg: number;
  vendorCount: number;
  timeLeft: string;
  location: string;
  vendorName: string;
  status: 'forming' | 'confirmed' | 'delivered';
}

interface GroupOrdersListProps {
  language: 'hi' | 'en';
  onJoinOrder: (orderId: string) => void;
  onStartOrder: () => void;
}

export const GroupOrdersList = ({ language, onJoinOrder, onStartOrder }: GroupOrdersListProps) => {
  const text = {
    hi: {
      title: "आसपास के ग्रुप ऑर्डर",
      subtitle: "मिलकर खरीदें, पैसे बचाएं",
      vendorCount: "दुकानदार",
      timeLeft: "समय बचा",
      joinOrder: "ग्रुप जॉइन करें",
      startOrder: "नया ग्रुप शुरू करें",
      perKg: "प्रति किलो",
      location: "स्थान"
    },
    en: {
      title: "Nearby Group Orders",
      subtitle: "Buy together, save money",
      vendorCount: "vendors",
      timeLeft: "time left",
      joinOrder: "Join Group",
      startOrder: "Start New Group",
      perKg: "per kg",
      location: "Location"
    }
  };

  const t = text[language];

  const mockOrders: GroupOrder[] = [
    {
      id: '1',
      items: ['आलू', 'प्याज', 'टमाटर'],
      pricePerKg: 25,
      vendorCount: 8,
      timeLeft: '2 घंटे',
      location: 'चांदनी चौक',
      vendorName: 'मोहन सब्जी भंडार',
      status: 'forming'
    },
    {
      id: '2',
      items: ['हरी मिर्च', 'धनिया', 'अदरक'],
      pricePerKg: 45,
      vendorCount: 12,
      timeLeft: '1 घंटा',
      location: 'करोल बाग',
      vendorName: 'गुप्ता होलसेल मार्केट',
      status: 'confirmed'
    },
    {
      id: '3',
      items: ['तेल', 'चावल', 'दाल'],
      pricePerKg: 85,
      vendorCount: 15,
      timeLeft: '30 मिनट',
      location: 'लाजपत नगर',
      vendorName: 'शर्मा किराना स्टोर',
      status: 'confirmed'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-fresh">
      {/* Header */}
      <div className="bg-white shadow-card p-4">
        <div className="text-lg font-bold text-primary mb-1">RasoiLink</div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          {t.title}
        </h1>
        <p className="text-muted-foreground">
          {t.subtitle}
        </p>
      </div>

      {/* Hero Image */}
      <div className="h-40 overflow-hidden relative">
        <img 
          src={groupBuyingHero} 
          alt="Group buying collaboration"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Start New Order Button */}
        <Button 
          variant="fresh"
          size="mobile"
          className="w-full"
          onClick={onStartOrder}
        >
          <Plus className="w-6 h-6 mr-3" />
          {t.startOrder}
        </Button>

        {/* Active Orders */}
        <div className="space-y-4">
          {mockOrders.map((order) => (
            <Card key={order.id} className="p-4 shadow-card">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <ShoppingCart className="w-5 h-5 text-primary mr-2" />
                    <span className="font-semibold text-lg">
                      {order.vendorName}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {order.location}
                  </div>
                </div>
                
                <Badge 
                  variant={order.status === 'forming' ? 'default' : 'secondary'}
                  className="ml-2"
                >
                  {order.status === 'forming' ? 'Forming' : 'Confirmed'}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">
                    ₹{order.pricePerKg}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.perKg}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center text-lg font-bold text-foreground">
                    <Users className="w-5 h-5 mr-1" />
                    {order.vendorCount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.vendorCount}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center text-lg font-bold text-warning">
                    <Clock className="w-5 h-5 mr-1" />
                    {order.timeLeft}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.timeLeft}
                  </div>
                </div>
              </div>

              <Button 
                variant={order.status === 'forming' ? 'default' : 'success'}
                size="mobile"
                className="w-full"
                onClick={() => onJoinOrder(order.id)}
              >
                {order.status === 'forming' ? (
                  <>
                    <Users className="w-5 h-5 mr-2" />
                    {t.joinOrder}
                  </>
                ) : (
                  <>
                    <Truck className="w-5 h-5 mr-2" />
                    Track Order
                  </>
                )}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};