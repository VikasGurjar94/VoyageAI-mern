import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import { fetchTourById, clearTour } from "../store/slices/tourSlice";
import { formatPrice, getImageUrl, formatDate } from "../utils/helpers";
import Loader from "../components/common/Loader";
import api from "../services/api";
import { toast } from "react-toastify";

// fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// numbered day marker for map
const makeDayIcon = (dayNumber, isActive) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        width:36px;height:36px;border-radius:50%;
        background:${isActive ? "#e94560" : "#1a1a2e"};
        border:3px solid #fff;
        display:flex;align-items:center;justify-content:center;
        color:#fff;font-weight:700;font-size:13px;
        box-shadow:0 3px 10px rgba(0,0,0,0.35);
        cursor:pointer;
      ">${dayNumber}</div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
  });

// star rating display
const Stars = ({ rating, size = 16 }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <span style={{ display: "flex", gap: "2px", alignItems: "center" }}>
      {Array(full)
        .fill(0)
        .map((_, i) => (
          <span key={`f${i}`} style={{ color: "#f59e0b", fontSize: size }}>
            ★
          </span>
        ))}
      {half === 1 && (
        <span style={{ color: "#f59e0b", fontSize: size }}>½</span>
      )}
      {Array(empty)
        .fill(0)
        .map((_, i) => (
          <span key={`e${i}`} style={{ color: "#d1d5db", fontSize: size }}>
            ★
          </span>
        ))}
    </span>
  );
};

// what's included / excluded items
const INCLUDED = [
  "Professional tour guide",
  "All accommodation (as per itinerary)",
  "Daily breakfast",
  "All transport within tour",
  "Entry fees to monuments",
  "Airport pickup and drop",
];

const EXCLUDED = [
  "International/domestic flights",
  "Personal expenses",
  "Travel insurance",
  "Meals not mentioned",
  "Tips and gratuities",
  "Camera/video fees",
];

const FAQS = [
  {
    q: "What is the cancellation policy?",
    a: "Free cancellation up to 7 days before the travel date. 50% refund for cancellations 3–7 days before. No refund for cancellations less than 3 days before.",
  },
  {
    q: "Is this tour suitable for children?",
    a: "Yes, this tour is family-friendly. Children under 5 travel free. Children 5–12 get a 30% discount on the tour price.",
  },
  {
    q: "What should I pack?",
    a: "Comfortable walking shoes, light cotton clothes, sunscreen, sunglasses, a hat, and any personal medication. A light rain jacket is recommended.",
  },
  {
    q: "Are meals included?",
    a: "Meals are included as mentioned in each day of the itinerary. You can check the meal plan in the day-wise section above.",
  },
  {
    q: "What happens if the weather is bad?",
    a: "Our guides are experienced in handling weather changes. Alternative indoor activities are always planned. Safety is our top priority.",
  },
];

const TourDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tour, loading } = useSelector((s) => s.tours);
  const { user } = useSelector((s) => s.auth);

  const [itineraryDays, setItineraryDays] = useState([]);
  const [geoMarkers, setGeoMarkers] = useState([]);
  const [activeDay, setActiveDay] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [numPeople, setNumPeople] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [geoLoading, setGeoLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const overviewRef = useRef(null);
  const itineraryRef = useRef(null);
  const mapRef = useRef(null);
  const reviewsRef = useRef(null);

  useEffect(() => {
    dispatch(fetchTourById(id));
    return () => dispatch(clearTour());
  }, [id, dispatch]);

  // fetch itinerary days separately
  useEffect(() => {
    if (!id) return;
    const fetchItinerary = async () => {
      try {
        const { data } = await api.get(`/tours/${id}/itinerary`);
        setItineraryDays(data.days || []);
      } catch {
        setItineraryDays([]);
      }
    };
    fetchItinerary();
  }, [id]);

  // geocode itinerary day locations for map
  useEffect(() => {
    if (itineraryDays.length === 0) return;

    const geocode = async () => {
      setGeoLoading(true);
      try {
        const locations = itineraryDays
          .filter((d) => d.location)
          .map((d) => d.location);

        if (locations.length === 0) return;

        const { data } = await api.post("/maps/geocode-many", { locations });
        const markers = data.results
          .filter((r) => r.found)
          .map((r, i) => ({
            ...r,
            dayNumber: itineraryDays[i]?.day_number,
            dayTitle: itineraryDays[i]?.title,
            daySummary:
              itineraryDays[i]?.description?.substring(0, 100) + "...",
          }));

        setGeoMarkers(markers);
      } catch {
        // map just won't show if geocoding fails
      } finally {
        setGeoLoading(false);
      }
    };

    geocode();
  }, [itineraryDays]);

  const scrollTo = (ref, tab) => {
    setActiveTab(tab);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) return <Loader />;
  if (!tour)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px",
          color: "#6b7280",
          fontSize: "18px",
        }}
      >
        Tour not found.
      </div>
    );

  const avgRating = parseFloat(tour.avgRating) || 0;
  const totalPrice = tour.price * numPeople;
  const mapCenter =
    geoMarkers.length > 0
      ? [geoMarkers[0].lat, geoMarkers[0].lng]
      : [20.5937, 78.9629];

  return (
    <div style={styles.page}>
      {/* ── HERO ────────────────────────────────────────── */}
      <div style={styles.hero}>
        <img
          src={imgError ? "/placeholder.jpg" : getImageUrl(tour.image)}
          alt={tour.title}
          style={styles.heroImg}
          onError={() => setImgError(true)}
        />
        <div style={styles.heroOverlay}>
          <div style={styles.heroBreadcrumb}>
            <span
              onClick={() => navigate("/tours")}
              style={styles.breadcrumbLink}
            >
              Tours
            </span>
            <span style={styles.breadcrumbSep}>/</span>
            <span style={styles.breadcrumbCurrent}>{tour.destination}</span>
          </div>
          <h1 style={styles.heroTitle}>{tour.title}</h1>
          <div style={styles.heroMeta}>
            {avgRating > 0 && (
              <span style={styles.heroRating}>
                <Stars rating={avgRating} size={16} />
                <span style={{ marginLeft: "6px", fontWeight: "600" }}>
                  {avgRating}
                </span>
                <span style={{ color: "#d1fae5", marginLeft: "4px" }}>
                  ({tour.reviewCount} reviews)
                </span>
              </span>
            )}
            <span style={styles.heroBadge}>📍 {tour.destination}</span>
            <span style={styles.heroBadge}>🗓 {tour.duration_days} Days</span>
            <span
              style={{
                ...styles.heroBadge,
                background:
                  tour.difficulty === "easy"
                    ? "rgba(16,185,129,0.2)"
                    : tour.difficulty === "moderate"
                      ? "rgba(245,158,11,0.2)"
                      : "rgba(239,68,68,0.2)",
              }}
            >
              {tour.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* ── STICKY NAV TABS ─────────────────────────────── */}
      <div style={styles.stickyNav}>
        <div style={styles.stickyNavInner}>
          {[
            { key: "overview", label: "Overview", ref: overviewRef },
            { key: "itinerary", label: "Itinerary", ref: itineraryRef },
            { key: "map", label: "Map", ref: mapRef },
            { key: "reviews", label: "Reviews", ref: reviewsRef },
          ].map(({ key, label, ref }) => (
            <button
              key={key}
              onClick={() => scrollTo(ref, key)}
              style={activeTab === key ? styles.navTabActive : styles.navTab}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN LAYOUT ─────────────────────────────────── */}
      <div style={styles.mainLayout}>
        {/* LEFT COLUMN */}
        <div style={styles.leftCol}>
          {/* ── OVERVIEW ────────────────────────────────── */}
          <div ref={overviewRef} style={styles.section}>
            {/* Stats bar */}
            <div style={styles.statsBar}>
              {[
                {
                  icon: "🗓",
                  label: "Duration",
                  value: `${tour.duration_days} Days`,
                },
                {
                  icon: "👥",
                  label: "Group size",
                  value: `Max ${tour.max_group_size}`,
                },
                { icon: "🧗", label: "Difficulty", value: tour.difficulty },
                {
                  icon: "⭐",
                  label: "Rating",
                  value: avgRating ? `${avgRating}/5` : "New",
                },
                { icon: "💬", label: "Reviews", value: `${tour.reviewCount}` },
              ].map(({ icon, label, value }) => (
                <div key={label} style={styles.statItem}>
                  <span style={styles.statIcon}>{icon}</span>
                  <span style={styles.statLabel}>{label}</span>
                  <span style={styles.statValue}>{value}</span>
                </div>
              ))}
            </div>

            {/* About */}
            <h2 style={styles.sectionTitle}>About this tour</h2>
            <p style={styles.description}>{tour.description}</p>

            {/* Highlights */}
            <h2 style={styles.sectionTitle}>Tour highlights</h2>
            <div style={styles.highlightsGrid}>
              {[
                "🏖 Pristine beach experiences",
                "🏛 UNESCO heritage sites",
                "🍜 Authentic local cuisine",
                "🚤 Exciting water sports",
                "📸 Scenic photography spots",
                "🌿 Nature and wildlife",
                "🎭 Local culture and festivals",
                "🌅 Breathtaking sunsets",
              ].map((item) => (
                <div key={item} style={styles.highlightItem}>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Included / Excluded */}
            <div style={styles.inclExclGrid}>
              <div style={styles.inclCard}>
                <h3 style={styles.inclTitle}>✅ What's included</h3>
                {INCLUDED.map((item) => (
                  <div key={item} style={styles.inclItem}>
                    <span style={styles.inclCheck}>✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div style={styles.exclCard}>
                <h3 style={styles.exclTitle}>❌ Not included</h3>
                {EXCLUDED.map((item) => (
                  <div key={item} style={styles.exclItem}>
                    <span style={styles.exclX}>✗</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── ITINERARY ────────────────────────────────── */}
          <div ref={itineraryRef} style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Day-wise Itinerary
              <span style={styles.sectionBadge}>
                {itineraryDays.length} days
              </span>
            </h2>

            {itineraryDays.length === 0 ? (
              <div style={styles.noItinerary}>
                <p>Detailed itinerary coming soon.</p>
              </div>
            ) : (
              <div style={styles.itineraryList}>
                {itineraryDays.map((day, index) => (
                  <div
                    key={day.id}
                    style={{
                      ...styles.dayCard,
                      ...(activeDay === index ? styles.dayCardActive : {}),
                    }}
                  >
                    {/* Day header — click to expand */}
                    <div
                      style={styles.dayHeader}
                      onClick={() =>
                        setActiveDay(activeDay === index ? -1 : index)
                      }
                    >
                      <div style={styles.dayHeaderLeft}>
                        <div style={styles.dayNumber}>Day {day.day_number}</div>
                        <div>
                          <h3 style={styles.dayTitle}>{day.title}</h3>
                          {day.location && (
                            <p style={styles.dayLocation}>📍 {day.location}</p>
                          )}
                        </div>
                      </div>
                      <div style={styles.dayHeaderRight}>
                        {/* Meal indicators */}
                        <div style={styles.mealBadges}>
                          {day.meals?.breakfast && (
                            <span style={styles.mealBadge} title="Breakfast">
                              🍳
                            </span>
                          )}
                          {day.meals?.lunch && (
                            <span style={styles.mealBadge} title="Lunch">
                              🥗
                            </span>
                          )}
                          {day.meals?.dinner && (
                            <span style={styles.mealBadge} title="Dinner">
                              🍽
                            </span>
                          )}
                        </div>
                        <span style={styles.expandIcon}>
                          {activeDay === index ? "▲" : "▼"}
                        </span>
                      </div>
                    </div>

                    {/* Day body — expanded */}
                    {activeDay === index && (
                      <div style={styles.dayBody}>
                        <p style={styles.dayDesc}>{day.description}</p>

                        {/* Activities */}
                        {day.activities?.length > 0 && (
                          <div style={styles.activitiesSection}>
                            <p style={styles.activitiesLabel}>Activities</p>
                            <div style={styles.activitiesList}>
                              {day.activities.map((act, i) => (
                                <div key={i} style={styles.activityItem}>
                                  <span style={styles.activityDot} />
                                  <span style={styles.activityText}>{act}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Day footer */}
                        <div style={styles.dayFooter}>
                          {day.accommodation && (
                            <span style={styles.dayFooterItem}>
                              🏨 {day.accommodation}
                            </span>
                          )}
                          {day.distance_km > 0 && (
                            <span style={styles.dayFooterItem}>
                              🚗 {day.distance_km} km
                            </span>
                          )}
                          <div style={styles.dayMeals}>
                            <span style={styles.dayFooterItem}>Meals:</span>
                            {day.meals?.breakfast && (
                              <span style={styles.mealTag}>Breakfast</span>
                            )}
                            {day.meals?.lunch && (
                              <span style={styles.mealTag}>Lunch</span>
                            )}
                            {day.meals?.dinner && (
                              <span style={styles.mealTag}>Dinner</span>
                            )}
                            {!day.meals?.breakfast &&
                              !day.meals?.lunch &&
                              !day.meals?.dinner && (
                                <span style={styles.noMeal}>Not included</span>
                              )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── MAP ──────────────────────────────────────── */}
          <div ref={mapRef} style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Tour Map
              <span style={styles.sectionBadge}>
                {geoMarkers.length} locations
              </span>
            </h2>

            {geoLoading ? (
              <div style={styles.mapPlaceholder}>
                <Loader message="Loading map..." />
              </div>
            ) : geoMarkers.length === 0 ? (
              <div style={styles.mapPlaceholder}>
                <p style={{ color: "#9ca3af" }}>
                  Map will appear once itinerary locations are set.
                </p>
              </div>
            ) : (
              <div style={styles.mapWrapper}>
                <MapContainer
                  center={mapCenter}
                  zoom={10}
                  style={{
                    width: "100%",
                    height: "420px",
                    borderRadius: "12px",
                    zIndex: 0,
                  }}
                >
                  <TileLayer
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Day markers */}
                  {geoMarkers.map((marker, i) => (
                    <Marker
                      key={i}
                      position={[marker.lat, marker.lng]}
                      icon={makeDayIcon(marker.dayNumber, activeDay === i)}
                    >
                      <Popup>
                        <div style={{ minWidth: "180px" }}>
                          <p
                            style={{
                              fontWeight: "700",
                              color: "#e94560",
                              marginBottom: "4px",
                              fontSize: "13px",
                            }}
                          >
                            Day {marker.dayNumber}
                          </p>
                          <p
                            style={{
                              fontWeight: "600",
                              color: "#111827",
                              marginBottom: "6px",
                              fontSize: "14px",
                            }}
                          >
                            {marker.dayTitle}
                          </p>
                          <p
                            style={{
                              color: "#6b7280",
                              fontSize: "12px",
                              lineHeight: "1.5",
                            }}
                          >
                            {marker.daySummary}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Route line between day locations */}
                  {geoMarkers.length > 1 && (
                    <Polyline
                      positions={geoMarkers.map((m) => [m.lat, m.lng])}
                      color="#e94560"
                      weight={2.5}
                      opacity={0.7}
                      dashArray="8 5"
                    />
                  )}
                </MapContainer>

                {/* Map legend */}
                <div style={styles.mapLegend}>
                  {geoMarkers.map((m, i) => (
                    <div
                      key={i}
                      style={styles.legendItem}
                      onClick={() => setActiveDay(i)}
                    >
                      <div
                        style={{
                          ...styles.legendDot,
                          background: activeDay === i ? "#e94560" : "#1a1a2e",
                        }}
                      >
                        {m.dayNumber}
                      </div>
                      <span style={styles.legendText}>{m.dayTitle}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── REVIEWS ──────────────────────────────────── */}
          <div ref={reviewsRef} style={styles.section}>
            <div style={styles.reviewsHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Traveller Reviews</h2>
                {avgRating > 0 && (
                  <div style={styles.ratingOverview}>
                    <span style={styles.ratingBig}>{avgRating}</span>
                    <div>
                      <Stars rating={avgRating} size={20} />
                      <p style={styles.ratingCount}>
                        Based on {tour.reviewCount} reviews
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!tour.Reviews || tour.Reviews.length === 0 ? (
              <div style={styles.noReviews}>
                <p>No reviews yet. Be the first to review this tour!</p>
              </div>
            ) : (
              <div style={styles.reviewsList}>
                {tour.Reviews.map((review) => (
                  <div key={review.id} style={styles.reviewCard}>
                    <div style={styles.reviewTop}>
                      <div style={styles.reviewAvatar}>
                        {review.User?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={styles.reviewMeta}>
                        <p style={styles.reviewName}>{review.User?.name}</p>
                        <p style={styles.reviewDate}>
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                      <div style={styles.reviewRating}>
                        <Stars rating={review.rating} size={14} />
                      </div>
                    </div>
                    {review.comment && (
                      <p style={styles.reviewComment}>{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── FAQ ──────────────────────────────────────── */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
            <div style={styles.faqList}>
              {FAQS.map((faq, i) => (
                <div key={i} style={styles.faqItem}>
                  <div
                    style={styles.faqQuestion}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span>{faq.q}</span>
                    <span style={styles.faqIcon}>
                      {openFaq === i ? "▲" : "▼"}
                    </span>
                  </div>
                  {openFaq === i && <div style={styles.faqAnswer}>{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — STICKY BOOKING CARD */}
        <div style={styles.rightCol}>
          <div style={styles.bookingCard}>
            {/* Price */}
            <div style={styles.priceRow}>
              <div>
                <span style={styles.priceLabel}>Starting from</span>
                <span style={styles.price}>{formatPrice(tour.price)}</span>
                <span style={styles.pricePer}>/person</span>
              </div>
              {avgRating > 0 && (
                <div style={styles.cardRating}>
                  <Stars rating={avgRating} size={13} />
                  <span style={styles.cardRatingText}>{avgRating}</span>
                </div>
              )}
            </div>

            <div style={styles.bookingDivider} />

            {/* Date picker */}
            <div style={styles.bookingField}>
              <label style={styles.bookingLabel}>📅 Travel Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                style={styles.bookingInput}
              />
            </div>

            {/* People counter */}
            <div style={styles.bookingField}>
              <label style={styles.bookingLabel}>👥 Travellers</label>
              <div style={styles.counterRow}>
                <button
                  onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
                  style={styles.counterBtn}
                >
                  −
                </button>
                <span style={styles.counterValue}>{numPeople}</span>
                <button
                  onClick={() =>
                    setNumPeople(Math.min(tour.max_group_size, numPeople + 1))
                  }
                  style={styles.counterBtn}
                >
                  +
                </button>
                <span style={styles.counterMax}>Max {tour.max_group_size}</span>
              </div>
            </div>

            <div style={styles.bookingDivider} />

            {/* Price breakdown */}
            <div style={styles.priceBreakdown}>
              <div style={styles.breakdownRow}>
                <span>
                  {formatPrice(tour.price)} × {numPeople} person
                  {numPeople > 1 ? "s" : ""}
                </span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div style={styles.breakdownRow}>
                <span>Taxes & fees</span>
                <span style={{ color: "#10b981" }}>Included</span>
              </div>
            </div>

            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total</span>
              <span style={styles.totalPrice}>{formatPrice(totalPrice)}</span>
            </div>

            {/* Book button */}
            {user ? (
              <button
                onClick={() => {
                  if (!selectedDate) {
                    toast.error("Please select a travel date");
                    return;
                  }
                  navigate(`/book/${tour.id}`, {
                    state: { selectedDate, numPeople },
                  });
                }}
                style={styles.bookBtn}
              >
                Book This Tour
              </button>
            ) : (
              <button onClick={() => navigate("/login")} style={styles.bookBtn}>
                Login to Book
              </button>
            )}

            <p style={styles.bookNote}>
              🔒 No payment charged yet. Free cancellation available.
            </p>

            <div style={styles.bookingDivider} />

            {/* Share / Wishlist */}
            <div style={styles.shareRow}>
              <button
                style={styles.shareBtn}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied to clipboard!");
                }}
              >
                🔗 Share
              </button>
              <button style={styles.shareBtn}>♡ Save</button>
            </div>

            {/* Trust badges */}
            <div style={styles.trustBadges}>
              {[
                "✅ Verified operator",
                "🛡 Secure payments",
                "📞 24/7 support",
              ].map((item) => (
                <div key={item} style={styles.trustItem}>
                  <span style={styles.trustText}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { background: "#f9fafb", minHeight: "100vh", paddingBottom: "60px" },

  // Hero
  hero: { position: "relative", height: "520px", overflow: "hidden" },
  heroImg: { width: "100%", height: "100%", objectFit: "cover" },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: "40px 48px",
  },
  heroBreadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  breadcrumbLink: {
    color: "#d1fae5",
    fontSize: "13px",
    cursor: "pointer",
    textDecoration: "underline",
  },
  breadcrumbSep: { color: "#9ca3af", fontSize: "13px" },
  breadcrumbCurrent: { color: "#fff", fontSize: "13px" },
  heroTitle: {
    fontSize: "42px",
    fontWeight: "800",
    color: "#fff",
    lineHeight: "1.2",
    marginBottom: "14px",
    maxWidth: "700px",
  },
  heroMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    alignItems: "center",
  },
  heroRating: {
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.15)",
    padding: "6px 12px",
    borderRadius: "20px",
    color: "#fff",
    fontSize: "14px",
  },
  heroBadge: {
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
    textTransform: "capitalize",
  },

  // Sticky nav
  stickyNav: {
    position: "sticky",
    top: "64px",
    zIndex: 90,
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  stickyNavInner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    gap: "4px",
  },
  navTab: {
    padding: "14px 20px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: "500",
    borderBottom: "3px solid transparent",
  },
  navTabActive: {
    padding: "14px 20px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    color: "#e94560",
    fontWeight: "700",
    borderBottom: "3px solid #e94560",
  },

  // Layout
  mainLayout: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px 24px",
    display: "flex",
    gap: "28px",
    alignItems: "flex-start",
  },
  leftCol: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0",
    minWidth: 0,
  },
  rightCol: { width: "340px", flexShrink: 0 },
  section: {
    background: "#fff",
    borderRadius: "16px",
    padding: "28px",
    marginBottom: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "18px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  sectionBadge: {
    fontSize: "13px",
    fontWeight: "500",
    background: "#f3f4f6",
    color: "#6b7280",
    padding: "3px 10px",
    borderRadius: "20px",
  },

  // Stats bar
  statsBar: {
    display: "flex",
    gap: "0",
    marginBottom: "24px",
    background: "#f9fafb",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },
  statItem: {
    flex: 1,
    padding: "16px 12px",
    textAlign: "center",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statIcon: { fontSize: "20px" },
  statLabel: {
    fontSize: "11px",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: "500",
  },
  statValue: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#111827",
    textTransform: "capitalize",
  },

  // Description
  description: {
    color: "#4b5563",
    lineHeight: "1.8",
    fontSize: "15px",
    marginBottom: "24px",
  },

  // Highlights
  highlightsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "24px",
  },
  highlightItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    background: "#f9fafb",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#374151",
  },

  // Included / Excluded
  inclExclGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  inclCard: { background: "#f0fdf4", borderRadius: "12px", padding: "18px" },
  inclTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#166534",
    marginBottom: "12px",
  },
  inclItem: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
    marginBottom: "8px",
    fontSize: "13px",
    color: "#374151",
  },
  inclCheck: {
    color: "#16a34a",
    fontWeight: "700",
    flexShrink: 0,
    marginTop: "1px",
  },
  exclCard: { background: "#fef2f2", borderRadius: "12px", padding: "18px" },
  exclTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#991b1b",
    marginBottom: "12px",
  },
  exclItem: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
    marginBottom: "8px",
    fontSize: "13px",
    color: "#374151",
  },
  exclX: {
    color: "#dc2626",
    fontWeight: "700",
    flexShrink: 0,
    marginTop: "1px",
  },

  // Itinerary
  noItinerary: {
    textAlign: "center",
    padding: "32px",
    color: "#9ca3af",
    background: "#f9fafb",
    borderRadius: "10px",
  },
  itineraryList: { display: "flex", flexDirection: "column", gap: "10px" },
  dayCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    overflow: "hidden",
    transition: "border-color 0.2s",
  },
  dayCardActive: { border: "2px solid #e94560" },
  dayHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 18px",
    cursor: "pointer",
    background: "#fafafa",
    userSelect: "none",
  },
  dayHeaderLeft: { display: "flex", gap: "14px", alignItems: "center" },
  dayHeaderRight: { display: "flex", gap: "10px", alignItems: "center" },
  dayNumber: {
    background: "#1a1a2e",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "6px",
    whiteSpace: "nowrap",
  },
  dayTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "3px",
  },
  dayLocation: { fontSize: "12px", color: "#6b7280" },
  mealBadges: { display: "flex", gap: "4px" },
  mealBadge: { fontSize: "16px" },
  expandIcon: { color: "#9ca3af", fontSize: "12px" },
  dayBody: { padding: "18px", borderTop: "1px solid #f3f4f6" },
  dayDesc: {
    color: "#4b5563",
    fontSize: "14px",
    lineHeight: "1.7",
    marginBottom: "16px",
  },
  activitiesSection: { marginBottom: "14px" },
  activitiesLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px",
  },
  activitiesList: { display: "flex", flexDirection: "column", gap: "6px" },
  activityItem: { display: "flex", gap: "8px", alignItems: "center" },
  activityDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#e94560",
    flexShrink: 0,
  },
  activityText: { fontSize: "13px", color: "#374151" },
  dayFooter: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "center",
    paddingTop: "12px",
    borderTop: "1px solid #f3f4f6",
  },
  dayFooterItem: { fontSize: "13px", color: "#6b7280" },
  dayMeals: {
    display: "flex",
    gap: "6px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  mealTag: {
    background: "#ecfdf5",
    color: "#065f46",
    fontSize: "12px",
    padding: "3px 8px",
    borderRadius: "20px",
    fontWeight: "500",
  },
  noMeal: { fontSize: "12px", color: "#9ca3af" },

  // Map
  mapPlaceholder: {
    height: "300px",
    background: "#f9fafb",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  mapWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    position: "relative", // ← add this
    zIndex: 0,
  },
  mapLegend: { display: "flex", flexWrap: "wrap", gap: "10px" },
  legendItem: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    cursor: "pointer",
    padding: "6px 12px",
    background: "#f9fafb",
    borderRadius: "20px",
  },
  legendDot: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "11px",
    fontWeight: "700",
    flexShrink: 0,
  },
  legendText: { fontSize: "13px", color: "#374151", fontWeight: "500" },

  // Reviews
  reviewsHeader: { marginBottom: "20px" },
  ratingOverview: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    marginTop: "8px",
  },
  ratingBig: {
    fontSize: "48px",
    fontWeight: "800",
    color: "#111827",
    lineHeight: "1",
  },
  ratingCount: { fontSize: "13px", color: "#6b7280", marginTop: "4px" },
  noReviews: {
    textAlign: "center",
    padding: "32px",
    color: "#9ca3af",
    background: "#f9fafb",
    borderRadius: "10px",
  },
  reviewsList: { display: "flex", flexDirection: "column", gap: "16px" },
  reviewCard: { background: "#f9fafb", borderRadius: "12px", padding: "18px" },
  reviewTop: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginBottom: "10px",
  },
  reviewAvatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#1a1a2e",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "16px",
    flexShrink: 0,
  },
  reviewMeta: { flex: 1 },
  reviewName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "2px",
  },
  reviewDate: { fontSize: "12px", color: "#9ca3af" },
  reviewRating: { flexShrink: 0 },
  reviewComment: { color: "#4b5563", fontSize: "14px", lineHeight: "1.7" },

  // FAQ
  faqList: { display: "flex", flexDirection: "column", gap: "8px" },
  faqItem: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    overflow: "hidden",
  },
  faqQuestion: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 18px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    color: "#111827",
    background: "#fafafa",
    userSelect: "none",
  },
  faqIcon: {
    color: "#9ca3af",
    fontSize: "12px",
    flexShrink: 0,
    marginLeft: "12px",
  },
  faqAnswer: {
    padding: "14px 18px",
    fontSize: "14px",
    color: "#4b5563",
    lineHeight: "1.7",
    borderTop: "1px solid #f3f4f6",
    background: "#fff",
  },

  // Booking card
  bookingCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    position: "sticky",
    top: "100px",
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  priceLabel: {
    display: "block",
    fontSize: "12px",
    color: "#9ca3af",
    marginBottom: "4px",
  },
  price: { fontSize: "30px", fontWeight: "800", color: "#e94560" },
  pricePer: { fontSize: "14px", color: "#9ca3af", marginLeft: "4px" },
  cardRating: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
  },
  cardRatingText: { fontSize: "13px", fontWeight: "700", color: "#111827" },
  bookingDivider: { borderTop: "1px solid #f3f4f6", margin: "16px 0" },
  bookingField: { marginBottom: "14px" },
  bookingLabel: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
  },
  bookingInput: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
  },
  counterRow: { display: "flex", alignItems: "center", gap: "12px" },
  counterBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#374151",
    fontWeight: "700",
  },
  counterValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
    minWidth: "24px",
    textAlign: "center",
  },
  counterMax: { fontSize: "12px", color: "#9ca3af" },
  priceBreakdown: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "12px",
  },
  breakdownRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#6b7280",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderTop: "1px solid #e5e7eb",
    marginBottom: "14px",
  },
  totalLabel: { fontSize: "16px", fontWeight: "700", color: "#111827" },
  totalPrice: { fontSize: "22px", fontWeight: "800", color: "#e94560" },
  bookBtn: {
    width: "100%",
    padding: "14px",
    background: "#e94560",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
  },
  bookNote: {
    textAlign: "center",
    fontSize: "12px",
    color: "#9ca3af",
    marginTop: "10px",
  },
  shareRow: { display: "flex", gap: "10px" },
  shareBtn: {
    flex: 1,
    padding: "10px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
  },
  trustBadges: {
    marginTop: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  trustItem: { display: "flex", alignItems: "center", gap: "8px" },
  trustText: { fontSize: "12px", color: "#6b7280" },
};

export default TourDetailPage;
