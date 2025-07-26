import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Smartphone, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentScreenProps {
  language: 'hi' | 'en';
  totalAmount: number;
  onBack: () => void;
  onPaymentSuccess: () => void;
  vendorOrderIds?: string[];
}

export const PaymentScreen = ({ language, totalAmount, onBack, onPaymentSuccess, vendorOrderIds }: PaymentScreenProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const text = {
    hi: {
      title: "पेमेंट करें",
      subtitle: "अपना पेमेंट मेथड चुनें",
      selectPayment: "पेमेंट मेथड चुनें",
      upiApps: "UPI ऐप्स",
      phonepe: "PhonePe",
      gpay: "Google Pay", 
      paytm: "Paytm",
      orderDetails: "ऑर्डर विवरण",
      orderId: "ऑर्डर ID",
      amount: "राशि",
      estimatedDelivery: "डिलीवरी का समय",
      payNow: "अभी पेमेंट करें",
      processing: "प्रोसेसिंग..."
    },
    en: {
      title: "Make Payment",
      subtitle: "Choose your payment method",
      selectPayment: "Select Payment Method",
      upiApps: "UPI Apps",
      phonepe: "PhonePe",
      gpay: "Google Pay",
      paytm: "Paytm", 
      orderDetails: "Order Details",
      orderId: "Order ID",
      amount: "Amount",
      estimatedDelivery: "Estimated Delivery",
      payNow: "Pay Now",
      processing: "Processing..."
    }
  };

  const t = text[language];

  const paymentMethods = [
    {
      id: 'phonepe',
      name: t.phonepe,
      icon: '📱',
      color: 'bg-purple-500'
    },
    {
      id: 'gpay',
      name: t.gpay,
      icon: '💳',
      color: 'bg-blue-500'
    },
    {
      id: 'paytm',
      name: t.paytm,
      icon: '💰',
      color: 'bg-indigo-500'
    }
  ];

  const handlePayment = async () => {
    if (!selectedMethod) return;
    
    setIsProcessing(true);
    
    try {
      // Call the simulate-payment Edge function
      const { data, error } = await supabase.functions.invoke('simulate-payment', {
        body: {
          vendorOrderIds: vendorOrderIds || [],
          amount: totalAmount,
          paymentMethod: selectedMethod
        }
      });

      if (error) throw error;

      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully!",
      });

      onPaymentSuccess();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Payment processing failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const orderId = `ROS${Date.now()}`;

  return (
    <div className="min-h-screen bg-gradient-fresh">
      {/* Header */}
      <div className="bg-white shadow-card p-4 sticky top-0 z-10">
        <div className="flex items-center mb-2">
          <Button 
            variant="ghost" 
            size="icon-lg"
            onClick={onBack}
            className="mr-4"
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

      <div className="p-4 space-y-4 pb-24">
        {/* Order Summary */}
        <Card className="p-4 shadow-card">
          <h3 className="text-lg font-semibold mb-4">{t.orderDetails}</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t.orderId}</span>
              <span className="font-mono">{orderId}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t.amount}</span>
              <span className="font-bold text-xl text-primary">₹{totalAmount}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t.estimatedDelivery}</span>
              <span className="text-success font-medium">2-3 hours</span>
            </div>
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="p-4 shadow-card">
          <h3 className="text-lg font-semibold mb-4">{t.selectPayment}</h3>
          
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              {t.upiApps}
            </div>
            
            {paymentMethods.map((method) => (
              <Card 
                key={method.id}
                className={`p-4 cursor-pointer transition-all border-2 ${
                  selectedMethod === method.id 
                    ? 'border-primary bg-primary-soft' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center text-white text-xl mr-4`}>
                    {method.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium text-lg">{method.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Pay using {method.name}
                    </div>
                  </div>
                  
                  {selectedMethod === method.id && (
                    <CheckCircle className="w-6 h-6 text-primary" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Security Notice */}
        <Card className="p-4 shadow-card bg-muted/50">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center mr-3">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div className="text-sm text-muted-foreground">
              {language === 'hi' 
                ? "आपका पेमेंट 100% सुरक्षित है। SSL एन्क्रिप्शन के साथ संरक्षित।"
                : "Your payment is 100% secure. Protected with SSL encryption."
              }
            </div>
          </div>
        </Card>
      </div>

      {/* Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-floating">
        <Button 
          variant="fresh"
          size="mobile"
          className="w-full"
          onClick={handlePayment}
          disabled={!selectedMethod || isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
              {t.processing}
            </>
          ) : (
            <>
              <CreditCard className="w-6 h-6 mr-3" />
              {t.payNow} ₹{totalAmount}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};