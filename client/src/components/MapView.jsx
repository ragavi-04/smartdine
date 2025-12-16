import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Star } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
try {
  delete L.Icon.Default.prototype._getIconUrl;
} catch (e) {
  console.log('Leaflet icon already configured');
}
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
console.log('🗺️ Leaflet configured successfully');
const createCustomIcon = (priceRange) => {
  const colors = {
    '₹': '#10b981',    // green for budget
    '₹₹': '#f59e0b',   // orange for moderate
    '₹₹₹': '#ef4444'   // red for expensive
  };
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${colors[priceRange] || '#6366f1'};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 16px;
          color: white;
          font-weight: bold;
        ">🍽️</span>
      </div>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42]
  });
};
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}
const MapView = ({ restaurants, onRestaurantClick, userLocation, filters }) => {
  const [mapCenter, setMapCenter] = useState([11.0168, 76.9558]);
  const [mapZoom, setMapZoom] = useState(13);
  console.log('🗺️ MapView rendering with:', restaurants.length, 'restaurants');
  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
      setMapZoom(14);
    } else if (restaurants.length > 0) {
      const firstRestaurant = restaurants[0];
      if (firstRestaurant.coordinates) {
        console.log('📍 Centering on:', firstRestaurant.name, firstRestaurant.coordinates);
        setMapCenter([
          firstRestaurant.coordinates.latitude,
          firstRestaurant.coordinates.longitude
        ]);
      }
    }
  }, [userLocation, restaurants]);
  const handleMarkerClick = (restaurant) => {
    if (onRestaurantClick) {
      onRestaurantClick(restaurant);
    }
  };
  const getDirections = (lat, lon) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
      '_blank'
    );
  };
  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={mapCenter} />
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: `
                <div style="
                  background-color: #3b82f6;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
                "></div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-blue-600">📍 You are here</p>
              </div>
            </Popup>
          </Marker>
        )}
        {/* Restaurant markers */}
        {restaurants.map((restaurant) => {
          if (!restaurant.coordinates) {
            console.warn('⚠️ Restaurant missing coordinates:', restaurant.name);
            return null;
          }
          console.log('📌 Rendering marker for:', restaurant.name, 'at', restaurant.coordinates);
          return (
            <Marker
              key={restaurant._id}
              position={[
                restaurant.coordinates.latitude,
                restaurant.coordinates.longitude
              ]}
              icon={createCustomIcon(restaurant.priceRange)}
            >
              <Popup maxWidth={300}>
                <div className="p-2">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {restaurant.name}
                  </h3>
                  {restaurant.imageUrl && (
                    <img
                      src={restaurant.imageUrl}
                      alt={restaurant.name}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded">
                      <Star className="text-yellow-500 fill-yellow-500" size={14} />
                      <span className="text-sm font-bold">{restaurant.rating}</span>
                    </div>
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-sm font-semibold">
                      {restaurant.priceRange}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {restaurant.cuisine.slice(0, 2).map((c, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  {restaurant.distance && (
                    <p className="text-sm text-gray-600 mb-2">
                      📍 {restaurant.distance} km away
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleMarkerClick(restaurant)}
                      className="flex-1 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => getDirections(
                        restaurant.coordinates.latitude,
                        restaurant.coordinates.longitude
                      )}
                      className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      title="Get Directions"
                    >
                      <Navigation size={16} />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <h4 className="text-sm font-bold mb-2">Price Range</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Budget (₹)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span>Moderate (₹₹)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>Premium (₹₹₹)</span>
          </div>
        </div>
      </div>
      {/* Restaurant count */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 z-[1000]">
        <p className="text-sm font-semibold text-gray-700">
          📍 {restaurants.length} restaurants
        </p>
      </div>
    </div>
  );
};
export default MapView;
