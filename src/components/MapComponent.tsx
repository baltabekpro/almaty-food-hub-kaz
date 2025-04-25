import React, { useRef, useEffect, useState } from 'react';
import mapboxgl, { LngLatLike } from 'mapbox-gl';
import { MAPBOX_ACCESS_TOKEN, DEFAULT_CENTER } from '@/lib/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapComponentProps {
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  markers?: {
    longitude: number;
    latitude: number;
    color?: string;
    draggable?: boolean;
  }[];
  route?: GeoJSON.Feature | null;
  onMarkerDrag?: (longitude: number, latitude: number) => void;
  className?: string;
  height?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center = DEFAULT_CENTER,
  zoom = 13,
  markers = [],
  route = null,
  onMarkerDrag,
  className = '',
  height = '400px'
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRefs = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: center as LngLatLike,
        zoom: zoom,
      });

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      map.current.on('error', (e) => {
        console.error('MapBox error:', e);
        setMapError('Failed to load map. Please check your internet connection.');
      });

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setMapError('Failed to initialize map. Please check your internet connection.');
    }
  }, [center, zoom]);

  // Handle markers
  useEffect(() => {
    if (!map.current || !mapLoaded || mapError) return;

    try {
      // Clear previous markers
      markerRefs.current.forEach(marker => marker.remove());
      markerRefs.current = [];

      // Add new markers
      markers.forEach(marker => {
        const markerElement = document.createElement('div');
        markerElement.className = 'marker';
        markerElement.style.width = '30px';
        markerElement.style.height = '30px';
        markerElement.style.borderRadius = '50%';
        markerElement.style.backgroundColor = marker.color || '#FF5733';
        markerElement.style.border = '2px solid white';
        markerElement.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';

        const newMarker = new mapboxgl.Marker({
          element: markerElement,
          draggable: !!marker.draggable
        })
          .setLngLat([marker.longitude, marker.latitude])
          .addTo(map.current);
        
        // If marker is draggable, add drag end event
        if (marker.draggable && onMarkerDrag) {
          newMarker.on('dragend', () => {
            const lngLat = newMarker.getLngLat();
            onMarkerDrag(lngLat.lng, lngLat.lat);
          });
        }
        
        markerRefs.current.push(newMarker);
      });
    } catch (error) {
      console.error('Failed to add markers:', error);
    }
  }, [markers, mapLoaded, onMarkerDrag, mapError]);

  // Handle route
  useEffect(() => {
    if (!map.current || !mapLoaded || !route || mapError) return;

    try {
      // Remove existing route layer and source
      if (map.current.getLayer('route')) {
        map.current.removeLayer('route');
      }
      if (map.current.getSource('route')) {
        map.current.removeSource('route');
      }

      // Add route to map
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
    } catch (error) {
      console.error('Failed to add route:', error);
    }
  }, [route, mapLoaded, mapError]);

  return (
    <div 
      ref={mapContainer} 
      className={`map-container ${className}`}
      style={{ 
        width: '100%', 
        height: height,
        borderRadius: '8px',
        position: 'relative'
      }}
    >
      {mapError && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(240, 240, 240, 0.9)',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div>
            <h3 style={{ color: '#FF5733', marginBottom: '10px' }}>Map Connection Error</h3>
            <p>{mapError}</p>
            <p>Please check your internet connection and try again.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;