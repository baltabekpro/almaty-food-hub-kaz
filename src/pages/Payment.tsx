
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, CreditCard } from 'lucide-react';

const Payment = () => {
  const { t } = useLanguage();
  const { totalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const orderId = Math.floor(1000000 + Math.random() * 9000000).toString();
      clearCart();
      navigate(`/confirmation/${orderId}`);
    }, 2000);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="page-container max-w-2xl mx-auto">
        <h1 className="section-title text-center">{t('paymentTitle')}</h1>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">{t('paymentSubtitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="qr">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="qr">
                  <QrCode className="h-4 w-4 mr-2" />
                  QR-код
                </TabsTrigger>
                <TabsTrigger value="card">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Карта
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="qr" className="space-y-6">
                <div className="bg-gray-100 p-6 rounded-lg flex flex-col items-center">
                  <div className="mb-4 text-center text-sm text-gray-600">
                    {t('qrPayment')}
                  </div>
                  
                  <div className="border-4 border-white p-2 bg-white rounded-lg shadow-md">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://foodhub.kz/payment" 
                      alt="Payment QR Code"
                      className="w-52 h-52"
                    />
                  </div>
                  
                  <div className="mt-4 flex gap-2 items-center">
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">Kaspi</div>
                    <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">Halyk</div>
                    <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Jusan</div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="card" className="space-y-4">
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    В демо-версии оплата картой не доступна. Пожалуйста, используйте QR-код.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">{t('cartTotal')}</span>
                <span className="text-2xl font-bold text-food-primary">
                  {totalPrice.toLocaleString()} ₸
                </span>
              </div>
              
              <Button
                onClick={handlePayment}
                className="w-full bg-food-primary hover:bg-food-primary/90"
                disabled={isProcessing}
              >
                {isProcessing ? 'Обработка...' : t('completePayment')}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Payment;
