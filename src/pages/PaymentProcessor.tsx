import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { getPaymentInfo, processPayment, PaymentStatus } from '@/lib/payment';

const PaymentProcessor = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [orderInfo, setOrderInfo] = useState<string | null>(null);
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  
  // Загружаем информацию о платеже
  useEffect(() => {
    const fetchPaymentInfo = async () => {
      if (!paymentId) {
        setError('Некорректный ID платежа');
        setLoading(false);
        return;
      }
      
      try {
        const paymentInfo = await getPaymentInfo(paymentId);
        
        if (!paymentInfo) {
          setError('Платеж не найден');
          setLoading(false);
          return;
        }
        
        setAmount(paymentInfo.amount);
        setOrderInfo(paymentInfo.order_id);
        setStatus(paymentInfo.status);
        
        // Если платеж уже обработан, показываем соответствующий статус
        if (paymentInfo.status !== PaymentStatus.PENDING) {
          setLoading(false);
          return;
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching payment info:', error);
        setError('Не удалось загрузить информацию о платеже');
        setLoading(false);
      }
    };
    
    fetchPaymentInfo();
  }, [paymentId]);
  
  // Функция для обработки платежа
  const handleProcessPayment = async () => {
    if (!paymentId) return;
    
    setProcessing(true);
    
    try {
      const success = await processPayment(paymentId);
      
      if (success) {
        setStatus(PaymentStatus.COMPLETED);
      } else {
        setStatus(PaymentStatus.FAILED);
        setError('Не удалось обработать платеж');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Произошла ошибка при обработке платежа');
      setStatus(PaymentStatus.FAILED);
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-xl text-center">
            Оплата заказа
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-food-primary mb-4" />
              <p className="text-gray-500">Загрузка информации о платеже...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-red-500">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p>{error}</p>
            </div>
          ) : status === PaymentStatus.COMPLETED ? (
            <div className="flex flex-col items-center justify-center py-8 text-green-600">
              <CheckCircle className="h-12 w-12 mb-4" />
              <p className="font-semibold">Оплата прошла успешно!</p>
              <p className="text-gray-500 text-sm mt-2">
                Заказ оплачен и готовится к доставке
              </p>
            </div>
          ) : status === PaymentStatus.FAILED ? (
            <div className="flex flex-col items-center justify-center py-8 text-red-500">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p>Ошибка оплаты</p>
              <p className="text-gray-500 text-sm mt-2">
                Попробуйте еще раз или выберите другой способ оплаты
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-lg bg-gray-100 p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Номер заказа:</span>
                  <span className="font-medium">{orderInfo}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Сумма:</span>
                  <span className="text-xl font-bold text-food-primary">
                    {amount?.toLocaleString()} ₸
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <CreditCard className="h-8 w-8 mx-auto text-food-primary mb-2" />
                <p className="text-sm text-gray-600 font-medium">
                  Нажмите кнопку ниже для оплаты заказа
                </p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2 pt-4 pb-6 px-6">
          {status === null && (
            <Button 
              onClick={handleProcessPayment}
              className="w-full bg-food-primary hover:bg-food-primary/90 text-white font-medium py-6 text-lg shadow-md"
              disabled={processing || loading}
            >
              {processing ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Обработка...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Оплатить заказ
                </div>
              )}
            </Button>
          )}
          
          {status === PaymentStatus.COMPLETED && (
            <p className="text-sm text-center text-gray-500 mt-2">
              Вы можете закрыть это окно и вернуться к основному приложению
            </p>
          )}
          
          {status === PaymentStatus.FAILED && (
            <Button 
              onClick={handleProcessPayment}
              variant="outline"
              className="w-full"
              disabled={processing}
            >
              Попробовать снова
            </Button>
          )}
          
          <Button 
            onClick={() => navigate(-1)} 
            variant="ghost" 
            className="mt-2"
          >
            Назад
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentProcessor;