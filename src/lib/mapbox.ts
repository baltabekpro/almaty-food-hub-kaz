import mapboxgl from 'mapbox-gl';

// Using the API key you provided
export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiYmFsdGFiZWsiLCJhIjoiY201MDB3NnJhMWNydzJqczdoaGsyMTVkYSJ9.kG5u4tSTzp5sDY_G6DX9dA';

// Set the access token globally for all Mapbox instances
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

// Default coordinates for Almaty city center
export const DEFAULT_CENTER: [number, number] = [76.9286, 43.2567]; // [longitude, latitude]

// Interface for location data
export interface LocationData {
  longitude: number;
  latitude: number;
  address?: string;
}

// Interface for address suggestion
export interface AddressSuggestion {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
}

// Get address suggestions based on search text and city
export const getAddressSuggestions = async (
  searchText: string,
  cityName?: string
): Promise<AddressSuggestion[]> => {
  try {
    // If no search text, return empty array
    if (!searchText || searchText.length < 3) return [];

    // Add city name if provided to improve search relevance
    const searchQuery = cityName ? `${searchText}, ${cityName}` : searchText;
    
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=kz&types=address&language=ru&limit=5`
    );
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features.map((feature: any) => ({
        id: feature.id,
        place_name: feature.place_name,
        text: feature.text,
        center: feature.center as [number, number]
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Address suggestion error:', error);
    return [];
  }
};

// Convert address string to coordinates (geocoding)
export const geocodeAddress = async (
  address: string, 
  cityName?: string
): Promise<LocationData | null> => {
  try {
    // Add city name if provided to improve geocoding accuracy
    const searchAddress = cityName ? `${address}, ${cityName}` : address;
    
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchAddress)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=kz&limit=1`
    );
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      return {
        longitude,
        latitude,
        address: data.features[0].place_name,
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Generate a route between two points
export const getRoute = async (
  start: [number, number],
  end: [number, number]
): Promise<GeoJSON.Feature | null> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`
    );
    
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      return {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: data.routes[0].geometry.coordinates
        }
      };
    }
    return null;
  } catch (error) {
    console.error('Routing error:', error);
    return null;
  }
};