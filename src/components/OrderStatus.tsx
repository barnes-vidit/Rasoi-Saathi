import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Clock, 
  Truck, 
  Package,
  Star,
  Home,
  Phone,
  Users
} from "lucide-react";

interface OrderStatusProps {
  language: 'hi' | 'en';
  onBackToOrders: () => void;
}

export const OrderStatus = ({ language, onBackToOrders }: OrderStatusProps) => {
  const [currentStatus, setCurrentStatus] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);

  const text = {
    hi: {
      title: "ऑर्डर स्टेटस",
      subtitle: "आपका ऑर्डर ट्रैक करें",
      orderForming: "ऑर्डर बन रहा है",
      accepted: "सप्लायर ने स्वीकार किया",
      outForDelivery: "डिलीवरी के लिए निकला",
      delivered: "डिलीवर हो गया",
      estimatedTime: "अनुमानित समय",
      callSupplier: "सप्लायर को कॉल करें",
      rateExperience: "अनुभव रेट करें",
      backToOrders: "वापस ऑर्डर पर जाएं",
      thankYou: "धन्यवाद!",
      orderComplete: "ऑर्डर पूरा हुआ",
      joinedVendors: "शामिल दुकानदार",
      groupSavings: "ग्रुप बचत"
    },
    en: {
      title: "Order Status",
      subtitle: "Track your order",
      orderForming: "Order Forming",
      accepted: "Accepted by Supplier",
      outForDelivery: "Out for Delivery",
      delivered: "Delivered",
      estimatedTime: "Estimated Time",
      callSupplier: "Call Supplier",
      rateExperience: "Rate Experience",
      backToOrders: "Back to Orders",
      thankYou: "Thank You!",
      orderComplete: "Order Complete",
      joinedVendors: "Joined Vendors", 
      groupSavings: "Group Savings"
    }
  };

  const t = text[language];

  const statusSteps = [
    {
      icon: Clock,
      title: t.orderForming,
      description: "समूह का इंतज़ार",
      time: "15 मिनट"
    },
    {
      icon: CheckCircle,
      title: t.accepted,
      description: "तैयारी शुरू",
      time: "30 मिनट"
    },
    {
      icon: Truck,
      title: t.outForDelivery,
      description: "रास्ते में है",
      time: "45 मिनट"
    },
    {
      icon: Package,
      title: t.delivered,
      description: "पहुंच गया",
      time: "पूरा"
    }
  ];

  useEffect(() => {
    // Simulate order progress
    const interval = setInterval(() => {
      if (currentStatus < statusSteps.length - 1) {
        setCurrentStatus(prev => prev + 1);
      } else {
        setShowRating(true);
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const isStepComplete = (index: number) => index <= currentStatus;
  const isCurrentStep = (index: number) => index === currentStatus;

  return (
    <div className="min-h-screen bg-gradient-fresh">
      {/* Header */}
      <div className="bg-white shadow-card p-4 sticky top-0 z-10">
        <div className="text-lg font-bold text-primary mb-1">RasoiLink</div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          {t.title}
        </h1>
        <p className="text-muted-foreground">
          {t.subtitle}
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Order ID & Group Info */}
        <Card className="p-4 shadow-card">
          <div className="text-center mb-4">
            <div className="text-sm text-muted-foreground">Order ID</div>
            <div className="font-mono text-lg font-bold">ROS1738186</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center text-xl font-bold text-primary mb-1">
                <Users className="w-5 h-5 mr-1" />
                12
              </div>
              <div className="text-xs text-muted-foreground">
                {t.joinedVendors}
              </div>
            </div>
            
            <div>
              <div className="text-xl font-bold text-success mb-1">
                ₹85
              </div>
              <div className="text-xs text-muted-foreground">
                {t.groupSavings}
              </div>
            </div>
          </div>
        </Card>

        {/* Progress Steps */}
        <Card className="p-4 shadow-card">
          <div className="space-y-6">
            {statusSteps.map((step, index) => {
              const IconComponent = step.icon;
              const isComplete = isStepComplete(index);
              const isCurrent = isCurrentStep(index);
              
              return (
                <div key={index} className="flex items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mr-4 transition-all
                    ${isComplete 
                      ? 'bg-primary text-primary-foreground' 
                      : isCurrent 
                        ? 'bg-primary/20 text-primary animate-pulse'
                        : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className={`font-semibold ${isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {isComplete ? (
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        ✓
                      </Badge>
                    ) : isCurrent ? (
                      <Badge variant="default">
                        {step.time}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        {step.time}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Contact & Actions */}
        {currentStatus >= 1 && !showRating && (
          <Card className="p-4 shadow-card">
            <Button 
              variant="outline"
              size="mobile"
              className="w-full mb-3"
            >
              <Phone className="w-5 h-5 mr-3" />
              {t.callSupplier}
            </Button>
          </Card>
        )}

        {/* Rating Section */}
        {showRating && (
          <Card className="p-6 shadow-card text-center">
            <div className="mb-4">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-success mb-2">
                {t.thankYou}
              </h3>
              <p className="text-muted-foreground">
                {t.orderComplete}
              </p>
            </div>
            
            <div className="mb-6">
              <p className="text-lg font-medium mb-4">{t.rateExperience}</p>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="icon"
                    onClick={() => setRating(star)}
                    className="p-2"
                  >
                    <Star 
                      className={`w-8 h-8 ${
                        star <= rating 
                          ? 'text-warning fill-warning' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </Button>
                ))}
              </div>
            </div>
            
            <Button 
              variant="fresh"
              size="mobile"
              className="w-full"
              onClick={onBackToOrders}
            >
              <Home className="w-6 h-6 mr-3" />
              {t.backToOrders}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};