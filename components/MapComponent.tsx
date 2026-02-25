'use client';

import { useEffect, useRef, useState } from 'react';
import type { Coordinates } from '@/types';

// Leaflet CSS is loaded via globals.css CDN link
// We dynamically import leaflet to avoid SSR issues

interface MapComponentProps {
  /** Initial center of the map */
  center?: Coordinates;
  /** Current selected location */
  location?: Coordinates | null;
  /** Callback when user clicks the map */
  onLocationSelect?: (coords: Coordinates) => void;
  /** Whether the pin is draggable / map is clickable */
  interactive?: boolean;
  /** LBBD boundary GeoJSON to overlay */
  boundaryGeoJson?: GeoJSON.FeatureCollection | GeoJSON.Feature | null;
  /** Nearby reports to show as markers */
  nearbyReports?: Array<{
    id: string;
    coordinates: Coordinates;
    similarity?: number;
  }>;
  /** Height class */
  className?: string;
}

export default function MapComponent({
  center = { latitude: 51.5464, longitude: 0.1293 },
  location,
  onLocationSelect,
  interactive = true,
  boundaryGeoJson,
  nearbyReports = [],
  className = 'h-[350px]'
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [L, setL] = useState<any>(null);

  // Dynamically load leaflet on mount (client only)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const leaflet = await import('leaflet');
      if (!cancelled) setL(leaflet.default);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Initialize map once L is loaded
  useEffect(() => {
    if (!L || !mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [center.latitude, center.longitude],
      zoom: 14,
      scrollWheelZoom: true,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;

    // Add LBBD boundary overlay
    if (boundaryGeoJson) {
      try {
        L.geoJSON(boundaryGeoJson, {
          style: {
            color: '#0b0c0c',
            weight: 2,
            opacity: 0.6,
            fillColor: '#0b0c0c',
            fillOpacity: 0.05
          }
        }).addTo(map);
      } catch {
        // Silently ignore bad GeoJSON
      }
    }

    // Handle clicks for interactive mode
    if (interactive && onLocationSelect) {
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        onLocationSelect({ latitude: lat, longitude: lng });
      });
    }

    // Add nearby report markers
    nearbyReports.forEach((report) => {
      const icon = L.divIcon({
        className: 'nearby-report-marker',
        html: `<div style="width:12px;height:12px;background:#a50032;border:2px solid #fff;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });
      L.marker([report.coordinates.latitude, report.coordinates.longitude], {
        icon
      })
        .addTo(map)
        .bindPopup(
          `<div class="text-xs"><strong>Previous report</strong><br/>ID: ${report.id}${report.similarity ? `<br/>Similarity: ${Math.round(report.similarity * 100)}%` : ''}</div>`
        );
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L]);

  // Update marker when location changes
  useEffect(() => {
    if (!L || !mapRef.current) return;

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (location) {
      const icon = L.divIcon({
        className: 'selected-location-marker',
        html: `<div style="width:20px;height:20px;background:#0b0c0c;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      markerRef.current = L.marker([location.latitude, location.longitude], {
        icon,
        draggable: interactive
      }).addTo(mapRef.current);

      if (interactive && onLocationSelect) {
        markerRef.current.on('dragend', () => {
          const pos = markerRef.current.getLatLng();
          onLocationSelect({ latitude: pos.lat, longitude: pos.lng });
        });
      }

      mapRef.current.setView([location.latitude, location.longitude], 16);
    }
  }, [L, location, interactive, onLocationSelect]);

  if (!L) {
    return (
      <div
        className={`${className} rounded-lg bg-gray-100 flex items-center justify-center`}
      >
        <div className='text-sm text-gray-500'>Loading map...</div>
      </div>
    );
  }

  return (
    <div
      className={`${className} rounded-lg overflow-hidden border border-gray-300`}
    >
      <div ref={mapContainerRef} className='w-full h-full' />
    </div>
  );
}
