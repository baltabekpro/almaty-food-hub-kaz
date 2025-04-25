import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

// Определяем статусы платежа
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
  OFFLINE = 'offline' // New status for offline mode
}

// Интерфейс для платежа
export interface Payment {
  id: string;
  amount: number;
  order_id: string;
  status: PaymentStatus;
  created_at: string;
  completed_at?: string | null;
  payment_url: string;
}

// Checks if network is available
const isNetworkAvailable = async (): Promise<boolean> => {
  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Try to fetch a small resource to check connectivity
    const response = await fetch('https://www.google.com/favicon.ico', { 
      mode: 'no-cors',
      cache: 'no-cache',
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    console.warn('Network appears to be offline:', error);
    return false;
  }
};

/**
 * Создает новую сессию оплаты и возвращает URL для QR-кода
 */
export const createPaymentSession = async (
  orderId: string,
  amount: number
): Promise<{ paymentId: string; paymentUrl: string }> => {
  // Создаем уникальный ID для платежа
  const paymentId = uuidv4();
  
  // Check network availability
  const networkAvailable = await isNetworkAvailable();
  
  // If network is not available, use an offline mode
  if (!networkAvailable) {
    console.warn('Network unavailable, using offline payment mode');
    
    // Generate an offline payment URL that will work locally
    const baseUrl = window.location.origin;
    const paymentUrl = `${baseUrl}/pay/${paymentId}?offline=true`;
    
    // Store the payment info locally if needed
    try {
      localStorage.setItem(`payment_${paymentId}`, JSON.stringify({
        id: paymentId,
        order_id: orderId,
        amount: amount,
        status: PaymentStatus.OFFLINE,
        created_at: new Date().toISOString(),
        payment_url: paymentUrl
      }));
    } catch (e) {
      console.error('Failed to store payment in localStorage', e);
    }
    
    return { paymentId, paymentUrl };
  }
  
  // Формируем URL для страницы оплаты
  const baseUrl = window.location.origin;
  const paymentUrl = `${baseUrl}/pay/${paymentId}`;
  
  // Текущая дата в ISO формате
  const now = new Date().toISOString();
  
  try {
    // Сохраняем информацию о платеже в базе данных Supabase
    const { error } = await supabase
      .from('payment_sessions')
      .insert([
        {
          id: paymentId,
          order_id: orderId,
          amount: amount,
          status: PaymentStatus.PENDING,
          payment_url: paymentUrl,
          created_at: now
        },
      ]);
    
    if (error) {
      console.error(`Supabase error: ${error.message}`);
      
      if (error.message.includes('404') || error.message.includes('does not exist')) {
        console.warn('Payment sessions table might not exist, falling back to local storage');
        // Store in localStorage as fallback
        localStorage.setItem(`payment_${paymentId}`, JSON.stringify({
          id: paymentId,
          order_id: orderId,
          amount: amount,
          status: PaymentStatus.PENDING,
          created_at: now,
          payment_url: paymentUrl
        }));
      } else {
        throw new Error(`Failed to create payment session: ${error.message}`);
      }
    }
  } catch (error: any) {
    console.error('Payment creation error:', error);
    // Fall back to local storage in case of any error
    localStorage.setItem(`payment_${paymentId}`, JSON.stringify({
      id: paymentId,
      order_id: orderId,
      amount: amount,
      status: PaymentStatus.PENDING,
      created_at: now,
      payment_url: paymentUrl
    }));
  }
  
  return { paymentId, paymentUrl };
};

/**
 * Обрабатывает оплату по ID платежа
 */
export const processPayment = async (paymentId: string): Promise<boolean> => {
  // Check if we have this payment in localStorage (offline mode)
  const offlinePayment = localStorage.getItem(`payment_${paymentId}`);
  if (offlinePayment) {
    // Update the offline payment
    try {
      const payment = JSON.parse(offlinePayment);
      payment.status = PaymentStatus.COMPLETED;
      payment.completed_at = new Date().toISOString();
      localStorage.setItem(`payment_${paymentId}`, JSON.stringify(payment));
      return true;
    } catch (e) {
      console.error('Error updating offline payment', e);
      return false;
    }
  }

  try {
    // В реальном приложении здесь будет интеграция с платежной системой
    const { error } = await supabase
      .from('payment_sessions')
      .update({
        status: PaymentStatus.COMPLETED,
        completed_at: new Date().toISOString()
      })
      .eq('id', paymentId);
    
    if (error) {
      console.error('Failed to process payment:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Payment processing error:', error);
    return false;
  }
};

/**
 * Получает статус платежа по его ID
 */
export const getPaymentStatus = async (paymentId: string): Promise<PaymentStatus | null> => {
  // Check local storage first
  const offlinePayment = localStorage.getItem(`payment_${paymentId}`);
  if (offlinePayment) {
    try {
      const payment = JSON.parse(offlinePayment);
      return payment.status as PaymentStatus;
    } catch (e) {
      console.error('Error reading offline payment', e);
    }
  }

  try {
    const { data, error } = await supabase
      .from('payment_sessions')
      .select('status')
      .eq('id', paymentId)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return data.status as PaymentStatus;
  } catch (error) {
    console.error('Error getting payment status:', error);
    return null;
  }
};

/**
 * Получает информацию о платеже по его ID
 */
export const getPaymentInfo = async (paymentId: string): Promise<Payment | null> => {
  // Check if we have this payment in localStorage (offline mode)
  const offlinePayment = localStorage.getItem(`payment_${paymentId}`);
  if (offlinePayment) {
    try {
      return JSON.parse(offlinePayment) as Payment;
    } catch (e) {
      console.error('Error reading offline payment', e);
    }
  }

  try {
    const { data, error } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('id', paymentId)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return data as unknown as Payment;
  } catch (error) {
    console.error('Error getting payment info:', error);
    return null;
  }
};

/**
 * Настраивает слушатель изменений статуса платежа
 */
export const subscribeToPaymentUpdates = (
  paymentId: string, 
  callback: (payment: Payment) => void
) => {
  // For offline mode, set up a polling mechanism to check localStorage
  const offlinePayment = localStorage.getItem(`payment_${paymentId}`);
  if (offlinePayment) {
    const interval = setInterval(() => {
      const currentPayment = localStorage.getItem(`payment_${paymentId}`);
      if (currentPayment) {
        try {
          const payment = JSON.parse(currentPayment) as Payment;
          callback(payment);
          
          // If completed, clear the interval
          if (payment.status === PaymentStatus.COMPLETED || 
              payment.status === PaymentStatus.FAILED) {
            clearInterval(interval);
          }
        } catch (e) {
          console.error('Error parsing offline payment', e);
        }
      }
    }, 1000);
    
    return {
      unsubscribe: () => clearInterval(interval)
    };
  }

  try {
    return supabase
      .channel(`payment-${paymentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_sessions',
          filter: `id=eq.${paymentId}`,
        },
        (payload) => {
          callback(payload.new as unknown as Payment);
        }
      )
      .subscribe();
  } catch (error) {
    console.error('Error subscribing to payment updates:', error);
    
    // Return a dummy subscription object
    return {
      unsubscribe: () => {}
    };
  }
};