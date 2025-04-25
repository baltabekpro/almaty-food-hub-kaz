import React, { useRef, useEffect, useState, forwardRef, ForwardedRef, useImperativeHandle, useCallback } from 'react';
import mapboxgl, { LngLatLike } from 'mapbox-gl';
import { MAPBOX_ACCESS_TOKEN, DEFAULT_CENTER } from '@/lib/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

interface DeliveryMapProps {
  center?: [number, number];
  zoom?: number;
  route: GeoJSON.Feature | null;
  restaurantCoords?: {
    longitude: number;
    latitude: number;
  } | null;
  customerCoords?: {
    longitude: number;
    latitude: number;
  } | null;
  height?: string;
  className?: string;
}

// Вспомогательная функция для интерполяции между двумя точками
const interpolate = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};

// Интерполяция между двумя координатами
const interpolatePoints = (point1: [number, number], point2: [number, number], t: number): [number, number] => {
  return [
    interpolate(point1[0], point2[0], t),
    interpolate(point1[1], point2[1], t)
  ];
};

// Определяем тип для методов, которые будут экспортироваться через ref
export interface DeliveryMapRef {
  startAnimation: () => void;
  setupProgressCallback: (callback: (progress: number) => void) => void;
}

const DeliveryMap = forwardRef<DeliveryMapRef, DeliveryMapProps>(({
  center = DEFAULT_CENTER,
  zoom = 13,
  route,
  restaurantCoords,
  customerCoords,
  height = '400px',
  className = '',
}, ref) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const restaurantMarker = useRef<mapboxgl.Marker | null>(null);
  const customerMarker = useRef<mapboxgl.Marker | null>(null);
  const courierMarker = useRef<mapboxgl.Marker | null>(null);
  const animationRef = useRef<number | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Отслеживаем анимацию
  const animation = useRef({
    coordinates: [] as [number, number][],
    currentSegment: 0,
    segmentProgress: 0,
    lastTimestamp: 0,
    totalProgress: 0,
    duration: 30000, // Общая продолжительность анимации в миллисекундах
    playing: false
  });
  
  // Функция для обновления прогресса доставки, которую можно вызывать извне
  const onProgressUpdate = useRef<((progress: number) => void) | null>(null);
  
  // Инициализация карты - происходит только один раз
  useEffect(() => {
    if (!mapContainer.current) return;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center as LngLatLike,
      zoom: zoom,
    });
    
    map.current.on('load', () => {
      setMapInitialized(true);
    });
    
    return () => {
      // Очищаем анимацию при размонтировании компонента
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      map.current?.remove();
    };
  }, []); // Пустой массив зависимостей гарантирует, что карта инициализируется только один раз
  
  // Устанавливаем маркеры для ресторана и клиента
  useEffect(() => {
    if (!map.current || !mapInitialized) return;
    
    // Устанавливаем маркер ресторана
    if (restaurantCoords) {
      if (restaurantMarker.current) {
        restaurantMarker.current.remove();
      }
      
      const markerElement = document.createElement('div');
      markerElement.className = 'marker restaurant-marker';
      markerElement.style.width = '30px';
      markerElement.style.height = '30px';
      markerElement.style.borderRadius = '50%';
      markerElement.style.backgroundColor = '#FF5733';
      markerElement.style.border = '2px solid white';
      markerElement.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
      
      restaurantMarker.current = new mapboxgl.Marker({
        element: markerElement
      })
        .setLngLat([restaurantCoords.longitude, restaurantCoords.latitude])
        .addTo(map.current);
    }
    
    // Устанавливаем маркер клиента
    if (customerCoords) {
      if (customerMarker.current) {
        customerMarker.current.remove();
      }
      
      const markerElement = document.createElement('div');
      markerElement.className = 'marker customer-marker';
      markerElement.style.width = '30px';
      markerElement.style.height = '30px';
      markerElement.style.borderRadius = '50%';
      markerElement.style.backgroundColor = '#4A66E0';
      markerElement.style.border = '2px solid white';
      markerElement.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
      
      customerMarker.current = new mapboxgl.Marker({
        element: markerElement
      })
        .setLngLat([customerCoords.longitude, customerCoords.latitude])
        .addTo(map.current);
    }
    
    // Подгоняем зум и центр карты, чтобы было видно оба маркера
    if (restaurantCoords && customerCoords && map.current) {
      const bounds = new mapboxgl.LngLatBounds(
        [restaurantCoords.longitude, restaurantCoords.latitude],
        [customerCoords.longitude, customerCoords.latitude]
      );
      
      map.current.fitBounds(bounds, { 
        padding: 100,
        animate: true 
      });
    }
    
  }, [mapInitialized, restaurantCoords, customerCoords]);
  
  // Отображение маршрута на карте
  useEffect(() => {
    if (!map.current || !mapInitialized || !route) return;
    
    // Добавляем маршрут на карту
    if (map.current.getLayer('route')) {
      map.current.removeLayer('route');
    }
    
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }
    
    map.current.addSource('route', {
      type: 'geojson',
      data: route
    });
    
    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3887be',
        'line-width': 5,
        'line-opacity': 0.75
      }
    });
    
    // Сохраняем координаты маршрута для анимации
    if (route.geometry.type === 'LineString') {
      animation.current.coordinates = route.geometry.coordinates as [number, number][];
      animation.current.currentSegment = 0;
      animation.current.segmentProgress = 0;
      animation.current.totalProgress = 0;
      
      // Создаем маркер курьера в начальной точке маршрута
      if (animation.current.coordinates.length > 0) {
        const startPoint = animation.current.coordinates[0];
        
        // Удаляем предыдущий маркер курьера, если он существует
        if (courierMarker.current) {
          courierMarker.current.remove();
        }
        
        // Создаем более красивый маркер курьера
        const courierElement = document.createElement('div');
        courierElement.className = 'marker courier-marker';
        
        // Стилизация контейнера маркера
        courierElement.style.width = '36px';
        courierElement.style.height = '36px';
        courierElement.style.borderRadius = '50%';
        courierElement.style.backgroundColor = '#32CD32';
        courierElement.style.border = '3px solid white';
        courierElement.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.3)';
        courierElement.style.display = 'flex';
        courierElement.style.alignItems = 'center';
        courierElement.style.justifyContent = 'center';
        courierElement.style.position = 'relative';
        
        // Добавляем пульсирующий эффект
        const pulse = document.createElement('div');
        pulse.style.position = 'absolute';
        pulse.style.width = '100%';
        pulse.style.height = '100%';
        pulse.style.borderRadius = '50%';
        pulse.style.backgroundColor = 'rgba(50, 205, 50, 0.4)';
        pulse.style.animation = 'pulse 2s infinite';
        
        // Добавляем стиль анимации в документ
        if (!document.getElementById('courier-marker-style')) {
          const style = document.createElement('style');
          style.id = 'courier-marker-style';
          style.innerHTML = `
            @keyframes pulse {
              0% {
                transform: scale(1);
                opacity: 1;
              }
              70% {
                transform: scale(1.5);
                opacity: 0;
              }
              100% {
                transform: scale(1);
                opacity: 0;
              }
            }
          `;
          document.head.appendChild(style);
        }
        
        // Добавляем иконку курьера
        const icon = document.createElement('div');
        icon.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 16H9m-4.5.5L5.5 15m0 0h11a2 2 0 0 1 2 2v2m-13-4 5-8 2 3 5-7m-3 14h0a2 2 0 0 0 2-2h0a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2h0a2 2 0 0 0 2 2z"/>
          </svg>
        `;
        
        // Собираем маркер
        courierElement.appendChild(pulse);
        courierElement.appendChild(icon);
        
        courierMarker.current = new mapboxgl.Marker({
          element: courierElement
        })
          .setLngLat(startPoint)
          .addTo(map.current);
      }
    }
    
  }, [mapInitialized, route]);
  
  // Настраиваем колбэк для обновления прогресса
  const setupProgressCallback = (callback: (progress: number) => void) => {
    onProgressUpdate.current = callback;
  };
  
  // Обновление позиции курьера с использованием requestAnimationFrame
  // Используем useCallback, чтобы сохранить стабильную ссылку на функцию
  const updateCourierPosition = useCallback((timestamp: number) => {
    if (!animation.current.lastTimestamp) {
      animation.current.lastTimestamp = timestamp;
    }
    
    const { coordinates, currentSegment, duration } = animation.current;
    if (!coordinates.length || currentSegment >= coordinates.length - 1 || !animation.current.playing) {
      // Анимация закончена или остановлена
      return;
    }
    
    // Вычисляем прошедшее время
    const elapsed = timestamp - animation.current.lastTimestamp;
    animation.current.lastTimestamp = timestamp;
    
    // Обновляем прогресс (скорректируем расчет для более равномерного движения)
    const progressStep = elapsed / duration;
    animation.current.segmentProgress += progressStep * (coordinates.length - 1);
    
    // Проверяем, нужно ли перейти к следующему сегменту
    if (animation.current.segmentProgress >= 1) {
      animation.current.currentSegment += 1;
      animation.current.segmentProgress = 0;
      
      // Проверяем, не достигли ли конца маршрута
      if (animation.current.currentSegment >= coordinates.length - 1) {
        // Конец маршрута
        animation.current.playing = false;
        animation.current.totalProgress = 1;
        if (onProgressUpdate.current) {
          onProgressUpdate.current(100);
        }
        
        // Устанавливаем курьера в конечную точку маршрута
        if (courierMarker.current && coordinates.length > 0) {
          courierMarker.current.setLngLat(coordinates[coordinates.length - 1]);
        }
        return;
      }
    }
    
    // Интерполируем между текущей и следующей точкой маршрута
    const currentPoint = coordinates[animation.current.currentSegment];
    const nextPoint = coordinates[animation.current.currentSegment + 1];
    const interpolatedPos = interpolatePoints(
      currentPoint, 
      nextPoint, 
      animation.current.segmentProgress
    );
    
    // Обновляем положение курьера
    if (courierMarker.current) {
      courierMarker.current.setLngLat(interpolatedPos);
    }
    
    // Обновляем общий прогресс
    animation.current.totalProgress = (animation.current.currentSegment + animation.current.segmentProgress) / 
                                     (coordinates.length - 1);
    
    if (onProgressUpdate.current) {
      const progressPercent = Math.round(animation.current.totalProgress * 100);
      onProgressUpdate.current(progressPercent);
    }
    
    // Продолжаем анимацию - важно: этот шаг должен быть сохранен в animationRef.current
    if (animation.current.playing) {
      animationRef.current = requestAnimationFrame(updateCourierPosition);
    }
  }, []);
  
  // Запускаем анимацию движения курьера
  const startCourierAnimation = useCallback(() => {
    // Останавливаем предыдущую анимацию, если она была
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Проверяем, что у нас есть маркер и координаты
    if (!courierMarker.current || animation.current.coordinates.length <= 1) {
      console.warn('Не удалось начать анимацию: нет маркера или координат');
      return;
    }
    
    // Сбрасываем состояние анимации
    animation.current.currentSegment = 0;
    animation.current.segmentProgress = 0;
    animation.current.lastTimestamp = 0;
    animation.current.totalProgress = 0;
    animation.current.playing = true;
    
    // Начинаем анимацию
    console.log('Начинаем анимацию движения курьера');
    animationRef.current = requestAnimationFrame(updateCourierPosition);
  }, [updateCourierPosition]);
  
  // Экспортируем методы для использования в родительском компоненте
  useImperativeHandle(ref, () => ({
    startAnimation: startCourierAnimation,
    setupProgressCallback: (callback: (progress: number) => void) => {
      onProgressUpdate.current = callback;
    }
  }), [startCourierAnimation]);
  
  return (
    <div
      ref={mapContainer}
      className={`delivery-map-container ${className}`}
      style={{
        width: '100%',
        height: height,
        borderRadius: '8px',
      }}
    />
  );
});

// Добавляем отображаемое имя для лучшей отладки
DeliveryMap.displayName = 'DeliveryMap';

export default DeliveryMap;