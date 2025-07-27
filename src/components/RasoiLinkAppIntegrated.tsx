import { useState, useEffect } from "react";
import { LanguagePicker } from "./LanguagePicker";
import { PhoneLoginIntegrated } from "./PhoneLoginIntegrated";
import { GroupOrdersListIntegrated } from "./GroupOrdersListIntegrated";
import { VendorSelection } from "./VendorSelection";
import { ItemSelection } from "./ItemSelection";
import { OrderSummary } from "./OrderSummary";
import { PaymentIntegration } from "./PaymentIntegration";
import { OrderStatus } from "./OrderStatus";
import { SupplierDashboard } from "./SupplierDashboard";
import { AddInventory } from "./AddInventory";
import { IncomingGroupOrders } from "./IncomingGroupOrders";
import { DeliveryStatusPanel } from "./DeliveryStatusPanel";
import { ZoneSelection } from "./ZoneSelection";
import { OrderStatusIntegrated } from "./OrderStatusIntegrated";
import { SupplierDispatchPanel } from "./SupplierDispatchPanel";
import { CreateGroupOrder } from "./CreateGroupOrder";
import { InventoryManagement } from "./InventoryManagement";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type AppScreen = 
  | 'language' 
  | 'login' 
  | 'zone-select'
  | 'orders'
  | 'vendors'
  | 'items'
  | 'summary'
  | 'payment'
  | 'status'
  | 'supplier-dashboard'
  | 'add-inventory'
  | 'incoming-orders'
  | 'delivery-panel'
  | 'dispatch-panel'
  | 'create-group-order'
  | 'inventory-management';

