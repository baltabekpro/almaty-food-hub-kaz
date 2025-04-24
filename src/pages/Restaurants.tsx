
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { RESTAURANTS, CITIES } from '../data/restaurantsData';
import RestaurantCard from '../components/RestaurantCard';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const Restaurants = () => {
  const { address } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Redirect to address page if no address is set
  React.useEffect(() => {
    if (!address) {
      navigate('/address');
    }
  }, [address, navigate]);
  
  if (!address) {
    return null;
  }
  
  const cityName = CITIES.find(city => city.id === address.city)?.name || '';
  const restaurants = RESTAURANTS[address.city] || [];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="page-container">
        <div className="mb-8">
          <h1 className="section-title">{t('restaurantsTitle')}</h1>
          <p className="text-gray-600">
            {cityName}: {address.street}, {address.house}
            {address.apartment && `, ${address.apartment}`}
          </p>
        </div>
        
        {restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                id={restaurant.id}
                name={restaurant.name}
                image={restaurant.image}
                cuisine={restaurant.cuisine}
                deliveryTime={restaurant.deliveryTime}
                rating={restaurant.rating}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              К сожалению, в вашем городе пока нет доступных ресторанов.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants;
