import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrder } from "@/context/OrderContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Zone {
  id: string; // The zone table UUID, but we might want to use 'name' as id if we store name in profiles? 
  // The current app stores 'Lajpat Nagar' (name) in profile.zone.
  // So let's map DB data to fit.
  name: string; // Hindi name or proper display name?
  nameEn: string;
  value: string; // The value to store
}

export const ZoneSelection = () => {
  const navigate = useNavigate();
  const { language } = useOrder();
  const { userProfile, updateVendorZone } = useAuth();
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    if (userProfile?.zone) {
      setSelectedZone(userProfile.zone);
    }
    fetchZones();
  }, [userProfile]);

  const fetchZones = async () => {
    try {
      const { data, error } = await supabase.from('zones').select('*').order('name');
      if (error) throw error;

      if (data) {
        setZones(data.map(z => ({
          id: z.id,
          name: z.display_name_hi || z.name, // Display Name Hindi
          nameEn: z.display_name_en || z.name, // Display Name English
          value: z.name // Stored value
        })));
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
      // Fallback
      const fallback = [
        { id: '1', name: 'लाजपत नगर / Lajpat Nagar', nameEn: 'Lajpat Nagar', value: 'Lajpat Nagar' },
        { id: '2', name: 'करोल बाग / Karol Bagh', nameEn: 'Karol Bagh', value: 'Karol Bagh' },
        { id: '3', name: 'चांदनी चौक / Chandni Chowk', nameEn: 'Chandni Chowk', value: 'Chandni Chowk' },
        { id: '4', name: 'कनॉट प्लेस / Connaught Place', nameEn: 'Connaught Place', value: 'Connaught Place' },
        { id: '5', name: 'पहाड़गंज / Paharganj', nameEn: 'Paharganj', value: 'Paharganj' },
        { id: '6', name: 'सरोजिनी नगर / Sarojini Nagar', nameEn: 'Sarojini Nagar', value: 'Sarojini Nagar' },
      ];
      setZones(fallback);
    }
  }

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

  const handleZoneSelect = (zoneValue: string) => {
    setSelectedZone(zoneValue);
  };

  const handleConfirm = async () => {
    if (selectedZone) {
      setLoading(true);
      const { error } = await updateVendorZone(selectedZone);
      setLoading(false);

      if (!error) {
        navigate('/vendor/dashboard');
      }
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

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Zone List */}
        <div className="space-y-3">
          {zones.map((zone) => (
            <Card
              key={zone.id}
              className={`p-4 cursor-pointer transition-all border-2 ${selectedZone === zone.value
                ? 'border-primary bg-primary-soft/20'
                : 'border-border hover:border-primary/50'
                }`}
              onClick={() => handleZoneSelect(zone.value)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 text-primary mr-4" />
                  <div>
                    <div className="font-medium text-lg">
                      {language === 'hi' ? `${zone.name} / ${zone.nameEn}` : zone.nameEn}
                    </div>
                  </div>
                </div>

                {selectedZone === zone.value && (
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
            className="w-full mt-6"
            onClick={handleConfirm}
            disabled={selectedZone === '' || loading}
          >
            {loading ? (
              <span className="flex items-center justify-center"><span className="animate-spin mr-2">⏳</span>Confirming...</span>
            ) : t.confirm}
          </Button>
        </div>
      </div>
    </div>
  );
};