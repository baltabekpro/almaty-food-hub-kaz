
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import RestaurantCard from '../components/RestaurantCard';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import Filters from '../components/Filters';
import { supabase } from '@/integrations/supabase/client';

const Restaurants = () => {
  const { address } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [cuisines, setCuisines] = useState<string[]>([]);
  
  useEffect(() => {
    if (!address) {
      navigate('/address');
      return;
    }

    const fetchRestaurants = async () => {
      let query = supabase
        .from('restaurants')
        .select('*')
        .eq('city', address.city);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching restaurants:', error);
        return;
      }

      if (data) {
        setRestaurants(data);
        // Extract unique cuisines
        const uniqueCuisines = [...new Set(data.map(r => r.cuisine))];
        setCuisines(uniqueCuisines);
      }
    };

    fetchRestaurants();
  }, [address, navigate]);
  
  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = !selectedCuisine || restaurant.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });
  
  if (!address) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="page-container">
        <div className="mb-8">
          <h1 className="section-title">{t('restaurantsTitle')}</h1>
          <p className="text-gray-600 mb-4">
            {address.city}: {address.street}, {address.house}
            {address.apartment && `, ${address.apartment}`}
          </p>

          <div className="space-y-4">
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('searchRestaurants')}
            />
            
            <Filters
              cuisines={cuisines}
              selectedCuisine={selectedCuisine}
              onCuisineSelect={setSelectedCuisine}
            />
          </div>
        </div>
        
        {filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                id={restaurant.id}
                name={restaurant.name}
                image={restaurant.image}
                cuisine={restaurant.cuisine}
                deliveryTime={restaurant.delivery_time}
                rating={restaurant.rating}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              {searchQuery || selectedCuisine 
                ? t('noRestaurantsFound')
                : t('noRestaurantsInCity')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants;
