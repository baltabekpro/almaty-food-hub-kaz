import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import MenuItemCard from '../components/MenuItemCard';
import MapComponent from '@/components/MapComponent';
import { DEFAULT_CENTER } from '@/lib/mapbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MapPin, Clock, Star } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

// Define interfaces for our data
interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  delivery_time: string;
  image: string;
  longitude?: number;
  latitude?: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category_id: string;
  restaurant_id: string;
}

interface Category {
  id: string;
  name: string;
  restaurant_id: string;
}

const RestaurantMenu = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { t } = useLanguage();
  const { address } = useAuth();
  const navigate = useNavigate();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  
  // Redirect to address page if no address is set
  useEffect(() => {
    if (!address) {
      navigate('/address');
    }
  }, [address, navigate]);
  
  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!restaurantId) return;
      
      setLoading(true);
      
      try {
        // Fetch restaurant details
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .maybeSingle();
          
        if (restaurantError) {
          throw restaurantError;
        }
        
        if (!restaurantData) {
          // Restaurant not found
          setLoading(false);
          return;
        }
        
        setRestaurant(restaurantData);
        
        // Fetch menu items
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId);
          
        if (menuError) {
          throw menuError;
        }
        
        setMenuItems(menuData || []);
        
        // Extract unique categories from menu items
        const uniqueCategoryIds = [...new Set(menuData?.map((item: MenuItem) => item.category_id) || [])];
        
        // If we have categories, fetch their names
        if (uniqueCategoryIds.length > 0) {
          const { data: categoryData, error: categoryError } = await supabase
            .from('menu_categories')
            .select('*')
            .in('id', uniqueCategoryIds);
            
          if (categoryError) {
            throw categoryError;
          }
          
          if (categoryData && categoryData.length > 0) {
            setCategories(categoryData);
            setActiveCategory(categoryData[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
        toast({
          title: t('error'),
          description: t('errorFetchingData'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurantData();
  }, [restaurantId, t]);
  
  if (!address) {
    return null;
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="page-container text-center py-12">
          <p className="text-lg text-gray-600">{t('loading')}...</p>
        </div>
      </div>
    );
  }
  
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
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span>{restaurant.rating}</span>
              </div>
              <span className="mx-2">•</span>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{restaurant.delivery_time}</span>
              </div>
              <span className="mx-2">•</span>
              <Button 
                variant="link" 
                onClick={() => setShowMap(!showMap)}
                className="p-0 h-auto text-white underline hover:text-gray-200"
              >
                <MapPin className="h-4 w-4 mr-1" />
                {showMap ? t('hideMap') : t('showMap')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {showMap && (
        <div className="p-4 bg-white border-b">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-lg overflow-hidden shadow-md">
              <MapComponent 
                center={restaurant.longitude && restaurant.latitude 
                  ? [restaurant.longitude, restaurant.latitude] as [number, number]
                  : DEFAULT_CENTER}
                markers={[
                  // Restaurant marker
                  ...(restaurant.longitude && restaurant.latitude 
                    ? [{ 
                        longitude: restaurant.longitude, 
                        latitude: restaurant.latitude,
                        color: '#FF5733' // Restaurant color
                      }] 
                    : []),
                  // User address marker (if available)
                  ...(address?.coordinates 
                    ? [{ 
                        longitude: address.coordinates.longitude, 
                        latitude: address.coordinates.latitude,
                        color: '#4A66E0' // User location color
                      }] 
                    : [])
                ]}
                height="300px"
              />
            </div>
            <div className="mt-2 text-sm text-gray-500 flex justify-between">
              <span className="flex items-center">
                <span className="inline-block w-3 h-3 bg-[#FF5733] rounded-full mr-1"></span>
                {t('restaurantLocation')}
              </span>
              {address?.coordinates && (
                <span className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-[#4A66E0] rounded-full mr-1"></span>
                  {t('yourLocation')}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="page-container">
        {categories.length > 0 ? (
          <Tabs defaultValue={categories[0]?.id} value={activeCategory || undefined} onValueChange={setActiveCategory}>
            <h2 className="section-title">{t('menuTitle')}</h2>
            
            <TabsList className="mb-6 flex overflow-x-auto pb-2 space-x-2">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="px-4 py-2 whitespace-nowrap"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <div className="space-y-4">
                  {menuItems
                    .filter((item) => item.category_id === category.id)
                    .map((item) => (
                      <MenuItemCard
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        description={item.description || ''}
                        price={item.price}
                        image={item.image || ''}
                        restaurantId={restaurant.id}
                      />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-600">В этом ресторане ещё нет меню.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantMenu;
