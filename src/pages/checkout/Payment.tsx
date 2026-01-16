import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CreditCard, IndianRupee, CheckCircle, XCircle, Clock, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useOrder } from "@/context/OrderContext";

export const PaymentIntegration = () => {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [paymentId, setPaymentId] = useState<string>('');
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language, cartItems, totalAmount, selectedGroupOrder, clearCart } = useOrder();

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

  // Recalculate if context gives 0 (could add logic in context to persist or re-calc)
  // But context typically holds state. 
  // Let's assume context values are correct.
  // We can also re-derive discount from totalAmount if needed.
  const discountAmount = Math.round((totalAmount / 0.85) * 0.15); // Reverse engineering for display or just use standard calc
  // A better way:
  const originalAmount = cartItems.reduce((sum, item) => sum + (item.pricePerKg * item.quantity), 0);
  const calculatedDiscount = Math.round(originalAmount * 0.15);
  const finalAmount = originalAmount - calculatedDiscount; // Should match totalAmount (which is discounted in context?)
  // Actually context `totalAmount` is usually the *sum of items*. `discountedAmount` is the final.
  // Checking OrderContext: `totalAmount` is sum. `discountedAmount` is 85%.
  // So I should use `discountedAmount` for payment.
  // Wait, let's check `OrderContext.tsx` again.
  // Step 155 shows: `setDiscountedAmount(Math.round(total * 0.85));`
  // And exposed as `discountedAmount`.

  // So Payment should use `discountedAmount` for actual payment.

  const { discountedAmount } = useOrder();

  // Mock UPI payment simulation
  const handlePayment = async () => {
    if (!userProfile?.id || paymentStatus === 'processing') return;

    setPaymentStatus('processing');

    try {
      // First verify the order is still valid
      if (!selectedGroupOrder) throw new Error('No active group order found');

      const { data: orderCheck, error: orderError } = await supabase
        .from('group_orders')
        .select('status')
        .eq('id', selectedGroupOrder)
        .single();

      if (orderError || !orderCheck || orderCheck.status !== 'forming') {
        throw new Error('Order is no longer valid for payment');
      }

      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          amount: discountedAmount,
          group_order_id: selectedGroupOrder,
          items: cartItems
        }
      });

      if (error) {
        throw error;
      }

      // Update payment status
      setPaymentStatus('success');
      setPaymentId(data.payment_id);

      // Show success message
      toast({
        title: t.success,
        description: `Payment ID: ${data.payment_id}`,
      });

      // Clear cart
      clearCart();

      // Call success callback -> navigate
      setTimeout(() => {
        navigate('/order-status');
      }, 2000);
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      toast({
        title: t.failed,
        description: error.message || "Payment processing failed",
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

  if (cartItems.length === 0 && paymentStatus === 'pending') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-fresh">
        <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">{language === 'hi' ? 'कोई आइटम नहीं मिला' : 'No items in cart'}</h3>
        <Button onClick={() => navigate(-1)}>{language === 'hi' ? 'वापस' : 'Go Back'}</Button>
      </div>
    );
  }

  if (paymentStatus === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="ml-4 text-lg">{t.processing}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-fresh">
      {/* Header */}
      <div className="bg-white shadow-card p-4">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={() => navigate(-1)}
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
                  <span>-₹{calculatedDiscount}</span>
                </div>

                <hr className="my-3" />

                <div className="flex justify-between text-xl font-bold">
                  <span>{t.finalAmount}</span>
                  <span>₹{discountedAmount}</span>
                </div>
              </div>
            </Card>

            {/* UPI Payment Options */}
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">UPI Payment</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 border rounded-lg text-center cursor-pointer hover:bg-gray-50 bg-white" onClick={handlePayment}>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">GPay</span>
                    </div>
                    <span className="text-sm">Google Pay</span>
                  </div>

                  <div className="p-4 border rounded-lg text-center cursor-pointer hover:bg-gray-50 bg-white" onClick={handlePayment}>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-lg">PE</span>
                    </div>
                    <span className="text-sm">PhonePe</span>
                  </div>

                  <div className="p-4 border rounded-lg text-center cursor-pointer hover:bg-gray-50 bg-white" onClick={handlePayment}>
                    <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">P</span>
                    </div>
                    <span className="text-sm">Paytm</span>
                  </div>

                  <div className="p-4 border rounded-lg text-center cursor-pointer hover:bg-gray-50 bg-white" onClick={handlePayment}>
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
              {t.payNow} ₹{discountedAmount}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};