
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

interface RestaurantCardProps {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  deliveryTime: string;
  rating: number;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  id,
  name,
  image,
  cuisine,
  deliveryTime,
  rating,
}) => {
  const { t } = useLanguage();

  return (
    <Link to={`/restaurant/${id}`} className="block">
      <div className="food-card">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="text-lg font-bold text-food-dark mb-1">{name}</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-food-muted text-sm">{cuisine}</span>
            <div className="flex items-center">
              <span className="text-yellow-500">★</span>
              <span className="ml-1 text-sm font-medium">{rating}</span>
            </div>
          </div>
          <div className="text-sm text-food-muted">
            {t('deliveryTime')}: {deliveryTime}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
