import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate }       from 'react-router-dom';
import { useDispatch, useSelector }     from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { fetchItinerary }    from '../store/slices/itinerarySlice';
import {
  geocodeLocations,
  fetchNearbyPlaces,
  setSelectedMarker,
  setNearbyType,
  clearMapState,
} from '../store/slices/mapSlice';
import { toast } from 'react-toastify';
import Loader    from '../components/common/Loader';

// fix Leaflet default icon path issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// custom colored marker icon generator
const makeIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};border:3px solid #fff;
      transform:rotate(-45deg);
      box-shadow:0 2px 8px rgba(0,0,0,0.3)
    "></div>`,
    iconSize:   [28, 28],
    iconAnchor: [14, 28],
    popupAnchor:[0, -30],
  });

const categoryColors = {
  sightseeing: '#3b82f6', food: '#f59e0b', adventure: '#10b981',
  transport:   '#8b5cf6', accommodation: '#ec4899', shopping: '#f97316',
  relaxation:  '#06b6d4', culture: '#84cc16',
};

const nearbyTypes = [
  { value: 'restaurant', label: '🍽 Restaurants' },
  { value: 'cafe',       label: '☕ Cafes'       },
  { value: 'hotel',      label: '🏨 Hotels'      },
  { value: 'atm',        label: '🏧 ATMs'        },
  { value: 'attraction', label: '🎯 Attractions'  },
  { value: 'pharmacy',   label: '💊 Pharmacy'    },
  { value: 'shopping',   label: '🛍 Shopping'    },
];

