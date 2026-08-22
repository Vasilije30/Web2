import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import type { Activity } from "../../models/Activity";
import * as activityService from "../../services/activityService";
import { extractErrorMessage } from "../../utils/apiError";
import { formatDate, formatTime } from "../../utils/format";
import { Alert, EmptyState, Loading } from "../common/Feedback";
import { MapPinIcon, RouteIcon } from "../common/Icons";
import Panel from "../common/Panel";

// Vite bundles Leaflet's default marker images under a hashed path that the library's built-in
// icon URL resolution doesn't know about, so markers render broken/blank unless we point Leaflet
// at the bundled asset URLs ourselves.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const dayColors = ["#0d9488", "#e11d48", "#2563eb", "#f59e0b", "#8b5cf6", "#059669"];

function numberedIcon(order: number, color: string) {
  return L.divIcon({
    className: "activity-marker",
    html: `<div style="background:${color};color:#fff;border-radius:50%;width:28px;height:28px;
      display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;
      border:2.5px solid white;box-shadow:0 2px 6px rgba(15,23,42,0.45);">${order}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

type LocatedActivity = Activity & { latitude: number; longitude: number };

function hasCoordinates(activity: Activity): activity is LocatedActivity {
  return activity.latitude != null && activity.longitude != null;
}

interface MapSectionProps {
  tripId: string;
  shareToken?: string;
  /** Bump this (e.g. from a sibling ActivitySection's onActivitiesChanged) to force a re-fetch. */
  refreshKey?: number;
}

export default function MapSection({ tripId, shareToken, refreshKey }: MapSectionProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, refreshKey]);

  async function loadActivities() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await activityService.getActivities(tripId, shareToken);
      setActivities(data);
    } catch (error) {
      setLoadError(extractErrorMessage(error, "Aktivnosti nisu učitane."));
    } finally {
      setIsLoading(false);
    }
  }

  const located = activities
    .filter(hasCoordinates)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const byDay = new Map<string, LocatedActivity[]>();
  for (const activity of located) {
    const list = byDay.get(activity.date) ?? [];
    list.push(activity);
    byDay.set(activity.date, list);
  }
  const days = Array.from(byDay.keys()).sort();

  const center: [number, number] =
    located.length > 0
      ? [
          located.reduce((sum, a) => sum + a.latitude, 0) / located.length,
          located.reduce((sum, a) => sum + a.longitude, 0) / located.length,
        ]
      : [44.7866, 20.4489];

  return (
    <Panel
      icon={<RouteIcon />}
      title="Mapa rute"
      subtitle="Redosled obilaska po danima — svaki dan ima svoju boju"
    >
      {isLoading && <Loading label="Učitavanje mape..." />}
      {loadError && <Alert>{loadError}</Alert>}

      {!isLoading && !loadError && located.length === 0 && (
        <EmptyState
          icon={<MapPinIcon />}
          title="Nema aktivnosti sa koordinatama"
          text="Unesi geografsku širinu i dužinu kod aktivnosti da bi se pojavile na mapi i povezale u rutu."
        />
      )}

      {!isLoading && !loadError && located.length > 0 && (
        <>
          <div className="map-frame">
            <MapContainer center={center} zoom={12} scrollWheelZoom={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> saradnici'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {days.map((day, dayIndex) => (
                <Polyline
                  key={`route-${day}`}
                  positions={byDay.get(day)!.map((a) => [a.latitude, a.longitude])}
                  pathOptions={{ color: dayColors[dayIndex % dayColors.length], weight: 4, opacity: 0.75 }}
                />
              ))}

              {located.map((activity) => {
                const dayIndex = days.indexOf(activity.date);
                const orderInDay = byDay.get(activity.date)!.indexOf(activity) + 1;
                return (
                  <Marker
                    key={activity.id}
                    position={[activity.latitude, activity.longitude]}
                    icon={numberedIcon(orderInDay, dayColors[dayIndex % dayColors.length])}
                  >
                    <Popup>
                      <strong>{activity.name}</strong>
                      <br />
                      {formatDate(activity.date)} u {formatTime(activity.time)}
                      {activity.location && (
                        <>
                          <br />
                          {activity.location}
                        </>
                      )}
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          <ul className="map-legend">
            {days.map((day, dayIndex) => (
              <li key={day} className="map-legend__item">
                <span
                  className="map-legend__dot"
                  style={{ background: dayColors[dayIndex % dayColors.length] }}
                  aria-hidden="true"
                />
                {formatDate(day)} · {byDay.get(day)!.length} aktivnosti
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}
