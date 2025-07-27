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
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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

  const [selectedZone, setSelectedZone] = useState<string>('all');
  const allZones = Array.from(new Set(mockOrders.map(order => order.area)));
  const [loading, setLoading] = useState(false);

  // Add loading state for data fetch (mocked for now)
  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500); // Simulate loading
  }, [selectedZone]);

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
        ) : mockOrders.filter(order => selectedZone === 'all' || order.area === selectedZone).length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{language === 'hi' ? 'कोई ऑर्डर नहीं मिला' : 'No orders found'}</h3>
          </Card>
        ) : (
          mockOrders
            .filter(order => selectedZone === 'all' || order.area === selectedZone)
            .map((order) => (
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
                <div className="flex items-center text-muted-foreground text-sm mb-2">
                  <Package className="w-4 h-4 mr-1" />
                  {t.totalValue}: ₹{order.totalValue}
                </div>
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
            {/* Vendor Orders Grouping (mocked for now) */}
            <div className="mt-2 p-2 bg-muted rounded">
              <div className="font-semibold mb-1 text-sm text-muted-foreground">
                {language === 'hi' ? 'दुकानदार ऑर्डर' : 'Vendor Orders'}
              </div>
              <div className="space-y-1">
                {/* Replace with real vendor order data if available */}
                {[...Array(order.vendorCount)].map((_, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span>{language === 'hi' ? `दुकानदार ${i+1}` : `Vendor ${i+1}`}</span>
                    <span className="text-muted-foreground">{language === 'hi' ? 'स्थिति: लंबित' : 'Status: Pending'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4">
              {getActionButton(order)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};