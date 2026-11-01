"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  center: [number, number];
}

export const ResultsMap = function ({ center }: Props) {
  return (
    // Leaflet panes carry triple-digit z-indexes; isolate keeps them under dialog overlays.
    <div className="isolate z-0 h-full">
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom={false}
        className="h-full min-h-[480px] w-full rounded-2xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
};
