import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Truck, 
  Camera, 
  Mic,
  Send,
  CheckCircle,
  MapPin,
  Users
} from "lucide-react";

interface DeliveryOrder {
  id: string;
  area: string;
  vendorCount: number;
  items: string[];
  status: 'preparing' | 'dispatched' | 'delivered';
  deliveryTime: string;
}

interface DeliveryStatusPanelProps {
  language: 'hi' | 'en';
  onBack: () => void;
}

export const DeliveryStatusPanel = ({ language, onBack }: DeliveryStatusPanelProps) => {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [proofImage, setProofImage] = useState(false);
  const [voiceNote, setVoiceNote] = useState(false);
  const [message, setMessage] = useState('');

  const text = {
    hi: {
      title: "डिलीवरी स्टेटस पैनल",
      subtitle: "ऑर्डर की स्थिति प्रबंधित करें",
      preparing: "तैयार हो रहा है",
      dispatched: "भेजा गया",
      delivered: "डिलीवर किया गया",
      markDispatched: "भेजा गया मार्क करें",
      markDelivered: "डिलीवर किया गया मार्क करें",
      uploadProof: "प्रमाण फोटो अपलोड करें",
      voiceNote: "वॉइस नोट रिकॉर्ड करें",
      notifyVendors: "सभी दुकानदारों को सूचित करें",
      message: "संदेश",
      messagePlaceholder: "दुकानदारों के लिए संदेश लिखें...",
      vendors: "दुकानदार",
      deliveryTime: "डिलीवरी समय"
    },
    en: {
      title: "Delivery Status Panel",
      subtitle: "Manage order status",
      preparing: "Preparing",
      dispatched: "Dispatched",
      delivered: "Delivered",
      markDispatched: "Mark as Dispatched",
      markDelivered: "Mark as Delivered",
      uploadProof: "Upload Proof Image",
      voiceNote: "Record Voice Note",
      notifyVendors: "Notify All Vendors",
      message: "Message",
      messagePlaceholder: "Write message for vendors...",
      vendors: "vendors",
      deliveryTime: "Delivery Time"
    }
  };

  const t = text[language];

  const mockOrders: DeliveryOrder[] = [
    {
      id: '1',
      area: 'चांदनी चौक',
      vendorCount: 8,
      items: ['आलू', 'प्याज', 'टमाटर'],
      status: 'preparing',
      deliveryTime: '2:00 PM'
    },
    {
      id: '2',
      area: 'करोल बाग',
      vendorCount: 12,
      items: ['हरी मिर्च', 'धनिया', 'अदरक'],
      status: 'dispatched',
      deliveryTime: '3:30 PM'
    },
    {
      id: '3',
      area: 'लाजपत नगर',
      vendorCount: 15,
      items: ['तेल', 'चावल', 'दाल'],
      status: 'delivered',
      deliveryTime: '1:30 PM'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'preparing':
        return <Badge variant="default">{t.preparing}</Badge>;
      case 'dispatched':
        return <Badge className="bg-warning text-warning-foreground">{t.dispatched}</Badge>;
      case 'delivered':
        return <Badge className="bg-success text-success-foreground">{t.delivered}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    setSelectedOrder(orderId);
    // Logic to update order status
  };

  const handleNotifyVendors = () => {
    // Logic to notify all vendors
    setMessage('');
    setProofImage(false);
    setVoiceNote(false);
  };

  return (
    <div className="min-h-screen bg-gradient-fresh">
      {/* Header */}
      <div className="bg-white shadow-card p-4 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="mr-3"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <div className="text-lg font-bold text-primary">RasoiLink</div>
          <h1 className="text-lg font-semibold text-foreground">
            {t.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {mockOrders.map((order) => (
          <Card key={order.id} className="p-4 shadow-card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <MapPin className="w-5 h-5 text-primary mr-2" />
                  <span className="font-semibold text-lg">
                    {order.area}
                  </span>
                </div>
                
                <div className="text-sm text-muted-foreground mb-2">
                  {order.items.join(', ')}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-1" />
                  {order.vendorCount} {t.vendors} • {order.deliveryTime}
                </div>
              </div>
              
              {getStatusBadge(order.status)}
            </div>

            {/* Action Buttons based on status */}
            <div className="space-y-3">
              {order.status === 'preparing' && (
                <Button 
                  variant="warning"
                  size="mobile"
                  className="w-full"
                  onClick={() => handleStatusUpdate(order.id, 'dispatched')}
                >
                  <Truck className="w-5 h-5 mr-2" />
                  {t.markDispatched}
                </Button>
              )}
              
              {order.status === 'dispatched' && (
                <Button 
                  variant="success"
                  size="mobile"
                  className="w-full"
                  onClick={() => handleStatusUpdate(order.id, 'delivered')}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {t.markDelivered}
                </Button>
              )}

              {order.status !== 'delivered' && (
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline"
                    className="h-12"
                    onClick={() => setProofImage(!proofImage)}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    {t.uploadProof}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="h-12"
                    onClick={() => setVoiceNote(!voiceNote)}
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    {t.voiceNote}
                  </Button>
                </div>
              )}
            </div>

            {/* Proof Upload Confirmation */}
            {proofImage && selectedOrder === order.id && (
              <div className="mt-3 p-3 bg-success/10 rounded-lg">
                <p className="text-success text-sm font-medium">
                  ✓ Proof image uploaded
                </p>
              </div>
            )}

            {/* Voice Note Confirmation */}
            {voiceNote && selectedOrder === order.id && (
              <div className="mt-3 p-3 bg-success/10 rounded-lg">
                <p className="text-success text-sm font-medium">
                  ✓ Voice note recorded
                </p>
              </div>
            )}
          </Card>
        ))}

        {/* Notification Panel */}
        <Card className="p-4 shadow-card">
          <h3 className="font-semibold mb-4 flex items-center">
            <Send className="w-5 h-5 mr-2 text-primary" />
            {t.notifyVendors}
          </h3>
          
          <div className="space-y-4">
            <Textarea
              placeholder={t.messagePlaceholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[80px]"
            />
            
            <Button 
              variant="fresh"
              size="mobile"
              className="w-full"
              onClick={handleNotifyVendors}
              disabled={!message.trim()}
            >
              <Send className="w-5 h-5 mr-2" />
              {t.notifyVendors}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};