export const RasoiLinkAppIntegrated = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('language');
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [userType, setUserType] = useState<'vendor' | 'supplier'>('vendor');
  const [selectedGroupOrder, setSelectedGroupOrder] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  const { user, userProfile, userType: authUserType, loading } = useAuth();

  // Auto-navigate based on auth state
  useEffect(() => {
    if (loading) return;
    
    if (user && userProfile && authUserType) {
      if (authUserType === 'vendor') {
        // If vendor doesn't have a zone yet, go to zone selection
        // If vendor has a zone, go to orders
        if (!userProfile.zone) {
          setCurrentScreen('zone-select');
        } else {
          setCurrentScreen('orders');
        }
      } else {
        setCurrentScreen('supplier-dashboard');
      }
    } else if (!user && currentScreen !== 'language' && currentScreen !== 'login') {
      setCurrentScreen('language');
    }
  }, [user, userProfile, authUserType, loading, currentScreen]);

  const handleLanguageSelect = (lang: 'hi' | 'en') => {
    setLanguage(lang);
    setCurrentScreen('login');
  };

  const handleLoginSuccess = () => {
    console.log('Login successful, userProfile:', userProfile);
    if (userProfile?.userType === 'supplier') {
      setCurrentScreen('supplier-dashboard');
    } else {
      setCurrentScreen('zone-select');
    }
  };

  const handleZoneSelect = async (zone: string) => {
    // Update vendor zone in database
    if (userProfile?.id) {
      try {
        const { error } = await supabase
          .from('vendors')
          .update({ zone })
          .eq('id', userProfile.id);
        
        if (error) {
          console.error('Zone update error:', error);
          // Still proceed to orders screen even if update fails
        }
        
        setCurrentScreen('orders');
      } catch (err) {
        console.error('Zone selection error:', err);
        // Proceed anyway
        setCurrentScreen('orders');
      }
    }
  };

  const handleJoinOrder = (orderId: string) => {
    setSelectedGroupOrder(orderId);
    setCurrentScreen('items');
  };

  const handleStartOrder = () => {
    console.log('Starting new order, navigating to vendors screen');
    setSelectedGroupOrder(null);
    setCurrentScreen('vendors');
  };

  const handleSupplierSelect = (supplierId: string) => {
    setSelectedSupplier(supplierId);
    setCurrentScreen('items');
  };

  const handleAddToCart = (items: any[]) => {
    setCartItems(items);
    setCurrentScreen('summary');
  };

  const handleProceedToPay = () => {
    // Calculate total with group discount
    const originalTotal = cartItems.reduce((sum, item) => sum + (item.pricePerKg * item.quantity), 0);
    const discountedTotal = Math.round(originalTotal * 0.85); // 15% group discount
    setTotalAmount(discountedTotal);
    setCurrentScreen('payment');
  };

  const handlePaymentSuccess = () => {
    setCurrentScreen('status');
  };

  const handleBackToOrders = () => {
    setCurrentScreen('orders');
  };

  // Supplier handlers
  const handleAddInventory = () => {
    setCurrentScreen('inventory-management');
  };

  const handleViewOrders = () => {
    setCurrentScreen('incoming-orders');
  };

  const handleDeliveryPanel = () => {
    setCurrentScreen('dispatch-panel');
  };

  const handleCreateGroupOrder = () => {
    setCurrentScreen('create-group-order');
  };

  const handleAcceptOrder = (orderId: string) => {
    // Logic to accept order
    console.log('Accepted order:', orderId);
  };

  const handleInventorySave = () => {
    setCurrentScreen('supplier-dashboard');
  };

  // Show loading screen while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-fresh flex items-center justify-center">
        <div className="text-xl font-bold text-primary">RasoiLink</div>
      </div>
    );
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'language':
        return <LanguagePicker onLanguageSelect={handleLanguageSelect} />;
      
      case 'login':
        return (
          <PhoneLoginIntegrated 
            language={language}
            onBack={() => setCurrentScreen('language')}
            onSuccess={handleLoginSuccess}
            userType={userType}
            onUserTypeChange={setUserType}
          />
        );
      
        case 'zone-select':
          return (
            <ZoneSelection
              language={language}
              onZoneSelect={handleZoneSelect}
              onBack={() => setCurrentScreen('language')}
            />
          );
        case 'orders':
          return (
            <GroupOrdersListIntegrated
              language={language}
              onJoinOrder={handleJoinOrder}
              onStartOrder={handleStartOrder}
            />
          );
      
      case 'vendors':
        return (
          <VendorSelection 
            language={language}
            onBack={() => setCurrentScreen('orders')}
            onVendorSelect={handleSupplierSelect}
          />
        );
      
      case 'items':
        return (
          <ItemSelection 
            language={language}
            onBack={() => setCurrentScreen(selectedSupplier ? 'vendors' : 'orders')}
            onAddToCart={handleAddToCart}
            supplierId={selectedSupplier || undefined}
          />
        );
      
      case 'summary':
        return (
          <OrderSummary 
            language={language}
            cartItems={cartItems}
            onBack={() => setCurrentScreen('items')}
            onProceedToPay={handleProceedToPay}
          />
        );
      
      case 'payment':
        return (
          <PaymentIntegration 
            language={language}
            totalAmount={totalAmount}
            cartItems={cartItems}
            groupOrderId={selectedGroupOrder || ''}
            onBack={() => setCurrentScreen('summary')}
            onSuccess={handlePaymentSuccess}
          />
        );
      
      case 'status':
        return (
          <OrderStatusIntegrated 
            language={language}
            onBack={handleBackToOrders}
          />
        );

      case 'supplier-dashboard':
        return (
          <SupplierDashboard 
            language={language}
            onAddInventory={handleAddInventory}
            onViewOrders={handleViewOrders}
            onDeliveryPanel={handleDeliveryPanel}
            onCreateGroupOrder={handleCreateGroupOrder}
          />
        );

      case 'inventory-management':
        return (
          <InventoryManagement 
            language={language}
            onBack={() => setCurrentScreen('supplier-dashboard')}
          />
        );

      case 'create-group-order':
        return (
          <CreateGroupOrder 
            language={language}
            onBack={() => setCurrentScreen('supplier-dashboard')}
            onSuccess={() => setCurrentScreen('incoming-orders')}
          />
        );

      case 'add-inventory':
        return (
          <AddInventory 
            language={language}
            onBack={() => setCurrentScreen('supplier-dashboard')}
            onSave={handleInventorySave}
          />
        );

      case 'incoming-orders':
        return (
          <IncomingGroupOrders 
            language={language}
            onBack={() => setCurrentScreen('supplier-dashboard')}
            onAcceptOrder={handleAcceptOrder}
          />
        );

      case 'delivery-panel':
        return (
          <DeliveryStatusPanel 
            language={language}
            onBack={() => setCurrentScreen('supplier-dashboard')}
          />
        );

      case 'dispatch-panel':
        return (
          <SupplierDispatchPanel 
            language={language}
            onBack={() => setCurrentScreen('supplier-dashboard')}
          />
        );
      
      default:
        return <LanguagePicker onLanguageSelect={handleLanguageSelect} />;
    }
  };

  return (
    <div className="font-sans">
      {renderCurrentScreen()}
    </div>
  );
};