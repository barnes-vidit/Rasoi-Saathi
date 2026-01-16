import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Clock, CreditCard, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrder } from "@/context/OrderContext";

export const OrderSummary = () => {
  const navigate = useNavigate();
  const { language, cartItems } = useOrder();

  const text = {
    hi: {
      title: "ऑर्डर समरी",
      subtitle: "ग्रुप ऑर्डर की जानकारी",
      groupSize: "ग्रुप साइज़",
      vendors: "दुकानदार",
      timeLeft: "समय बचा",
      yourOrder: "आपका ऑर्डर",
      quantity: "मात्रा",
      price: "कीमत",
      originalPrice: "असली कीमत",
      groupPrice: "ग्रुप कीमत",
      savings: "बचत",
      totalAmount: "कुल राशि",
      proceedToPay: "पेमेंट करें",
      groupDiscount: "ग्रुप डिस्काउंट"
    },
    en: {
      title: "Order Summary",
      subtitle: "Group order details",
      groupSize: "Group Size",
      vendors: "vendors",
      timeLeft: "Time Left",
      yourOrder: "Your Order",
      quantity: "Quantity",
      price: "Price",
      originalPrice: "Original Price",
      groupPrice: "Group Price",
      savings: "Savings",
      totalAmount: "Total Amount",
      proceedToPay: "Proceed to Pay",
      groupDiscount: "Group Discount"
    }
  };

  const t = text[language];

  // Mock group data
  const groupData = {
    size: 12,
    timeLeft: "45 मिनट",
    discount: 15
  };

  const calculateOriginalPrice = () => {
    return cartItems.reduce((sum, item) => sum + (item.pricePerKg * item.quantity), 0);
  };

  const calculateGroupPrice = () => {
    const original = calculateOriginalPrice();
    return Math.round(original * (1 - groupData.discount / 100));
  };

  const calculateSavings = () => {
    return calculateOriginalPrice() - calculateGroupPrice();
  };

  return (
    <div className="min-h-screen bg-gradient-fresh">
      {/* Header */}
      <div className="bg-white shadow-card p-4 sticky top-0 z-10">
        <div className="flex items-center mb-2">
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={() => navigate(-1)}
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
        {/* Group Status */}
        <Card className="p-4 shadow-card">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center text-2xl font-bold text-primary mb-1">
                <Users className="w-6 h-6 mr-2" />
                {groupData.size}
              </div>
              <div className="text-sm text-muted-foreground">
                {t.vendors}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center text-2xl font-bold text-warning mb-1">
                <Clock className="w-6 h-6 mr-2" />
                45
              </div>
              <div className="text-sm text-muted-foreground">
                minutes
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center text-2xl font-bold text-success mb-1">
                <TrendingDown className="w-6 h-6 mr-2" />
                {groupData.discount}%
              </div>
              <div className="text-sm text-muted-foreground">
                {t.groupDiscount}
              </div>
            </div>
          </div>
        </Card>

        {/* Your Order Items */}
        <Card className="p-4 shadow-card">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span>{t.yourOrder}</span>
          </h3>

          <div className="space-y-3">
            {cartItems.map((item, index) => {
              const displayName = item.name; // Simplified, in real app might have nameHi
              const originalItemPrice = item.pricePerKg * item.quantity;
              const groupItemPrice = Math.round(originalItemPrice * (1 - groupData.discount / 100));

              return (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center flex-1">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={displayName}
                        className="w-12 h-12 rounded-lg object-cover mr-3"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 mr-3 flex items-center justify-center text-xs">No Img</div>
                    )}
                    <div>
                      <div className="font-medium">{displayName}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.quantity} kg
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-primary">₹{groupItemPrice}</div>
                    <div className="text-xs text-muted-foreground line-through">₹{originalItemPrice}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Price Breakdown */}
        <Card className="p-4 shadow-card">
          <div className="space-y-3">
            <div className="flex justify-between text-muted-foreground">
              <span>{t.originalPrice}</span>
              <span>₹{calculateOriginalPrice()}</span>
            </div>

            <div className="flex justify-between text-success">
              <span>{t.groupDiscount} (-{groupData.discount}%)</span>
              <span>-₹{calculateSavings()}</span>
            </div>

            <div className="border-t border-border pt-3">
              <div className="flex justify-between text-xl font-bold">
                <span>{t.totalAmount}</span>
                <span className="text-primary">₹{calculateGroupPrice()}</span>
              </div>
            </div>

            <Badge variant="secondary" className="w-full justify-center py-2 bg-success/10 text-success border-success/20">
              <TrendingDown className="w-4 h-4 mr-2" />
              {t.savings}: ₹{calculateSavings()}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Proceed to Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-floating">
        <Button
          variant="fresh"
          size="mobile"
          className="w-full"
          onClick={() => navigate('/payment')}
        >
          <CreditCard className="w-6 h-6 mr-3" />
          {t.proceedToPay} ₹{calculateGroupPrice()}
        </Button>
      </div>
    </div>
  );
};