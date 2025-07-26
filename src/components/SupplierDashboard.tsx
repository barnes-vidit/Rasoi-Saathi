import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Package, 
  MapPin, 
  Clock,
  TrendingUp,
  Users
} from "lucide-react";

interface SupplierDashboardProps {
  language: 'hi' | 'en';
  onAddInventory: () => void;
  onViewOrders: () => void;
  onDeliveryPanel: () => void;
}

export const SupplierDashboard = ({ 
  language, 
  onAddInventory, 
  onViewOrders,
  onDeliveryPanel 
}: SupplierDashboardProps) => {
  const text = {
    hi: {
      title: "आपूर्तिकर्ता डैशबोर्ड",
      subtitle: "अपने व्यापार को प्रबंधित करें",
      addItem: "नया आइटम जोड़ें",
      viewItems: "अपलोड किए गए आइटम",
      pendingOrders: "लंबित ऑर्डर",
      deliveryZones: "डिलीवरी क्षेत्र",
      viewOrders: "ऑर्डर देखें",
      deliveryPanel: "डिलीवरी पैनल",
      todayStats: "आज के आंकड़े",
      revenue: "आय",
      orders: "ऑर्डर"
    },
    en: {
      title: "Supplier Dashboard",
      subtitle: "Manage your business",
      addItem: "Add New Item",
      viewItems: "Uploaded Items",
      pendingOrders: "Pending Orders",
      deliveryZones: "Delivery Zones",
      viewOrders: "View Orders",
      deliveryPanel: "Delivery Panel",
      todayStats: "Today's Stats",
      revenue: "Revenue",
      orders: "Orders"
    }
  };

  const t = text[language];

  const mockStats = {
    uploadedItems: 24,
    pendingOrders: 8,
    deliveryZones: 3,
    todayRevenue: 12500,
    todayOrders: 15
  };

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

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="fresh"
            size="mobile"
            className="h-20 flex-col"
            onClick={onAddInventory}
          >
            <Plus className="w-8 h-8 mb-2" />
            {t.addItem}
          </Button>
          
          <Button 
            variant="spice"
            size="mobile"
            className="h-20 flex-col"
            onClick={onViewOrders}
          >
            <Package className="w-8 h-8 mb-2" />
            {t.viewOrders}
          </Button>
        </div>

        {/* Today's Stats */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            {t.todayStats}
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                ₹{mockStats.todayRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {t.revenue}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {mockStats.todayOrders}
              </div>
              <div className="text-sm text-muted-foreground">
                {t.orders}
              </div>
            </div>
          </div>
        </Card>

        {/* Business Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <Package className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-xl font-bold text-foreground">
              {mockStats.uploadedItems}
            </div>
            <div className="text-sm text-muted-foreground">
              {t.viewItems}
            </div>
          </Card>
          
          <Card className="p-4 text-center">
            <Clock className="w-8 h-8 text-warning mx-auto mb-2" />
            <div className="text-xl font-bold text-foreground">
              {mockStats.pendingOrders}
            </div>
            <div className="text-sm text-muted-foreground">
              {t.pendingOrders}
            </div>
          </Card>
          
          <Card className="p-4 text-center">
            <MapPin className="w-8 h-8 text-success mx-auto mb-2" />
            <div className="text-xl font-bold text-foreground">
              {mockStats.deliveryZones}
            </div>
            <div className="text-sm text-muted-foreground">
              {t.deliveryZones}
            </div>
          </Card>
        </div>

        {/* Delivery Panel Access */}
        <Button 
          variant="outline"
          size="mobile"
          className="w-full"
          onClick={onDeliveryPanel}
        >
          <Users className="w-6 h-6 mr-3" />
          {t.deliveryPanel}
        </Button>
      </div>
    </div>
  );
};