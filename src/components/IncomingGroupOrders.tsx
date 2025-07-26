import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users,
  Package,
  CheckCircle,
  Truck
} from "lucide-react";

interface GroupOrder {
  id: string;
  area: string;
  items: { name: string; quantity: number; unit: string }[];
  vendorCount: number;
  scheduledTime: string;
  totalValue: number;
  status: 'pending' | 'accepted' | 'dispatched';
}

interface IncomingGroupOrdersProps {
  language: 'hi' | 'en';
  onBack: () => void;
  onAcceptOrder: (orderId: string) => void;
}

export const IncomingGroupOrders = ({ 
  language, 
  onBack, 
  onAcceptOrder 
}: IncomingGroupOrdersProps) => {
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

  const mockOrders: GroupOrder[] = [
    {
      id: '1',
      area: 'चांदनी चौक',
      items: [
        { name: 'आलू', quantity: 50, unit: 'kg' },
        { name: 'प्याज', quantity: 30, unit: 'kg' },
        { name: 'टमाटर', quantity: 25, unit: 'kg' }
      ],
      vendorCount: 8,
      scheduledTime: '2:00 PM',
      totalValue: 2650,
      status: 'pending'
    },
    {
      id: '2',
      area: 'करोल बाग',
      items: [
        { name: 'हरी मिर्च', quantity: 15, unit: 'kg' },
        { name: 'धनिया', quantity: 10, unit: 'kg' },
        { name: 'अदरक', quantity: 8, unit: 'kg' }
      ],
      vendorCount: 12,
      scheduledTime: '3:30 PM',
      totalValue: 1485,
      status: 'accepted'
    },
    {
      id: '3',
      area: 'लाजपत नगर',
      items: [
        { name: 'तेल', quantity: 20, unit: 'L' },
        { name: 'चावल', quantity: 40, unit: 'kg' },
        { name: 'दाल', quantity: 25, unit: 'kg' }
      ],
      vendorCount: 15,
      scheduledTime: '1:30 PM',
      totalValue: 3400,
      status: 'dispatched'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
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
      case 'pending':
        return (
          <Button 
            variant="fresh"
            size="mobile"
            className="w-full"
            onClick={() => onAcceptOrder(order.id)}
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
          onClick={onBack}
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

      {/* Content */}
      <div className="p-4 space-y-4">
        {mockOrders.map((order) => (
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
              </div>
              
              {getStatusBadge(order.status)}
            </div>

            {/* Items List */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <Package className="w-4 h-4 text-primary mr-2" />
                <span className="font-medium">Items:</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {order.items.map((item, index) => (
                  <span key={index}>
                    {item.name} ({item.quantity}{item.unit})
                    {index < order.items.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-success">
                  ₹{order.totalValue.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t.totalValue}
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center text-lg font-bold text-primary">
                  <Users className="w-4 h-4 mr-1" />
                  {order.vendorCount}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t.vendors}
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center text-lg font-bold text-warning">
                  <Clock className="w-4 h-4 mr-1" />
                  {order.scheduledTime}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t.scheduledFor}
                </div>
              </div>
            </div>

            {/* Action Button */}
            {getActionButton(order)}
          </Card>
        ))}
      </div>
    </div>
  );
};