
import React, { useEffect, useRef } from 'react';
import { Device } from '../types';

interface MapDisplayProps {
  devices: Device[];
  selectedDeviceId: string | null;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ devices, selectedDeviceId }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    // Only load Leaflet if it's available in the window object (from CDN)
    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([40.7128, -74.0060], 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Update markers
    devices.forEach(device => {
      if (markersRef.current[device.id]) {
        markersRef.current[device.id].setLatLng([device.lat, device.lng]);
        markersRef.current[device.id].setPopupContent(`
          <div class="p-1">
            <h3 class="font-bold">${device.name}</h3>
            <p class="text-xs">Speed: ${device.speed} km/h</p>
            <p class="text-xs">Status: ${device.status}</p>
          </div>
        `);
      } else {
        const marker = L.marker([device.lat, device.lng], {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div class="relative flex items-center justify-center">
                <div class="absolute w-4 h-4 bg-indigo-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                <div class="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500"></div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          })
        }).addTo(map);
        
        marker.bindPopup(`<h3 class="font-bold">${device.name}</h3><p>Speed: ${device.speed} km/h</p>`);
        markersRef.current[device.id] = marker;
      }
    });

    if (selectedDeviceId && markersRef.current[selectedDeviceId]) {
      const selected = devices.find(d => d.id === selectedDeviceId);
      if (selected) {
        map.flyTo([selected.lat, selected.lng], 15, { animate: true });
        markersRef.current[selectedDeviceId].openPopup();
      }
    }

    return () => {
      // Cleanup happens when App unmounts if needed
    };
  }, [devices, selectedDeviceId]);

  return (
    <div className="relative w-full h-[600px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-4 right-4 z-[1000] bg-white p-3 rounded-lg shadow-xl border border-slate-200">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fleet Overview</h4>
        <div className="space-y-2">
          {devices.map(d => (
            <div key={d.id} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${d.status === 'Online' ? 'bg-green-500' : d.status === 'SOS' ? 'bg-red-500' : 'bg-slate-300'}`} />
              <span className="text-sm font-medium text-slate-700">{d.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapDisplay;
