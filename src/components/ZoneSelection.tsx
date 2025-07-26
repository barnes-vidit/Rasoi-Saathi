import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, CheckCircle } from "lucide-react";

interface ZoneSelectionProps {
  language: 'hi' | 'en';
  onBack: () => void;
  onZoneSelect: (zone: string) => void;
  currentZone?: string;
}

export const ZoneSelection = ({ language, onBack, onZoneSelect, currentZone }: ZoneSelectionProps) => {
  const [selectedZone, setSelectedZone] = useState<string>(currentZone || '');

  const text = {
    hi: {
      title: "अपना एरिया चुनें",
      subtitle: "अपने डिलीवरी एरिया को सेलेक्ट करें",
      selectZone: "एरिया चुनें",
      confirm: "कन्फर्म करें"
    },
    en: {
      title: "Select Your Area",
      subtitle: "Choose your delivery area",
      selectZone: "Select Area",
      confirm: "Confirm"
    }
  };

  const t = text[language];

  const zones = [
    { id: 'Zone A', name: 'चांदनी चौक / Chandni Chowk', nameEn: 'Chandni Chowk' },
    { id: 'Zone B', name: 'करोल बाग / Karol Bagh', nameEn: 'Karol Bagh' },
    { id: 'Zone C', name: 'लाजपत नगर / Lajpat Nagar', nameEn: 'Lajpat Nagar' },
    { id: 'Zone D', name: 'गाजीपुर मंडी / Ghazipur Mandi', nameEn: 'Ghazipur Mandi' },
    { id: 'Zone E', name: 'साकेत / Saket', nameEn: 'Saket' },
    { id: 'Zone F', name: 'द्वारका / Dwarka', nameEn: 'Dwarka' },
  ];

  const handleZoneSelect = (zoneId: string) => {
    setSelectedZone(zoneId);
  };

  const handleConfirm = () => {
    if (selectedZone) {
      onZoneSelect(selectedZone);
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

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Zone List */}
        <div className="space-y-3">
          {zones.map((zone) => (
            <Card 
              key={zone.id} 
              className={`p-4 cursor-pointer transition-all border-2 ${
                selectedZone === zone.id 
                  ? 'border-primary bg-primary-soft/20' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleZoneSelect(zone.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 text-primary mr-4" />
                  <div>
                    <div className="font-medium text-lg">
                      {language === 'hi' ? zone.name : zone.nameEn}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {zone.id}
                    </div>
                  </div>
                </div>
                
                {selectedZone === zone.id && (
                  <CheckCircle className="w-6 h-6 text-primary" />
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Confirm Button */}
        <div className="sticky bottom-4 pt-4">
          <Button 
            variant="mobile"
            size="mobile"
            className="w-full"
            onClick={handleConfirm}
            disabled={!selectedZone}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {t.confirm}
          </Button>
        </div>
      </div>
    </div>
  );
};