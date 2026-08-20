import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, MapPin } from 'lucide-react';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'ETWcb0fklGXftu9OFYix';

// Custom Marker Icon for Luxury Real Estate
const createCustomIcon = (price, listingType) => {
  const formattedPrice = price
    ? `$${(price / 1000000 >= 1 ? (price / 1000000).toFixed(1) + 'M' : (price / 1000).toFixed(0) + 'k')}`
    : 'POA';

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background: #0f172a;
        color: #f59e0b;
        border: 2px solid #d4af37;
        border-radius: 20px;
        padding: 4px 10px;
        font-weight: 800;
        font-size: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
        white-space: nowrap;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
      ">
        <span>📍</span>
        <span>${formattedPrice}</span>
      </div>
    `,
    iconSize: [80, 32],
    iconAnchor: [40, 16]
  });
};

const PropertyMap = ({ properties = [], center = [-33.8688, 151.2093], zoom = 11 }) => {
  const navigate = useNavigate();
  const [mapType, setMapType] = useState('m'); // 'm' for roadmap, 's' for satellite, 'y' for hybrid

  // Google Maps tile URL format
  const googleTileUrl = `https://{s}.google.com/vt/lyrs=${mapType}&x={x}&y={y}&z={z}&key=${GOOGLE_MAPS_KEY}`;

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-2xl relative">
      
      {/* Google Maps Layer Selector Switcher */}
      <div className="absolute top-3 right-3 z-[400] glass-panel p-1 rounded-xl border border-slate-200 flex items-center space-x-1 text-xs font-bold shadow-lg">
        <button
          type="button"
          onClick={() => setMapType('m')}
          className={`px-3 py-1 rounded-lg transition-all ${
            mapType === 'm' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Google Map
        </button>
        <button
          type="button"
          onClick={() => setMapType('y')}
          className={`px-3 py-1 rounded-lg transition-all ${
            mapType === 'y' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Satellite
        </button>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
          url={googleTileUrl}
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          maxZoom={20}
        />

        {properties.map((prop) => {
          const coords = prop.location?.coordinates;
          if (!coords || coords.length < 2) return null;
          
          // Mongo GeoJSON is [lng, lat], Leaflet takes [lat, lng]
          const position = [coords[1], coords[0]];

          return (
            <Marker
              key={prop._id}
              position={position}
              icon={createCustomIcon(prop.price, prop.listingType)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="w-56 p-1 space-y-2">
                  <img
                    src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=400'}
                    alt={prop.title}
                    className="w-full h-28 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400';
                    }}
                  />
                  <div>
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">
                      {prop.propertyType || 'Residential'} • {prop.address?.suburb || 'Australia'}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{prop.title}</h4>
                    <p className="text-sm font-extrabold text-sky-700 mt-0.5">
                      ${prop.price ? prop.price.toLocaleString() : 'Contact Agent'}
                    </p>
                  </div>
                  <a
                    href={`/properties/${prop._id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/properties/${prop._id}`);
                    }}
                    className="block w-full text-center py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-slate-950 font-extrabold text-xs hover:from-sky-400 hover:to-sky-500 transition-all shadow-md shadow-sky-500/20 cursor-pointer"
                  >
                    View Property →
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;
