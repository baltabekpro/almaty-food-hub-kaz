import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, CreditCard, Loader2, WifiOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  createPaymentSession, 
  subscribeToPaymentUpdates, 
  PaymentStatus
} from '@/lib/payment';

const Payment = () => {
  const { t } = useLanguage();
  const { totalPrice, clearCart, cartItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [qrReady, setQrReady] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // Check network connectivity
  const checkNetworkStatus = () => {
    const isOnline = navigator.onLine;
    setIsOfflineMode(!isOnline);
    return isOnline;
  };
  
  useEffect(() => {
    // Check initial network status
    checkNetworkStatus();
    
    // Add event listeners for online/offline events
    window.addEventListener('online', () => setIsOfflineMode(false));
    window.addEventListener('offline', () => setIsOfflineMode(true));
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('online', () => setIsOfflineMode(false));
      window.removeEventListener('offline', () => setIsOfflineMode(true));
    };
  }, []);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Создаем сессию платежа при загрузке страницы
  useEffect(() => {
    const initializePayment = async () => {
      if (!isAuthenticated || paymentUrl || cartItems.length === 0) {
        return;
      }
      
      try {
        setQrReady(false);
        setQrError(null);
        
        // Создаем временный ID заказа
        const tempOrderId = `order_${Date.now()}`;
        
        // Создаем сессию оплаты
        const { paymentId, paymentUrl } = await createPaymentSession(tempOrderId, totalPrice);
        
        setPaymentId(paymentId);
        setPaymentUrl(paymentUrl);
        setQrReady(true);
        
        // Check if this is an offline payment URL
        if (paymentUrl.includes('offline=true')) {
          setIsOfflineMode(true);
        }
      } catch (error) {
        console.error('Failed to initialize payment:', error);
        setQrError('Не удалось создать платеж. Проверьте подключение к интернету.');
        setQrReady(false);
      }
    };
    
    initializePayment();
  }, [isAuthenticated, totalPrice, cartItems]);
  
  // Подписываемся на изменения статуса оплаты
  useEffect(() => {
    if (!paymentId) return;
    
    const subscription = subscribeToPaymentUpdates(paymentId, (payment) => {
      setPaymentStatus(payment.status);
      
      // Если оплата завершена, перенаправляем на страницу подтверждения
      if (payment.status === PaymentStatus.COMPLETED) {
        handlePaymentSuccess(payment.order_id);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [paymentId]);
  
  // Обработка успешной оплаты
  const handlePaymentSuccess = (orderId: string) => {
    setIsProcessing(true);
    clearCart();
    
    // Перенаправляем на страницу подтверждения заказа
    setTimeout(() => {
      navigate(`/confirmation/${orderId}`);
    }, 1000);
  };
  
  // Имитируем оплату через кнопку
  const handleManualPayment = () => {
    setIsProcessing(true);
    
    // Генерируем случайный ID заказа для демонстрации
    const orderId = Math.floor(1000000 + Math.random() * 9000000).toString();
    
    setTimeout(() => {
      clearCart();
      navigate(`/confirmation/${orderId}`);
    }, 2000);
  };
  
  // Handle QR code error
  const handleQRError = () => {
    setQrError('QR-код не может быть сгенерирован. Используйте кнопку оплаты внизу.');
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="page-container max-w-2xl mx-auto">
        <h1 className="section-title text-center">{t('paymentTitle')}</h1>
        
        {isOfflineMode && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md flex items-center gap-2">
            <WifiOff className="h-5 w-5 text-yellow-700" />
            <span className="text-yellow-800">
              Обнаружен автономный режим. Некоторые функции могут быть недоступны.
            </span>
          </div>
        )}
        
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
                    {isOfflineMode 
                      ? 'Автономный режим: QR-код создан локально и будет работать только на этом устройстве.' 
                      : t('qrPayment')}
                  </div>
                  
                  <div className="border-4 border-white p-2 bg-white rounded-lg shadow-md">
                    {!qrReady ? (
                      <div className="w-52 h-52 flex items-center justify-center">
                        {qrError ? (
                          <div className="text-center p-4">
                            <WifiOff className="h-8 w-8 mx-auto text-red-500 mb-2" />
                            <p className="text-sm text-red-600">{qrError}</p>
                          </div>
                        ) : (
                          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        )}
                      </div>
                    ) : (
                      <QRCodeSVG 
                        value={paymentUrl || window.location.origin} 
                        size={200}
                        level="H"
                        includeMargin
                        bgColor="#FFFFFF"
                        fgColor="#000000"
                        onError={handleQRError}
                      />
                    )}
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-500 text-center">
                    {paymentStatus === PaymentStatus.COMPLETED ? (
                      <div className="text-green-600 font-medium">Оплата выполнена успешно!</div>
                    ) : paymentStatus === PaymentStatus.FAILED ? (
                      <div className="text-red-600 font-medium">Ошибка оплаты. Попробуйте снова.</div>
                    ) : paymentStatus === PaymentStatus.OFFLINE ? (
                      <div className="text-yellow-600 font-medium">Автономный режим. Используйте тестовую оплату снизу.</div>
                    ) : qrError ? (
                      <div className="text-red-600 font-medium">QR-код недоступен. Используйте кнопку оплаты внизу.</div>
                    ) : (
                      <div>
                        {isOfflineMode ? 'Локальный QR-код' : 'Отсканируйте код для оплаты'}
                        <p className="text-xs mt-1">или используйте тестовую оплату снизу</p>
                      </div>
                    )}
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
                    В демо-версии оплата картой не доступна. Пожалуйста, используйте QR-код или кнопку тестовой оплаты.
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
                onClick={handleManualPayment}
                className="w-full bg-food-primary hover:bg-food-primary/90"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Обработка...
                  </div>
                ) : (
                  isOfflineMode ? 'Тестовая оплата (автономный режим)' : t('completePayment')
                )}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                {isOfflineMode 
                  ? 'Автономный режим: Данные хранятся локально и будут синхронизированы при восстановлении соединения.' 
                  : 'Для тестирования в демо-режиме. В реальном приложении будет использоваться QR.'}
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Payment;
