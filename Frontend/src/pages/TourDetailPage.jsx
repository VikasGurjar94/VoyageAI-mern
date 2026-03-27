import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTourById, clearTour } from "../store/slices/tourSlice";
import Loader from "../components/common/Loader";
import { formatPrice, getImageUrl, formatDate } from "../utils/helpers";

const TourDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tour, loading } = useSelector((s) => s.tours);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchTourById(id));
    // cleanup — clear tour when leaving the page
    return () => dispatch(clearTour());
  }, [id, dispatch]);

  if (loading) return <Loader />;
  if (!tour) return <div style={styles.notFound}>Tour not found.</div>;

  const avgRating = tour.Reviews?.length
    ? (
        tour.Reviews.reduce((sum, r) => sum + r.rating, 0) / tour.Reviews.length
      ).toFixed(1)
    : null;

  return (
    <div style={styles.page}>
      {/* Hero image */}
      <div style={styles.heroWrapper}>
        <img
          src={getImageUrl(tour.image)}
          alt={tour.title}
          style={styles.heroImg}
          onError={(e) => {
            e.target.src = "/placeholder.jpg";
          }}
        />
        <div style={styles.heroOverlay}>
          <span style={styles.diffBadge}>{tour.difficulty}</span>
          <h1 style={styles.heroTitle}>{tour.title}</h1>
          <p style={styles.heroSub}>📍 {tour.destination}</p>
        </div>
      </div>

      <div style={styles.content}>
        {/* Left column */}
        <div style={styles.left}>
          {/* Stats row */}
          <div style={styles.statsRow}>
            {[
              { label: "Duration", value: `${tour.duration_days} days` },
              { label: "Group size", value: `Max ${tour.max_group_size}` },
              { label: "Difficulty", value: tour.difficulty },
              {
                label: "Rating",
                value: avgRating ? `⭐ ${avgRating}` : "No ratings yet",
              },
            ].map(({ label, value }) => (
              <div key={label} style={styles.statBox}>
                <span style={styles.statLabel}>{label}</span>
                <span style={styles.statValue}>{value}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>About this tour</h2>
            <p style={styles.description}>{tour.description}</p>
          </div>

          {/* Reviews */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Reviews ({tour.Reviews?.length || 0})
            </h2>
            {tour.Reviews?.length === 0 && (
              <p style={styles.noReviews}>No reviews yet. Be the first!</p>
            )}
            {tour.Reviews?.map((review) => (
              <div key={review.id} style={styles.reviewCard}>
                <div style={styles.reviewHeader}>
                  <div style={styles.reviewAvatar}>
                    {review.User?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={styles.reviewName}>{review.User?.name}</p>
                    <p style={styles.reviewDate}>
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                  <div style={styles.reviewRating}>
                    {"⭐".repeat(review.rating)}
                  </div>
                </div>
                {review.comment && (
                  <p style={styles.reviewComment}>{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right column — booking card */}
        <div style={styles.right}>
          <div style={styles.bookingCard}>
            <p style={styles.priceLabel}>Price per person</p>
            <p style={styles.price}>{formatPrice(tour.price)}</p>

            <div style={styles.divider} />

            <div style={styles.infoRow}>
              <span>Duration</span>
              <span>{tour.duration_days} days</span>
            </div>
            <div style={styles.infoRow}>
              <span>Max group</span>
              <span>{tour.max_group_size} people</span>
            </div>
            <div style={styles.infoRow}>
              <span>Difficulty</span>
              <span style={{ textTransform: "capitalize" }}>
                {tour.difficulty}
              </span>
            </div>

            <div style={styles.divider} />

            {user ? (
              <button
                onClick={() => navigate(`/book/${tour.id}`)}
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
              No payment charged yet. Confirm on next step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { maxWidth: "1200px", margin: "0 auto", padding: "0 0 60px" },
  notFound: {
    textAlign: "center",
    padding: "80px",
    color: "#6b7280",
    fontSize: "18px",
  },
  heroWrapper: { position: "relative", height: "420px", overflow: "hidden" },
  heroImg: { width: "100%", height: "100%", objectFit: "cover" },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: "40px",
  },
  diffBadge: {
    background: "#e94560",
    color: "#fff",
    padding: "4px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    width: "fit-content",
    marginBottom: "10px",
    textTransform: "capitalize",
  },
  heroTitle: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#fff",
    marginBottom: "8px",
  },
  heroSub: { fontSize: "16px", color: "#e5e7eb" },
  content: {
    display: "flex",
    gap: "32px",
    padding: "40px 20px",
    alignItems: "flex-start",
  },
  left: { flex: 1 },
  right: { width: "320px", flexShrink: 0 },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "36px",
  },
  statBox: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "16px",
    textAlign: "center",
  },
  statLabel: {
    display: "block",
    fontSize: "12px",
    color: "#9ca3af",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statValue: {
    display: "block",
    fontSize: "15px",
    fontWeight: "700",
    color: "#111827",
    textTransform: "capitalize",
  },
  section: { marginBottom: "36px" },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "14px",
    borderBottom: "2px solid #f3f4f6",
    paddingBottom: "10px",
  },
  description: { color: "#4b5563", lineHeight: "1.8", fontSize: "15px" },
  noReviews: { color: "#9ca3af", fontStyle: "italic" },
  reviewCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "12px",
  },
  reviewHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "10px",
  },
  reviewAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#e94560",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "16px",
  },
  reviewName: { fontWeight: "600", fontSize: "14px", color: "#111827" },
  reviewDate: { fontSize: "12px", color: "#9ca3af" },
  reviewRating: { marginLeft: "auto", fontSize: "14px" },
  reviewComment: { color: "#4b5563", fontSize: "14px", lineHeight: "1.6" },
  bookingCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "28px",
    position: "sticky",
    top: "80px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  priceLabel: { fontSize: "13px", color: "#9ca3af", marginBottom: "4px" },
  price: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#e94560",
    marginBottom: "20px",
  },
  divider: { borderTop: "1px solid #f3f4f6", margin: "16px 0" },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    color: "#4b5563",
    marginBottom: "10px",
  },
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
    marginTop: "8px",
  },
  bookNote: {
    textAlign: "center",
    fontSize: "12px",
    color: "#9ca3af",
    marginTop: "12px",
  },
};

export default TourDetailPage;
