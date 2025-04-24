
import React from 'react';
import { Button } from "@/components/ui/button";
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

interface MenuItemCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantId: string;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  id,
  name,
  description,
  price,
  image,
  restaurantId,
}) => {
  const { t } = useLanguage();
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({ id, name, description, price, image }, restaurantId);
  };

  return (
    <div className="food-card flex flex-col md:flex-row">
      <div className="md:w-1/3">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-40 md:h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="text-lg font-bold text-food-dark mb-2">{name}</h3>
          <p className="text-food-muted text-sm mb-4 line-clamp-2">{description}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-food-primary">
            {price.toLocaleString()} ₸
          </span>
          <Button 
            onClick={handleAddToCart}
            className="bg-food-primary hover:bg-food-primary/90 text-white"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {t('addToCart')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
