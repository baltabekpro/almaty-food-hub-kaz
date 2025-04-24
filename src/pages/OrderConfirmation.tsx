
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { CheckCircle } from 'lucide-react';

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { t } = useLanguage();
  const { isAuthenticated, address } = useAuth();
  const navigate = useNavigate();
  
  // Generate a random delivery time between 30 and 60 minutes
  const deliveryTime = Math.floor(Math.random() * (60 - 30 + 1)) + 30;
  const deliveryAddress = address ? `${address.city}, ${address.street}, ${address.house}${address.apartment ? `, ${address.apartment}` : ''}` : '';
  
  useEffect(() => {
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
      
      <div className="page-container max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-3 text-food-dark">{t('confirmationTitle')}</h1>
          <p className="text-gray-600 mb-8">{t('confirmationSubtitle')}</p>
          
          <div className="border-t border-b py-6 my-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('orderNumber')}</p>
                <p className="text-xl font-medium">#{orderId}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('estimatedDelivery')}</p>
                <p className="text-xl font-medium">{deliveryTime} мин</p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-1">Адрес доставки</p>
              <p className="text-lg">{deliveryAddress}</p>
            </div>
          </div>
          
          <Button
            onClick={() => navigate('/restaurants')}
            className="bg-food-primary hover:bg-food-primary/90"
          >
            {t('backToRestaurants')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
