
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CartItem from '../components/CartItem';
import { ShoppingCart } from 'lucide-react';

const Cart = () => {
  const { t } = useLanguage();
  const { items, totalPrice, totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="page-container">
        <h1 className="section-title">{t('cartTitle')}</h1>
        
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <ShoppingCart className="h-16 w-16 text-gray-400" />
            </div>
            <p className="text-lg text-gray-600 mb-6">
              {t('cartEmpty')}
            </p>
            <Button 
              onClick={() => navigate('/restaurants')}
              className="bg-food-primary hover:bg-food-primary/90"
            >
              {t('restaurantsTitle')}
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
            
            <div className="border-t p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">{t('cartTotal')}</span>
                <span className="text-2xl font-bold text-food-primary">
                  {totalPrice.toLocaleString()} ₸
                </span>
              </div>
              
              <Button
                onClick={() => navigate('/payment')}
                className="w-full bg-food-primary hover:bg-food-primary/90 py-6"
              >
                {t('checkout')} ({totalItems})
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
