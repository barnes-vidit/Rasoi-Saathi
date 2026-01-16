import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Camera,
  Upload,
  Save
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useOrder } from "@/context/OrderContext";

export const AddInventory = () => {
  const [itemName, setItemName] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [hasImage, setHasImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useOrder();

  const text = {
    hi: {
      title: "नई वस्तु जोड़ें",
      itemName: "वस्तु का नाम",
      itemNamePlaceholder: "जैसे: आलू, प्याज, टमाटर",
      pricePerKg: "प्रति किलो मूल्य (₹)",
      pricePlaceholder: "जैसे: 25",
      quantity: "मात्रा (किलो)",
      quantityPlaceholder: "जैसे: 100",
      availableToday: "आज उपलब्ध?",
      uploadPhoto: "फोटो अपलोड करें",
      takePhoto: "फोटो खींचें",
      saveItem: "वस्तु सेव करें"
    },
    en: {
      title: "Add New Item",
      itemName: "Item Name",
      itemNamePlaceholder: "e.g., Potatoes, Onions, Tomatoes",
      pricePerKg: "Price per KG (₹)",
      pricePlaceholder: "e.g., 25",
      quantity: "Quantity (KG)",
      quantityPlaceholder: "e.g., 100",
      availableToday: "Available Today?",
      uploadPhoto: "Upload Photo",
      takePhoto: "Take Photo",
      saveItem: "Save Item"
    }
  };

  const t = text[language];

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedImage(file);
        setHasImage(true);
      }
    };
    input.click();
  };

  const handleSave = async () => {
    if (!userProfile?.id) {
      toast({
        title: "Error",
        description: "User profile not found",
        variant: "destructive",
      });
      return;
    }

    if (!itemName || !pricePerKg || !quantity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = null;

      // Upload image if present
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `items/${userProfile.id}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('delivery-proofs')
          .upload(fileName, selectedImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('delivery-proofs')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Insert item into database
      const { error: insertError } = await supabase
        .from('items')
        .insert({
          name: itemName.trim(),
          price_per_kg: parseFloat(pricePerKg),
          available_qty: isAvailable ? parseFloat(quantity) : 0,
          supplier_id: userProfile.id,
          image_url: imageUrl
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Item added successfully!",
      });

      navigate('/supplier/inventory');
    } catch (error: any) {
      console.error('Error saving item:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-fresh relative">
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <svg className="animate-spin h-10 w-10 text-primary" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      )}
      {/* Header */}
      <div className="bg-white shadow-card p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-3"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <div className="text-lg font-bold text-primary">RasoiLink</div>
          <h1 className="text-lg font-semibold text-foreground">
            {t.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Photo Upload */}
        <Card className="p-6">
          <div className="text-center">
            {!hasImage ? (
              <div className="space-y-4">
                <div className="w-32 h-32 bg-muted rounded-lg mx-auto flex items-center justify-center border-2 border-dashed border-muted-foreground">
                  <Camera className="w-12 h-12 text-muted-foreground" />
                </div>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleImageUpload}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    {t.uploadPhoto}
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={handleImageUpload}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    {t.takePhoto}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-32 h-32 bg-success/20 rounded-lg mx-auto flex items-center justify-center">
                  <Camera className="w-12 h-12 text-success" />
                </div>
                <p className="text-success font-medium">Photo uploaded!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Item Details */}
        <Card className="p-6 space-y-6">
          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="itemName" className="text-base font-medium">
              {t.itemName}
            </Label>
            <Input
              id="itemName"
              placeholder={t.itemNamePlaceholder}
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="h-12 text-lg"
            />
          </div>

          {/* Price per KG */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-base font-medium">
              {t.pricePerKg}
            </Label>
            <Input
              id="price"
              type="number"
              placeholder={t.pricePlaceholder}
              value={pricePerKg}
              onChange={(e) => setPricePerKg(e.target.value)}
              className="h-12 text-lg"
            />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-base font-medium">
              {t.quantity}
            </Label>
            <Input
              id="quantity"
              type="number"
              placeholder={t.quantityPlaceholder}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="h-12 text-lg"
            />
          </div>

          {/* Available Today Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <Label htmlFor="available" className="text-base font-medium">
              {t.availableToday}
            </Label>
            <Switch
              id="available"
              checked={isAvailable}
              onCheckedChange={setIsAvailable}
            />
          </div>
        </Card>

        {/* Save Button */}
        <Button
          variant="fresh"
          size="mobile"
          className="w-full"
          onClick={handleSave}
          disabled={!itemName || !pricePerKg || !quantity || isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-6 h-6 mr-3" />
              {t.saveItem}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};