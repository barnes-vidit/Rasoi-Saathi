import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Package, 
  ShoppingCart,
  Truck,
  Users
} from "lucide-react";

interface SupplierDashboardProps {
  language: 'hi' | 'en';
  onAddInventory: () => void;
  onViewOrders: () => void;
  onDeliveryPanel: () => void;
  onCreateGroupOrder: () => void;
}

export const SupplierDashboard = ({ 
  language, 
  onAddInventory, 
  onViewOrders, 
  onDeliveryPanel,
  onCreateGroupOrder 
}: SupplierDashboardProps) => {
  const text = {
    hi: {
      title: "सप्लायर डैशबोर्ड",
      subtitle: "अपने बिजनेस को मैनेज करें",
      inventory: "इन्वेंटरी",
      inventoryDesc: "अपने आइटम्स मैनेज करें",
      orders: "ऑर्डर्स",
      ordersDesc: "आने वाले ऑर्डर्स देखें", 
      delivery: "डिलीवरी",
      deliveryDesc: "ऑर्डर्स डिस्पैच करें",
      createOrder: "ग्रुप ऑर्डर बनाएं",
      createOrderDesc: "नया ग्रुप ऑर्डर शुरू करें"
    },
    en: {
      title: "Supplier Dashboard",
      subtitle: "Manage your business",
      inventory: "Inventory",
      inventoryDesc: "Manage your items",
      orders: "Orders", 
      ordersDesc: "View incoming orders",
      delivery: "Delivery",
      deliveryDesc: "Dispatch orders",
      createOrder: "Create Group Order",
      createOrderDesc: "Start a new group order"
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
        {/* Dashboard Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className="p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={onCreateGroupOrder}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-soft/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-medium text-lg mb-2">{t.createOrder}</h3>
              <p className="text-muted-foreground text-sm">{t.createOrderDesc}</p>
            </div>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={onAddInventory}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-soft/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-medium text-lg mb-2">{t.inventory}</h3>
              <p className="text-muted-foreground text-sm">{t.inventoryDesc}</p>
            </div>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={onViewOrders}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-soft/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-medium text-lg mb-2">{t.orders}</h3>
              <p className="text-muted-foreground text-sm">{t.ordersDesc}</p>
            </div>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={onDeliveryPanel}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-soft/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-medium text-lg mb-2">{t.delivery}</h3>
              <p className="text-muted-foreground text-sm">{t.deliveryDesc}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};