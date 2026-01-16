import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { OrderProvider } from "@/context/OrderContext";

// Pages
import { PhoneLoginIntegrated as Login } from "@/pages/Login";
import { ZoneSelection } from "@/pages/vendor/ZoneSelection";
import { GroupOrdersListIntegrated as VendorDashboard } from "@/pages/vendor/Dashboard";
import { VendorSelection as SupplierSelection } from "@/pages/vendor/SupplierSelection";
import { ItemSelection } from "@/pages/vendor/ItemSelection";
import { OrderSummary as Cart } from "@/pages/checkout/Cart";
import { PaymentIntegration as Payment } from "@/pages/checkout/Payment";
import { OrderStatusIntegrated as OrderStatus } from "@/pages/OrderStatus";

// Supplier Pages
import { SupplierDashboard } from "@/pages/supplier/Dashboard";
import { InventoryManagement } from "@/pages/supplier/InventoryManagement";
import { AddInventory } from "@/pages/supplier/AddInventory";
import { IncomingGroupOrders } from "@/pages/supplier/IncomingOrders";
import { DispatchPanel } from "@/pages/supplier/DispatchPanel";
import { DeliveryStatusPanel } from "@/pages/supplier/DeliveryStatusPanel";
import { CreateGroupOrder } from "@/pages/CreateGroupOrder";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OrderProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Common Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />

              {/* Vendor Routes */}
              <Route path="/zone-select" element={<ZoneSelection />} />
              <Route path="/vendor/dashboard" element={<VendorDashboard />} />
              <Route path="/suppliers" element={<SupplierSelection />} />
              <Route path="/items" element={<ItemSelection />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/order-status" element={<OrderStatus />} />

              {/* Supplier Routes */}
              <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
              <Route path="/supplier/inventory" element={<InventoryManagement />} />
              <Route path="/supplier/add-inventory" element={<AddInventory />} />
              <Route path="/supplier/incoming-orders" element={<IncomingGroupOrders />} />
              <Route path="/supplier/dispatch" element={<DispatchPanel />} />
              <Route path="/supplier/delivery" element={<DeliveryStatusPanel />} />
              <Route path="/create-group-order" element={<CreateGroupOrder />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </OrderProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

