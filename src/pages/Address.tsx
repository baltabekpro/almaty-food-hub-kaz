import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import { CITIES } from '../data/restaurantsData';
import { MapPin, Loader2, Search } from 'lucide-react';
import MapComponent from '@/components/MapComponent';
import { 
  geocodeAddress, 
  DEFAULT_CENTER, 
  getAddressSuggestions, 
  AddressSuggestion 
} from '@/lib/mapbox';

const Address = () => {
  const { t } = useLanguage();
  const { setUserAddress } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [house, setHouse] = useState('');
  const [apartment, setApartment] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AddressSuggestion | null>(null);
  
  // Map state
  const [coordinates, setCoordinates] = useState<[number, number]>(DEFAULT_CENTER);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  // Ref to detect clicks outside suggestions dropdown
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Get city name from selected city ID
  const getSelectedCityName = () => {
    return CITIES.find(c => c.id === city)?.name || '';
  };
  
  // Search for street suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (street.length < 3 || !city) {
        setSuggestions([]);
        return;
      }
      
      setIsLoadingSuggestions(true);
      try {
        const cityName = getSelectedCityName();
        const addressSuggestions = await getAddressSuggestions(street, cityName);
        setSuggestions(addressSuggestions);
        setShowSuggestions(addressSuggestions.length > 0);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };
    
    const timeoutId = setTimeout(fetchSuggestions, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [street, city]);
  
  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    setSelectedSuggestion(suggestion);
    
    // Extract street and house number from the suggestion
    // This is a basic implementation - you might need to adjust based on the actual format
    const addressParts = suggestion.place_name.split(',');
    if (addressParts.length > 0) {
      const mainAddress = addressParts[0].trim();
      
      // Try to extract house number
      const match = mainAddress.match(/(\d+)$/);
      if (match) {
        const houseNumber = match[1];
        const streetName = mainAddress.replace(match[0], '').trim();
        
        setStreet(streetName);
        setHouse(houseNumber);
      } else {
        setStreet(mainAddress);
      }
    }
    
    // Update map coordinates
    setCoordinates(suggestion.center);
    setShowSuggestions(false);
  };
  
  // Update map when address fields change manually
  const updateMapLocation = async () => {
    if (city && street && house) {
      setIsGeocodingLoading(true);
      try {
        const cityName = getSelectedCityName();
        const fullAddress = `${street}, ${house}`;
        
        const geocodedLocation = await geocodeAddress(fullAddress, cityName);
        if (geocodedLocation) {
          setCoordinates([geocodedLocation.longitude, geocodedLocation.latitude]);
        }
      } catch (error) {
        console.error('Error geocoding address:', error);
      } finally {
        setIsGeocodingLoading(false);
      }
    }
  };
  
  // Update map when address fields change manually (not from suggestions)
  useEffect(() => {
    if (!selectedSuggestion && city && street && house) {
      const timeoutId = setTimeout(() => {
        updateMapLocation();
      }, 1000); // Debounce for 1 second
      
      return () => clearTimeout(timeoutId);
    }
  }, [city, street, house, selectedSuggestion]);
  
  // Reset selected suggestion when changing street manually
  useEffect(() => {
    setSelectedSuggestion(null);
  }, [street]);
  
  const handleMarkerDrag = (longitude: number, latitude: number) => {
    setCoordinates([longitude, latitude]);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!city || !street || !house) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, заполните все обязательные поля',
        variant: 'destructive',
      });
      return;
    }
    
    setUserAddress({
      city,
      street,
      house,
      apartment,
      coordinates: {
        longitude: coordinates[0],
        latitude: coordinates[1]
      }
    });
    
    toast({
      title: 'Адрес сохранен',
      description: 'Ваш адрес успешно сохранен',
    });
    
    navigate('/restaurants');
  };
  
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-food-primary/10 p-3 rounded-full">
              <MapPin className="h-6 w-6 text-food-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">{t('addressTitle')}</CardTitle>
          <CardDescription className="text-center">{t('addressSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="city">{t('city')}</Label>
              <Select value={city} onValueChange={(value) => {
                setCity(value);
                setStreet('');
                setHouse('');
                setSuggestions([]);
              }} required>
                <SelectTrigger>
                  <SelectValue placeholder={t('city')} />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="street">{t('street')}</Label>
              <div className="relative" ref={suggestionsRef}>
                <div className="relative">
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    placeholder={city ? t('startTypingStreet') : t('selectCityFirst')}
                    disabled={!city}
                    required
                  />
                  {isLoadingSuggestions && (
                    <div className="absolute right-3 top-2.5">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion) => (
                      <div 
                        key={suggestion.id}
                        className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-start"
                        onClick={() => handleSelectSuggestion(suggestion)}
                      >
                        <Search className="h-4 w-4 mt-0.5 mr-2 text-gray-400 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{suggestion.text}</div>
                          <div className="text-xs text-gray-500">{suggestion.place_name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {city && street.length > 0 && street.length < 3 && (
                <p className="text-xs text-amber-500">
                  Введите минимум 3 символа для поиска улицы
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="house">{t('house')}</Label>
                <Input
                  id="house"
                  value={house}
                  onChange={(e) => setHouse(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apartment">{t('apartment')}</Label>
                <Input
                  id="apartment"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2 mt-6">
              <div className="flex justify-between items-center mb-2">
                <Label>{t('pinLocation')}</Label>
                {isGeocodingLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-food-primary" />
                )}
              </div>
              <div className="relative rounded-md overflow-hidden border border-gray-200">
                <MapComponent 
                  center={coordinates}
                  zoom={15}
                  markers={[{ longitude: coordinates[0], latitude: coordinates[1], draggable: true }]}
                  onMarkerDrag={handleMarkerDrag}
                  height="250px"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {t('dragPinHelper')}
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-food-primary hover:bg-food-primary/90 mt-4"
            >
              {t('continue')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => navigate('/')}>
            {t('back')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Address;
