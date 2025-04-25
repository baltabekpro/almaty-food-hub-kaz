import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import DeliveryMap, { DeliveryMapRef } from '@/components/DeliveryMap';
import { DEFAULT_CENTER, getRoute } from '@/lib/mapbox';
import { CheckCircle, Truck, MapPin, Clock } from 'lucide-react';

// Mock restaurant coordinates based on orderId
const getMockRestaurantCoordinates = (orderId: string) => {
  // Use a consistent algorithm to generate different but repeatable coordinates for testing
  const seed = orderId.charCodeAt(0) + orderId.length;
  // Create a small offset from the center of Almaty
  const longitudeOffset = (seed % 10) * 0.02;
  const latitudeOffset = (seed % 7) * 0.015;
  
  return {
    longitude: DEFAULT_CENTER[0] + longitudeOffset,
    latitude: DEFAULT_CENTER[1] + latitudeOffset
  };
};

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { t } = useLanguage();
  const { isAuthenticated, address } = useAuth();
  const navigate = useNavigate();
  
  const [deliveryProgress, setDeliveryProgress] = useState(0); // 0-100
  const [routeData, setRouteData] = useState<GeoJSON.Feature | null>(null);
  const [restaurantCoords, setRestaurantCoords] = useState<{longitude: number, latitude: number} | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(true);

  // Ref для доступа к методам карты с правильным типом
  const deliveryMapRef = useRef<DeliveryMapRef>(null);
  
  // Generate a random delivery time between 30 and 60 minutes
  const deliveryTime = Math.floor(Math.random() * (60 - 30 + 1)) + 30;
  const deliveryAddress = address ? `${address.city}, ${address.street}, ${address.house}${address.apartment ? `, ${address.apartment}` : ''}` : '';
  
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Generate mock restaurant coordinates and route
  useEffect(() => {
    if (!orderId || !address?.coordinates) return;
    
    const fetchRouteData = async () => {
      setLoadingRoute(true);
      
      // Mock restaurant location
      const mockRestaurant = getMockRestaurantCoordinates(orderId);
      setRestaurantCoords(mockRestaurant);
      
      try {
        // Create route from restaurant to delivery address
        const route = await getRoute(
          [mockRestaurant.longitude, mockRestaurant.latitude],
          [address.coordinates.longitude, address.coordinates.latitude]
        );
        
        setRouteData(route);
      } catch (error) {
        console.error('Error fetching route:', error);
      } finally {
        setLoadingRoute(false);
      }
    };
    
    fetchRouteData();
  }, [orderId, address]);

  // Настраиваем отслеживание прогресса и запускаем анимацию после загрузки маршрута
  useEffect(() => {
    if (loadingRoute || !deliveryMapRef.current || !routeData) return;

    // Настраиваем обратный вызов для обновления прогресса
    deliveryMapRef.current.setupProgressCallback((progress) => {
      setDeliveryProgress(progress);
    });

    // Запускаем анимацию движения курьера
    deliveryMapRef.current.startAnimation();
  }, [loadingRoute, routeData]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="page-container max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-center mb-6 text-center">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-3 text-food-dark text-center">{t('confirmationTitle')}</h1>
          <p className="text-gray-600 mb-8 text-center">{t('confirmationSubtitle')}</p>
          
          {/* Delivery Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-food-primary" />
                <span className="font-medium">{t('deliveryProgress')}</span>
              </div>
              <span className="font-medium">{deliveryProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-food-primary h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${deliveryProgress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Map */}
          <div className="mb-8 rounded-lg overflow-hidden border border-gray-200">
            {loadingRoute ? (
              <div className="h-80 bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">{t('loadingMap')}...</p>
              </div>
            ) : (
              <DeliveryMap 
                ref={deliveryMapRef}
                center={address?.coordinates ? 
                  [address.coordinates.longitude, address.coordinates.latitude] as [number, number] : 
                  DEFAULT_CENTER}
                route={routeData}
                restaurantCoords={restaurantCoords}
                customerCoords={address?.coordinates}
                height="350px"
              />
            )}
          </div>
          
          {/* Map Legend */}
          <div className="flex justify-between mb-6 text-sm px-2">
            <div className="flex items-center space-x-1">
              <span className="inline-block w-3 h-3 bg-[#FF5733] rounded-full"></span>
              <span>{t('restaurant')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="inline-block w-3 h-3 bg-[#32CD32] rounded-full"></span>
              <span>{t('courier')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="inline-block w-3 h-3 bg-[#4A66E0] rounded-full"></span>
              <span>{t('yourAddress')}</span>
            </div>
          </div>
          
          <div className="border-t border-b py-6 my-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('orderNumber')}</p>
                <p className="text-xl font-medium">#{orderId}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('estimatedDelivery')}</p>
                <div className="flex items-center text-xl font-medium">
                  <Clock className="h-5 w-5 mr-1 text-food-primary" />
                  <span>{deliveryTime} мин</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-1">Адрес доставки</p>
              <div className="flex items-start text-lg">
                <MapPin className="h-5 w-5 mr-1 mt-1 text-food-primary flex-shrink-0" />
                <p>{deliveryAddress}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button
              onClick={() => navigate('/restaurants')}
              className="bg-food-primary hover:bg-food-primary/90"
            >
              {t('backToRestaurants')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
