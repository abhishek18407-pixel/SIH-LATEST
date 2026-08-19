import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix standard leaflet icon path issues in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const PRIORITY_COLOR = {
  "High":   "#d89d8f", // danger accent
  "Medium": "#8a8f80", // sage
  "Low":    "#9fd4c8", // success
};

export default function ComplaintMap({ complaints = [], onSelectComplaint }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef  = useRef(null);
  const markersLayerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [20.5937, 78.9629], // Default: India center
        zoom: 5,
        zoomControl: true,
      });

      // OpenStreetMap Tile Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    // Filter complaints that have location data
    const locatedComplaints = complaints.filter(
      (c) => c.location_lat && c.location_lng
    );

    const bounds = [];

    locatedComplaints.forEach((c) => {
      const lat = parseFloat(c.location_lat);
      const lng = parseFloat(c.location_lng);
      if (isNaN(lat) || isNaN(lng)) return;

      bounds.push([lat, lng]);

      const pinColor = PRIORITY_COLOR[c.ai_severity] || "#8a8f80";
      const statusIcon = c.status === "Open" ? "🔴" : c.status === "In Progress" ? "🟡" : "🟢";

      // Custom circular SVG marker
      const customIcon = L.divIcon({
        className: "custom-map-pin",
        html: `<div style="
          background: ${pinColor};
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: bold;
          cursor: pointer;
        ">${statusIcon}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Popup Content
      const popupHtml = `
        <div style="font-family: inherit; min-width: 200px; color: #222; padding: 2px;">
          <div style="font-size: 12px; font-weight: 800; font-family: monospace; color: #4a4a45; margin-bottom: 2px;">
            ${c.complaint_id}
          </div>
          <div style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">
            ${c.ai_issue || "Grievance"}
          </div>
          <div style="font-size: 12px; color: #555; margin-bottom: 6px;">
            🏛️ ${c.ai_department || "Department"}
          </div>
          <div style="font-size: 12px; margin-bottom: 6px;">
            <strong>Status:</strong> ${c.status} &nbsp;|&nbsp; <strong>Priority:</strong> ${c.ai_severity || "Medium"}
          </div>
          <div style="font-size: 12px; color: #444; font-style: italic; background: #f0ede6; padding: 6px 8px; border-radius: 6px; margin-bottom: 8px;">
            "${(c.original_text || "").slice(0, 90)}${(c.original_text || "").length > 90 ? "…" : ""}"
          </div>
          ${c.photo_url ? `<img src="${c.photo_url}" style="width:100%; max-height:100px; object-fit:cover; border-radius:6px; margin-bottom:6px;" />` : ""}
          <div style="font-size: 11px; color: #777;">
            📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersLayer.addLayer(marker);
    });

    // Fit map to markers if we have any
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else {
      map.setView([20.5937, 78.9629], 5);
    }
  }, [complaints]);

  return (
    <div style={{ position: "relative", width: "100%", height: "clamp(260px, 45vh, 420px)", borderRadius: "16px", overflow: "hidden", border: "1px solid var(--line)" }}>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
      {complaints.filter(c => c.location_lat && c.location_lng).length === 0 && (
        <div style={{
          position: "absolute", bottom: 12, left: 12, right: 12,
          background: "rgba(30, 30, 28, 0.85)", backdropFilter: "blur(6px)",
          padding: "8px 14px", borderRadius: "10px", fontSize: "13px",
          color: "var(--muted)", textAlign: "center", border: "1px solid var(--line)"
        }}>
          📍 No grievances with GPS coordinates found yet. Geotagged grievances filed by citizens will appear on this live map.
        </div>
      )}
    </div>
  );
}
