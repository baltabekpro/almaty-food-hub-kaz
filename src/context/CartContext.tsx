
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
  restaurantId: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, restaurantId: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  restaurantId: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const addItem = (item: MenuItem, restId: string) => {
    // Check if we already have items from a different restaurant
    if (restaurantId && restaurantId !== restId && items.length > 0) {
      // In a real app, we would show a confirmation dialog here
      // For this demo, we'll just clear the cart
      setItems([]);
    }

    // Set the current restaurant
    setRestaurantId(restId);

    // Check if the item is already in the cart
    const existingItemIndex = items.findIndex((cartItem) => cartItem.id === item.id);

    if (existingItemIndex >= 0) {
      // Item is already in the cart, increment quantity
      const newItems = [...items];
      newItems[existingItemIndex].quantity += 1;
      setItems(newItems);
    } else {
      // Item is not in the cart, add it
      setItems([...items, { ...item, quantity: 1, restaurantId: restId }]);
    }
  };

  const removeItem = (itemId: string) => {
    const newItems = items.filter((item) => item.id !== itemId);
    setItems(newItems);
    
    // If cart is empty, reset restaurant ID
    if (newItems.length === 0) {
      setRestaurantId(null);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    const newItems = items.map((item) => {
      if (item.id === itemId) {
        return { ...item, quantity };
      }
      return item;
    });
    
    setItems(newItems);
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  
  const totalPrice = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        restaurantId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
