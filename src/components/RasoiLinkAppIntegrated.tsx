import { useState, useEffect } from "react";
import { LanguagePicker } from "./LanguagePicker";
import { PhoneLoginIntegrated } from "./PhoneLoginIntegrated";
import { GroupOrdersListIntegrated } from "./GroupOrdersListIntegrated";
import { VendorSelection } from "./VendorSelection";
import { ItemSelection } from "./ItemSelection";
import { OrderSummary } from "./OrderSummary";
import { PaymentScreen } from "./PaymentScreen";
import { OrderStatus } from "./OrderStatus";
import { SupplierDashboard } from "./SupplierDashboard";
import { AddInventory } from "./AddInventory";
import { IncomingGroupOrders } from "./IncomingGroupOrders";
import { DeliveryStatusPanel } from "./DeliveryStatusPanel";
import { useAuth } from "@/hooks/useAuth";

type AppScreen = 
  | 'language' 
  | 'login' 
  | 'orders' 
  | 'vendors'
  | 'items' 
  | 'summary' 
  | 'payment' 
  | 'status'
  | 'supplier-dashboard'
  | 'add-inventory'
  | 'incoming-orders'
  | 'delivery-panel';

export const RasoiLinkAppIntegrated = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('language');
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [userType, setUserType] = useState<'vendor' | 'supplier'>('vendor');
  const [selectedGroupOrder, setSelectedGroupOrder] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  const { user, userProfile, userType: authUserType, loading } = useAuth();

  // Auto-navigate based on auth state
  useEffect(() => {
    if (loading) return;
    
    if (user && userProfile && authUserType) {
      if (authUserType === 'vendor') {
        setCurrentScreen('orders');
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
    // Navigation is handled by useEffect above
  };

  const handleJoinOrder = (orderId: string) => {
    setSelectedGroupOrder(orderId);
    setCurrentScreen('items');
  };

  const handleStartOrder = () => {
    setSelectedGroupOrder(null);
    setCurrentScreen('vendors');
  };

  const handleVendorSelect = (vendorId: string) => {
    setSelectedVendor(vendorId);
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
    setCurrentScreen('add-inventory');
  };

  const handleViewOrders = () => {
    setCurrentScreen('incoming-orders');
  };

  const handleDeliveryPanel = () => {
    setCurrentScreen('delivery-panel');
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
            onVendorSelect={handleVendorSelect}
          />
        );
      
      case 'items':
        return (
          <ItemSelection 
            language={language}
            onBack={() => setCurrentScreen(selectedVendor ? 'vendors' : 'orders')}
            onAddToCart={handleAddToCart}
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
          <PaymentScreen 
            language={language}
            totalAmount={totalAmount}
            onBack={() => setCurrentScreen('summary')}
            onPaymentSuccess={handlePaymentSuccess}
          />
        );
      
      case 'status':
        return (
          <OrderStatus 
            language={language}
            onBackToOrders={handleBackToOrders}
          />
        );

      case 'supplier-dashboard':
        return (
          <SupplierDashboard 
            language={language}
            onAddInventory={handleAddInventory}
            onViewOrders={handleViewOrders}
            onDeliveryPanel={handleDeliveryPanel}
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