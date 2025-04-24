
import React, { useState } from 'react';
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
import { MapPin } from 'lucide-react';

const Address = () => {
  const { t } = useLanguage();
  const { setUserAddress } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [house, setHouse] = useState('');
  const [apartment, setApartment] = useState('');
  
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
    });
    
    toast({
      title: 'Адрес сохранен',
      description: 'Ваш адрес успешно сохранен',
    });
    
    navigate('/restaurants');
  };
  
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
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
              <Select value={city} onValueChange={setCity} required>
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
              <Input
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
              />
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
