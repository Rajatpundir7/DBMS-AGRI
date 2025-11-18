import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../utils/api';
import { FiAlertCircle } from 'react-icons/fi';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Default location from Google Maps link (approximate coordinates)
const DEFAULT_LOCATION = [28.7041, 77.1025]; // Delhi area coordinates
const DEFAULT_ZOOM = 10;

const MapView = ({ diagnoses = [], showHeatmap = true }) => {
  const [mapDiagnoses, setMapDiagnoses] = useState(diagnoses);
  const [center, setCenter] = useState(DEFAULT_LOCATION);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  // Update center based on diagnoses
  useEffect(() => {
    if (diagnoses.length > 0) {
      const withLocation = diagnoses.filter(d => d.location?.latitude && d.location?.longitude);
      if (withLocation.length > 0) {
        const avgLat = withLocation.reduce((sum, d) => sum + d.location.latitude, 0) / withLocation.length;
        const avgLng = withLocation.reduce((sum, d) => sum + d.location.longitude, 0) / withLocation.length;
        setCenter([avgLat, avgLng]);
        setZoom(withLocation.length > 10 ? 8 : 10);
      }
    }
  }, [diagnoses]);

  useEffect(() => {
    if (diagnoses.length === 0) {
      fetchDiagnoses();
    } else {
      setMapDiagnoses(diagnoses);
    }
  }, [diagnoses]);

  const fetchDiagnoses = async () => {
    try {
      const response = await api.get('/diagnosis?limit=100');
      setMapDiagnoses(response.data.diagnoses || []);
    } catch (error) {
      console.error('Error fetching diagnoses:', error);
      // Set empty array on error to prevent crashes
      setMapDiagnoses([]);
    }
  };

  // Get unique locations with disease counts
  const locationGroups = mapDiagnoses.reduce((acc, diagnosis) => {
    if (diagnosis.location?.latitude && diagnosis.location?.longitude) {
      const key = `${diagnosis.location.latitude.toFixed(4)}_${diagnosis.location.longitude.toFixed(4)}`;
      if (!acc[key]) {
        acc[key] = {
          lat: diagnosis.location.latitude,
          lng: diagnosis.location.longitude,
          count: 0,
          diseases: [],
          address: diagnosis.location.address || 'Unknown location'
        };
      }
      acc[key].count++;
      if (diagnosis.results?.[0]) {
        acc[key].diseases.push(diagnosis.results[0].label);
      }
    }
    return acc;
  }, {});

  const locations = Object.values(locationGroups);

  if (typeof window === 'undefined') {
    return <div>Loading map...</div>;
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        key="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locations.length > 0 ? (
          locations.map((location, idx) => (
            <React.Fragment key={idx}>
              <Marker position={[location.lat, location.lng]}>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold mb-2">{location.address}</h3>
                    <p className="text-sm text-gray-600">
                      <FiAlertCircle className="inline mr-1" />
                      {location.count} diagnosis{location.count > 1 ? 'es' : ''}
                    </p>
                    {location.diseases.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold">Diseases detected:</p>
                        <ul className="text-xs text-gray-600">
                          {[...new Set(location.diseases)].map((disease, i) => (
                            <li key={i}>• {disease}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
              {showHeatmap && (
                <Circle
                  center={[location.lat, location.lng]}
                  radius={Math.min(location.count * 2000, 50000)}
                  pathOptions={{
                    fillColor: location.count > 5 ? '#ef4444' : location.count > 2 ? '#f59e0b' : '#22c55e',
                    fillOpacity: 0.4,
                    color: location.count > 5 ? '#dc2626' : location.count > 2 ? '#d97706' : '#16a34a',
                    weight: 2
                  }}
                />
              )}
            </React.Fragment>
          ))
        ) : (
          <Marker position={center}>
            <Popup>
              <div className="p-2">
                <p className="text-sm text-gray-600">No disease data available yet. Upload diagnoses to see them on the map.</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;

