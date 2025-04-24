
import React from 'react';
import { Button } from "@/components/ui/button";
import { useCart, CartItem as CartItemType } from '../context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex items-center py-4 border-b last:border-0">
      <img 
        src={item.image} 
        alt={item.name} 
        className="w-20 h-20 object-cover rounded-md"
      />
      
      <div className="ml-4 flex-grow">
        <h3 className="font-medium text-food-dark">{item.name}</h3>
        <p className="text-sm text-food-muted line-clamp-1">{item.description}</p>
        <div className="font-bold text-food-primary mt-1">
          {item.price.toLocaleString()} ₸
        </div>
      </div>
      
      <div className="flex items-center">
        <Button 
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
        >
          -
        </Button>
        
        <span className="mx-3 w-6 text-center">{item.quantity}</span>
        
        <Button 
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
        >
          +
        </Button>
      </div>
      
      <div className="ml-4 text-right">
        <div className="font-bold text-food-dark">
          {(item.price * item.quantity).toLocaleString()} ₸
        </div>
        
        <button 
          onClick={() => removeItem(item.id)}
          className="text-sm text-red-500 hover:underline mt-1"
        >
          Удалить
        </button>
      </div>
    </div>
  );
};

export default CartItem;
