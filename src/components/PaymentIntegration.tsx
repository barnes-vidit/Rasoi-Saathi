import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, IndianRupee, CheckCircle, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface PaymentIntegrationProps {
  language: 'hi' | 'en';
  totalAmount: number;
  cartItems: any[];
  groupOrderId: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const PaymentIntegration = ({ 
  language, 
  totalAmount, 
  cartItems, 
  groupOrderId,
  onBack, 
  onSuccess 
}: PaymentIntegrationProps) => {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [paymentId, setPaymentId] = useState<string>('');
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const text = {
    hi: {
      title: "पेमेंट",
      subtitle: "अपना ऑर्डर कन्फर्म करें",
      orderSummary: "ऑर्डर सारांश",
      total: "कुल राशि",
      discount: "ग्रुप डिस्काउंट (15%)",
      finalAmount: "अंतिम राशि",
      payNow: "अभी पे करें",
      processing: "प्रोसेसिंग...",
      success: "पेमेंट सफल!",
      failed: "पेमेंट असफल",
      retry: "फिर से कोशिश करें"
    },
    en: {
      title: "Payment",
      subtitle: "Confirm your order",
      orderSummary: "Order Summary",
      total: "Total Amount",
      discount: "Group Discount (15%)",
      finalAmount: "Final Amount",
      payNow: "Pay Now",
      processing: "Processing...",
      success: "Payment Successful!",
      failed: "Payment Failed",
      retry: "Retry Payment"
    }
  };

  const t = text[language];

  const originalAmount = cartItems.reduce((sum, item) => sum + (item.pricePerKg * item.quantity), 0);
  const discountAmount = Math.round(originalAmount * 0.15);

  // Mock UPI payment simulation
  const handlePayment = async () => {
    setPaymentStatus('processing');
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock payment success (90% success rate for demo)
      const isSuccess = Math.random() > 0.1;
      const mockPaymentId = `UPI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (isSuccess) {
        setPaymentId(mockPaymentId);
        setPaymentStatus('success');
        
        // Create vendor orders for each item
        const vendorOrders = cartItems.map(item => ({
          vendor_id: userProfile?.id,
          group_order_id: groupOrderId,
          item_id: item.id,
          quantity: item.quantity,
          paid: true,
          payment_id: mockPaymentId
        }));

        const { error } = await supabase
          .from('vendor_orders')
          .insert(vendorOrders);

        if (error) throw error;

        // Update group order totals
        await supabase.rpc('update_group_totals', { 
          group_order_id_param: groupOrderId 
        });

        toast({
          title: "Success",
          description: t.success,
        });

        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setPaymentStatus('failed');
        toast({
          title: "Payment Failed",
          description: "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      toast({
        title: "Error",
        description: "Payment processing failed",
        variant: "destructive",
      });
    }
  };

  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case 'processing':
        return (
          <Card className="p-6 text-center">
            <Clock className="w-16 h-16 text-warning mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-medium mb-2">{t.processing}</h3>
            <p className="text-muted-foreground">Please wait while we process your payment...</p>
          </Card>
        );
      
      case 'success':
        return (
          <Card className="p-6 text-center bg-success/10 border-success">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2 text-success">{t.success}</h3>
            <p className="text-muted-foreground mb-4">Payment ID: {paymentId}</p>
            <p className="text-sm text-muted-foreground">Redirecting to order status...</p>
          </Card>
        );
      
      case 'failed':
        return (
          <Card className="p-6 text-center bg-destructive/10 border-destructive">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2 text-destructive">{t.failed}</h3>
            <p className="text-muted-foreground mb-4">Something went wrong with your payment</p>
            <Button 
              variant="destructive" 
              onClick={() => setPaymentStatus('pending')}
            >
              {t.retry}
            </Button>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-fresh">
      {/* Header */}
      <div className="bg-white shadow-card p-4">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="icon-lg"
            onClick={onBack}
            className="mr-4"
            disabled={paymentStatus === 'processing'}
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

      <div className="p-4 space-y-6">
        {paymentStatus !== 'pending' ? renderPaymentStatus() : (
          <>
            {/* Order Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">{t.orderSummary}</h3>
              
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground ml-2">
                        {item.quantity}kg × ₹{item.pricePerKg}
                      </span>
                    </div>
                    <span className="font-medium">
                      ₹{item.quantity * item.pricePerKg}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payment Breakdown */}
            <Card className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>{t.total}</span>
                  <span>₹{originalAmount}</span>
                </div>
                
                <div className="flex justify-between text-success">
                  <span>{t.discount}</span>
                  <span>-₹{discountAmount}</span>
                </div>
                
                <hr className="my-3" />
                
                <div className="flex justify-between text-xl font-bold">
                  <span>{t.finalAmount}</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>
            </Card>

            {/* UPI Payment Options */}
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">UPI Payment</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">GPay</span>
                    </div>
                    <span className="text-sm">Google Pay</span>
                  </div>
                  
                  <div className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-lg">PE</span>
                    </div>
                    <span className="text-sm">PhonePe</span>
                  </div>
                  
                  <div className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">P</span>
                    </div>
                    <span className="text-sm">Paytm</span>
                  </div>
                  
                  <div className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-orange-600" />
                    </div>
                    <span className="text-sm">Other UPI</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Pay Button */}
            <Button 
              variant="mobile"
              size="mobile"
              className="w-full"
              onClick={handlePayment}
            >
              <IndianRupee className="w-5 h-5 mr-2" />
              {t.payNow} ₹{totalAmount}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};