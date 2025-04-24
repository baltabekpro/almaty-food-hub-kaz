
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { RESTAURANTS } from '../data/restaurantsData';
import Navbar from '../components/Navbar';
import MenuItemCard from '../components/MenuItemCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RestaurantMenu = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { t } = useLanguage();
  const { address } = useAuth();
  const navigate = useNavigate();
  
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Redirect to address page if no address is set
  React.useEffect(() => {
    if (!address) {
      navigate('/address');
    }
  }, [address, navigate]);
  
  if (!address || !restaurantId) {
    return null;
  }
  
  const restaurant = RESTAURANTS[address.city]?.find(r => r.id === restaurantId);
  
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="page-container text-center py-12">
          <p className="text-lg text-gray-600">
            Ресторан не найден.
          </p>
          <Button 
            onClick={() => navigate('/restaurants')}
            variant="outline"
            className="mt-4"
          >
            {t('back')}
          </Button>
        </div>
      </div>
    );
  }
  
  // Set initial active category if not set
  if (!activeCategory && restaurant.categories.length > 0) {
    setActiveCategory(restaurant.categories[0]);
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="relative h-64 bg-gray-300">
        <img 
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="p-6 text-white">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white text-food-dark mb-4"
              onClick={() => navigate('/restaurants')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
            <div className="flex items-center mt-2">
              <span>{restaurant.cuisine}</span>
              <span className="mx-2">•</span>
              <div className="flex items-center">
                <span className="text-yellow-400">★</span>
                <span className="ml-1">{restaurant.rating}</span>
              </div>
              <span className="mx-2">•</span>
              <span>{restaurant.deliveryTime}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="page-container">
        <Tabs defaultValue={restaurant.categories[0]} value={activeCategory || undefined} onValueChange={setActiveCategory}>
          <h2 className="section-title">{t('menuTitle')}</h2>
          
          <TabsList className="mb-6 flex overflow-x-auto pb-2 space-x-2">
            {restaurant.categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="px-4 py-2 whitespace-nowrap"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {restaurant.categories.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="space-y-4">
                {restaurant.menu
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <MenuItemCard
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      description={item.description}
                      price={item.price}
                      image={item.image}
                      restaurantId={restaurant.id}
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default RestaurantMenu;
