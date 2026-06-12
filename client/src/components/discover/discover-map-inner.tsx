"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

export interface MapOrg {
  _id: string;
  name: string;
  type: string;
  address?: { city: string };
  location?: { coordinates: [number, number] };
  queues?: Array<{ _id: string; name: string; status: string; waiting: number }>;
}

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapBounds({ orgs, center }: { orgs: MapOrg[]; center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    const points: L.LatLngExpression[] = orgs
      .map((o) => {
        const c = o.location?.coordinates;
        if (!c || c.length < 2) return null;
        return [c[1], c[0]] as [number, number];
      })
      .filter(Boolean) as [number, number][];

    if (points.length === 1) {
      map.setView(points[0]!, 14);
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 14 });
    } else {
      map.setView(center, 12);
    }
  }, [orgs, center, map]);

  return null;
}

export function DiscoverMapInner({
  orgs,
  center,
  selectedId,
  onSelect,
}: {
  orgs: MapOrg[];
  center: [number, number];
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
}) {
  return (
    <MapContainer
      center={center}
      zoom={12}
      className="h-full w-full rounded-2xl z-0"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBounds orgs={orgs} center={center} />
      {orgs.map((org) => {
        const c = org.location?.coordinates;
        if (!c || c.length < 2) return null;
        const lat = c[1];
        const lng = c[0];
        const isSelected = selectedId === org._id;

        return (
          <Marker
            key={org._id}
            position={[lat, lng]}
            icon={defaultIcon}
            eventHandlers={{
              click: () => onSelect?.(org._id),
            }}
            opacity={selectedId && !isSelected ? 0.55 : 1}
          >
            <Popup>
              <div className="min-w-[180px] text-neutral-900">
                <p className="font-semibold text-sm">{org.name}</p>
                <p className="text-xs text-neutral-600 mb-2">{org.address?.city}</p>
                {org.queues?.slice(0, 3).map((q) => (
                  <Link
                    key={q._id}
                    href={`/queue/${q._id}`}
                    className="block text-xs text-blue-600 hover:underline py-0.5"
                  >
                    {q.name} ({q.waiting} waiting)
                  </Link>
                ))}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