// helper component — auto-fits map to all markers
const FitBounds = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 14);
    } else {
      map.fitBounds(positions, { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
};

const ItineraryMapPage = () => {
  const { id }       = useParams();
  const dispatch     = useDispatch();
  const navigate     = useNavigate();

  const { itinerary, loading: itiLoading } = useSelector((s) => s.itineraries);
  const {
    markers, nearbyPlaces, selectedMarker,
    loading: geoLoading, nearbyLoading, nearbyType,
  } = useSelector((s) => s.map);

  const [activeDay,     setActiveDay]     = useState('all');
  const [showNearby,    setShowNearby]    = useState(false);
  const [nearbyCenter,  setNearbyCenter]  = useState(null);

  useEffect(() => {
    dispatch(fetchItinerary(id));
    return () => dispatch(clearMapState());
  }, [id, dispatch]);

  // once itinerary is loaded — geocode all activity locations
  useEffect(() => {
    if (!itinerary) return;

    // collect unique non-empty locations from all activities
    const allLocations = [];
    const seen = new Set();

    itinerary.ItineraryDays?.forEach((day) => {
      day.ItineraryActivities?.forEach((act) => {
        if (act.location && !seen.has(act.location)) {
          seen.add(act.location);
          // append destination for better geocoding accuracy
          allLocations.push({
            location: `${act.location}, ${itinerary.destination}`,
            activityId: act.id,
            activityName: act.activity,
            category: act.category,
            time: act.time,
            dayNumber: day.day_number,
          });
        }
      });
    });

    if (allLocations.length > 0) {
      // only send location strings to backend
      dispatch(geocodeLocations(allLocations.map((l) => l.location)))
        .unwrap()
        .then((results) => {
          // enrich geocoded results with activity metadata
          toast.success(`${results.filter(r => r.found).length} locations mapped`);
        })
        .catch(() => toast.error('Some locations could not be mapped'));
    }
  }, [itinerary, dispatch]);

  if (itiLoading || geoLoading) {
    return <Loader message="Loading map..." />;
  }

  if (!itinerary) {
    return <div style={styles.notFound}>Itinerary not found.</div>;
  }

  // get all activity info to enrich markers
  const allActivities = [];
  itinerary.ItineraryDays?.forEach((day) => {
    day.ItineraryActivities?.forEach((act) => {
      if (act.location) {
        allActivities.push({
          ...act,
          dayNumber: day.day_number,
          dayTheme:  day.theme,
        });
      }
    });
  });

  // enrich markers with activity data
  const enrichedMarkers = markers.map((m) => {
    // match marker back to activity by location string
    const locationBase = m.location.replace(`, ${itinerary.destination}`, '');
    const activity = allActivities.find(
      (a) => a.location && m.location.includes(a.location)
    );
    return { ...m, activity, locationBase };
  });

  // filter by active day
  const visibleMarkers = activeDay === 'all'
    ? enrichedMarkers
    : enrichedMarkers.filter((m) => m.activity?.dayNumber === parseInt(activeDay));

  const positions = visibleMarkers.map((m) => [m.lat, m.lng]);
  const centerPos = positions.length > 0 ? positions[0] : [20.5937, 78.9629]; // India center

  const handleMarkerClick = (marker) => {
    dispatch(setSelectedMarker(marker));
    setNearbyCenter({ lat: marker.lat, lng: marker.lng });
  };

  const handleFetchNearby = (type) => {
    if (!nearbyCenter) {
      toast.info('Click a marker first to find nearby places');
      return;
    }
    dispatch(setNearbyType(type));
    dispatch(fetchNearbyPlaces({
      lat: nearbyCenter.lat,
      lng: nearbyCenter.lng,
      type,
    }));
    setShowNearby(true);
  };

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate(`/itineraries/${id}`)} style={styles.backBtn}>
          ← Back to Itinerary
        </button>
        <div>
          <h1 style={styles.heading}>🗺 {itinerary.title}</h1>
          <p style={styles.sub}>
            📍 {itinerary.destination} · {markers.length} locations mapped
          </p>
        </div>
      </div>

      <div style={styles.layout}>

        {/* Left — controls + nearby panel */}
        <div style={styles.leftPanel}>

          {/* Day filter */}
          <div style={styles.panel}>
            <h3 style={styles.panelTitle}>Filter by Day</h3>
            <div style={styles.dayBtns}>
              <button
                onClick={() => setActiveDay('all')}
                style={activeDay === 'all' ? styles.dayBtnActive : styles.dayBtn}
              >
                All Days
              </button>
              {itinerary.ItineraryDays?.map((day) => (
                <button
                  key={day.id}
                  onClick={() => setActiveDay(String(day.day_number))}
                  style={
                    activeDay === String(day.day_number)
                      ? styles.dayBtnActive
                      : styles.dayBtn
                  }
                >
                  Day {day.day_number}
                </button>
              ))}
            </div>
          </div>

          {/* Nearby search */}
          <div style={styles.panel}>
            <h3 style={styles.panelTitle}>
              Find Nearby
              <span style={styles.panelHint}>Click a marker first</span>
            </h3>
            <div style={styles.nearbyTypes}>
              {nearbyTypes.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleFetchNearby(value)}
                  disabled={nearbyLoading}
                  style={{
                    ...styles.nearbyTypeBtn,
                    ...(nearbyType === value && showNearby
                      ? styles.nearbyTypeBtnActive
                      : {}),
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Selected marker info */}
          {selectedMarker && (
            <div style={styles.panel}>
              <h3 style={styles.panelTitle}>Selected Location</h3>
              <div style={styles.selectedInfo}>
                {selectedMarker.activity && (
                  <>
                    <span style={{
                      ...styles.categoryDot,
                      background: categoryColors[selectedMarker.activity.category] || '#6b7280',
                    }} />
                    <div>
                      <p style={styles.selectedName}>
                        {selectedMarker.activity.activity}
                      </p>
                      <p style={styles.selectedMeta}>
                        Day {selectedMarker.activity.dayNumber} · {selectedMarker.activity.time}
                      </p>
                      <p style={styles.selectedLocation}>
                        📍 {selectedMarker.locationBase}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Nearby results */}
          {showNearby && (
            <div style={styles.nearbyPanel}>
              <div style={styles.nearbyHeader}>
                <h3 style={styles.panelTitle}>
                  Nearby {nearbyTypes.find(t => t.value === nearbyType)?.label}
                </h3>
                <button
                  onClick={() => setShowNearby(false)}
                  style={styles.closePanelBtn}
                >
                  ✕
                </button>
              </div>

              {nearbyLoading ? (
                <p style={styles.loadingText}>Finding places...</p>
              ) : nearbyPlaces.length === 0 ? (
                <p style={styles.noPlaces}>No places found nearby.</p>
              ) : (
                <div style={styles.placesList}>
                  {nearbyPlaces.map((place) => (
                    <div key={place.id} style={styles.placeCard}>
                      <p style={styles.placeName}>{place.name}</p>
                      {place.address && (
                        <p style={styles.placeAddress}>📍 {place.address}</p>
                      )}
                      {place.opening && (
                        <p style={styles.placeDetail}>🕐 {place.opening}</p>
                      )}
                      {place.cuisine && (
                        <p style={styles.placeDetail}>🍴 {place.cuisine}</p>
                      )}
                      {place.website && (
                        <a
                          href={place.website}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.placeLink}
                        >
                          🌐 Website
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right — the actual map */}
        <div style={styles.mapWrapper}>
          <MapContainer
            center={centerPos}
            zoom={12}
            style={{ width: '100%', height: '100%' }}
          >
            {/* OpenStreetMap tiles — completely free */}
            <TileLayer
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Auto-fit map to markers */}
            {positions.length > 0 && <FitBounds positions={positions} />}

            {/* Activity markers */}
            {visibleMarkers.map((marker, index) => {
              const color = marker.activity
                ? categoryColors[marker.activity.category] || '#e94560'
                : '#e94560';

              return (
                <Marker
                  key={`${marker.location}-${index}`}
                  position={[marker.lat, marker.lng]}
                  icon={makeIcon(color)}
                  eventHandlers={{
                    click: () => handleMarkerClick(marker),
                  }}
                >
                  <Popup>
                    <div style={styles.popup}>
                      {marker.activity && (
                        <>
                          <p style={styles.popupDay}>
                            Day {marker.activity.dayNumber} · {marker.activity.time}
                          </p>
                          <p style={styles.popupName}>
                            {marker.activity.activity}
                          </p>
                          <p style={styles.popupLocation}>
                            📍 {marker.locationBase}
                          </p>
                          <p style={styles.popupCost}>
                            ₹{Number(marker.activity.estimated_cost).toLocaleString('en-IN')}
                          </p>
                          {marker.activity.tips && (
                            <p style={styles.popupTip}>
                              💡 {marker.activity.tips}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Route line connecting all markers in order */}
            {positions.length > 1 && (
              <Polyline
                positions={positions}
                color="#e94560"
                weight={2}
                opacity={0.6}
                dashArray="8 6"
              />
            )}

            {/* Nearby place markers (blue) */}
            {showNearby && nearbyPlaces.map((place) => (
              <Marker
                key={place.id}
                position={[place.lat, place.lng]}
                icon={makeIcon('#3b82f6')}
              >
                <Popup>
                  <div style={styles.popup}>
                    <p style={styles.popupName}>{place.name}</p>
                    {place.address && (
                      <p style={styles.popupLocation}>📍 {place.address}</p>
                    )}
                    {place.cuisine && (
                      <p style={styles.popupTip}>🍴 {place.cuisine}</p>
                    )}
                    {place.opening && (
                      <p style={styles.popupTip}>🕐 {place.opening}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map legend */}
          <div style={styles.legend}>
            {Object.entries(categoryColors).slice(0, 5).map(([cat, color]) => (
              <div key={cat} style={styles.legendItem}>
                <span style={{ ...styles.legendDot, background: color }} />
                <span style={styles.legendText}>{cat}</span>
              </div>
            ))}
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: '#3b82f6' }} />
              <span style={styles.legendText}>nearby</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page:              { maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' },
  notFound:          { textAlign: 'center', padding: '80px', color: '#6b7280' },
  header:            { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' },
  backBtn:           { background: 'none', border: '1px solid #e5e7eb', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap', color: '#374151' },
  heading:           { fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' },
  sub:               { color: '#6b7280', fontSize: '14px' },
  layout:            { display: 'flex', gap: '16px', height: '75vh' },
  leftPanel:         { width: '280px', flexShrink: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  panel:             { background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  panelTitle:        { fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  panelHint:         { fontSize: '11px', color: '#9ca3af', fontWeight: '400' },
  dayBtns:           { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  dayBtn:            { padding: '5px 12px', border: '1px solid #e5e7eb', borderRadius: '20px', background: '#f9fafb', cursor: 'pointer', fontSize: '12px', color: '#374151' },
  dayBtnActive:      { padding: '5px 12px', border: '1px solid #e94560', borderRadius: '20px', background: '#e94560', cursor: 'pointer', fontSize: '12px', color: '#fff' },
  nearbyTypes:       { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  nearbyTypeBtn:     { padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: '20px', background: '#f9fafb', cursor: 'pointer', fontSize: '12px', color: '#374151' },
  nearbyTypeBtnActive:{ padding: '5px 10px', border: '1px solid #3b82f6', borderRadius: '20px', background: '#eff6ff', cursor: 'pointer', fontSize: '12px', color: '#1d4ed8', fontWeight: '600' },
  selectedInfo:      { display: 'flex', gap: '10px', alignItems: 'flex-start' },
  categoryDot:       { width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, marginTop: '4px' },
  selectedName:      { fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '2px' },
  selectedMeta:      { fontSize: '12px', color: '#6b7280', marginBottom: '2px' },
  selectedLocation:  { fontSize: '12px', color: '#6b7280' },
  nearbyPanel:       { background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', flex: 1 },
  nearbyHeader:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  closePanelBtn:     { background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '16px' },
  loadingText:       { color: '#9ca3af', fontSize: '13px', textAlign: 'center', padding: '16px 0' },
  noPlaces:          { color: '#9ca3af', fontSize: '13px', textAlign: 'center', padding: '16px 0' },
  placesList:        { display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' },
  placeCard:         { background: '#f9fafb', borderRadius: '8px', padding: '12px' },
  placeName:         { fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '4px' },
  placeAddress:      { fontSize: '12px', color: '#6b7280', marginBottom: '2px' },
  placeDetail:       { fontSize: '12px', color: '#6b7280', marginBottom: '2px' },
  placeLink:         { fontSize: '12px', color: '#3b82f6', textDecoration: 'none' },
  mapWrapper:        { flex: 1, borderRadius: '16px', overflow: 'hidden', position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  legend:            { position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(255,255,255,0.95)', borderRadius: '10px', padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: '8px', maxWidth: '200px', zIndex: 1000, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  legendItem:        { display: 'flex', alignItems: 'center', gap: '5px' },
  legendDot:         { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  legendText:        { fontSize: '11px', color: '#374151', textTransform: 'capitalize' },
  popup:             { minWidth: '160px' },
  popupDay:          { fontSize: '11px', color: '#9ca3af', marginBottom: '4px' },
  popupName:         { fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '4px' },
  popupLocation:     { fontSize: '12px', color: '#6b7280', marginBottom: '4px' },
  popupCost:         { fontSize: '13px', fontWeight: '700', color: '#e94560', marginBottom: '6px' },
  popupTip:          { fontSize: '12px', color: '#92400e', background: '#fffbeb', padding: '6px 8px', borderRadius: '6px' },
};

export default ItineraryMapPage;