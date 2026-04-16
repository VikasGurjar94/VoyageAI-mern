import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyBookings, cancelBooking } from "../store/slices/bookingSlice";
import { toast } from "react-toastify";
import Loader from "../components/common/Loader";
import ReviewModal from "../components/common/ReviewModal";
import { formatPrice, formatDate, getImageUrl } from "../utils/helpers";

// status config — color, label, icon for each status
const STATUS_CONFIG = {
  pending: {
    bg: "#fffbeb",
    color: "#d97706",
    label: "Pending Payment",
    icon: "⏳",
  },
  confirmed: {
    bg: "#eff6ff",
    color: "#2563eb",
    label: "Confirmed",
    icon: "✅",
  },
  completed: {
    bg: "#ecfdf5",
    color: "#059669",
    label: "Completed",
    icon: "🎉",
  },
  cancelled: {
    bg: "#fef2f2",
    color: "#dc2626",
    label: "Cancelled",
    icon: "❌",
  },
};

// how many days until travel
const daysUntil = (dateStr) => {
  const today = new Date();
  const travel = new Date(dateStr);
  today.setHours(0, 0, 0, 0);
  travel.setHours(0, 0, 0, 0);
  return Math.ceil((travel - today) / (1000 * 60 * 60 * 24));
};

const MyBookingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookings, loading } = useSelector((s) => s.bookings);
  const { token } = useSelector((s) => s.auth);

  const [reviewBooking, setReviewBooking] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [reviewedTours, setReviewedTours] = useState(new Set());

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const handleCancel = (id) => {
    if (window.confirm("Cancel this booking? This action cannot be undone.")) {
      dispatch(cancelBooking(id))
        .unwrap()
        .then(() =>
          toast.success("Booking cancelled. Cancellation email sent."),
        )
        .catch((err) => toast.error(err));
    }
  };

  const handleDownloadInvoice = async (bookingId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/${bookingId}/invoice`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) throw new Error("Failed to download");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-booking-${bookingId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Invoice downloaded!");
    } catch {
      toast.error("Invoice download failed");
    }
  };

  const handleReviewSubmitted = (tourId) => {
    setReviewedTours((prev) => new Set([...prev, tourId]));
  };

  // filter bookings
  const filtered =
    activeFilter === "all"
      ? bookings
      : bookings.filter((b) => b.status === activeFilter);

  // count by status
  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <Loader message="Loading your bookings..." />;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>My Bookings</h1>
          <p style={styles.sub}>
            {bookings.length} total booking{bookings.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={() => navigate("/tours")} style={styles.explorBtn}>
          + Book New Tour
        </button>
      </div>

      {/* Filter tabs */}
      <div style={styles.filterTabs}>
        {[
          { key: "all", label: `All (${bookings.length})` },
          { key: "pending", label: `Pending (${counts.pending || 0})` },
          { key: "confirmed", label: `Confirmed (${counts.confirmed || 0})` },
          { key: "completed", label: `Completed (${counts.completed || 0})` },
          { key: "cancelled", label: `Cancelled (${counts.cancelled || 0})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            style={activeFilter === key ? styles.filterActive : styles.filter}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={styles.empty}>
          <p style={styles.emptyIcon}>🗺</p>
          <h3 style={styles.emptyTitle}>
            {activeFilter === "all"
              ? "No bookings yet"
              : `No ${activeFilter} bookings`}
          </h3>
          <p style={styles.emptyText}>
            {activeFilter === "all"
              ? "Start by exploring our tours and booking your first trip."
              : `You have no ${activeFilter} bookings right now.`}
          </p>
          {activeFilter === "all" && (
            <button onClick={() => navigate("/tours")} style={styles.emptyBtn}>
              Explore Tours
            </button>
          )}
        </div>
      )}

      {/* Bookings list */}
      <div style={styles.list}>
        {filtered.map((booking) => {
          const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
          const days = daysUntil(booking.travel_date);
          const isPast = days < 0;
          const isCompleted = booking.status === "completed";
          const isConfirmed = booking.status === "confirmed";
          const isPending = booking.status === "pending";
          const isCancelled = booking.status === "cancelled";
          const alreadyReviewed = reviewedTours.has(booking.tour_id);

          return (
            <div
              key={booking.id}
              style={{
                ...styles.card,
                opacity: isCancelled ? 0.65 : 1,
              }}
            >
              {/* Left — tour image */}
              <div style={styles.imgWrapper}>
                <img
                  src={getImageUrl(booking.Tour?.image)}
                  alt={booking.Tour?.title}
                  style={styles.img}
                  onError={(e) => {
                    e.target.src = "/placeholder.jpg";
                  }}
                />
                {/* Status badge over image */}
                <div
                  style={{
                    ...styles.statusBadge,
                    background: status.bg,
                    color: status.color,
                  }}
                >
                  {status.icon} {status.label}
                </div>
              </div>

              {/* Right — booking info */}
              <div style={styles.info}>
                {/* Top row */}
                <div style={styles.infoTop}>
                  <div>
                    <h3 style={styles.tourTitle}>{booking.Tour?.title}</h3>
                    <p style={styles.tourDest}>
                      📍 {booking.Tour?.destination}
                    </p>
                  </div>
                  <span style={styles.bookingId}>#{booking.id}</span>
                </div>

                {/* Meta row */}
                <div style={styles.metaRow}>
                  <span style={styles.meta}>
                    📅 {formatDate(booking.travel_date)}
                  </span>
                  <span style={styles.meta}>
                    👥 {booking.num_people} traveller
                    {booking.num_people > 1 ? "s" : ""}
                  </span>
                  <span style={styles.meta}>
                    🕐 {booking.Tour?.duration_days} days
                  </span>
                </div>

                {/* Countdown for confirmed upcoming trips */}
                {isConfirmed && !isPast && (
                  <div style={styles.countdown}>
                    <span style={styles.countdownIcon}>✈️</span>
                    <span style={styles.countdownText}>
                      {days === 0
                        ? "Your trip starts today!"
                        : `${days} day${days !== 1 ? "s" : ""} until your trip`}
                    </span>
                  </div>
                )}

                {/* Completed trip message */}
                {isCompleted && (
                  <div style={styles.completedBanner}>
                    <span>🎉 You completed this trip!</span>
                    {!alreadyReviewed && (
                      <span style={styles.reviewPrompt}>
                        Share your experience with other travellers
                      </span>
                    )}
                  </div>
                )}

                {/* Footer — price + actions */}
                <div style={styles.cardFooter}>
                  <span style={styles.totalPrice}>
                    {formatPrice(booking.total_price)}
                  </span>

                  <div style={styles.actions}>
                    {/* PENDING — cancel */}
                    {isPending && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        style={styles.cancelBtn}
                      >
                        Cancel Booking
                      </button>
                    )}

                    {/* CONFIRMED — invoice + pay if not paid */}
                    {isConfirmed && (
                      <button
                        onClick={() => handleDownloadInvoice(booking.id)}
                        style={styles.invoiceBtn}
                      >
                        📄 Invoice
                      </button>
                    )}

                    {/* COMPLETED — review button */}
                    {isCompleted && !alreadyReviewed && (
                      <button
                        onClick={() => setReviewBooking(booking)}
                        style={styles.reviewBtn}
                      >
                        ⭐ Write a Review
                      </button>
                    )}

                    {/* COMPLETED + already reviewed */}
                    {isCompleted && alreadyReviewed && (
                      <span style={styles.reviewedBadge}>
                        ✅ Review submitted
                      </span>
                    )}

                    {/* View tour detail */}
                    <button
                      onClick={() => navigate(`/tours/${booking.tour_id}`)}
                      style={styles.viewBtn}
                    >
                      View Tour
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Review modal */}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmitted={() => handleReviewSubmitted(reviewBooking.tour_id)}
        />
      )}
    </div>
  );
};

const styles = {
  page: { maxWidth: "960px", margin: "0 auto", padding: "40px 20px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },
  heading: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "4px",
  },
  sub: { color: "#6b7280", fontSize: "14px" },
  explorBtn: {
    background: "#e94560",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  filterTabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  filter: {
    padding: "8px 16px",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    background: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: "500",
  },
  filterActive: {
    padding: "8px 16px",
    border: "1px solid #e94560",
    borderRadius: "20px",
    background: "#fff5f6",
    cursor: "pointer",
    fontSize: "13px",
    color: "#e94560",
    fontWeight: "700",
  },
  empty: {
    textAlign: "center",
    padding: "80px 20px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  emptyIcon: { fontSize: "56px", marginBottom: "12px" },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "8px",
  },
  emptyText: { color: "#9ca3af", marginBottom: "20px", fontSize: "15px" },
  emptyBtn: {
    background: "#e94560",
    color: "#fff",
    border: "none",
    padding: "12px 28px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
  },
  list: { display: "flex", flexDirection: "column", gap: "16px" },
  card: {
    background: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    display: "flex",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    transition: "box-shadow 0.2s",
  },
  imgWrapper: { position: "relative", width: "200px", flexShrink: 0 },
  img: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  statusBadge: {
    position: "absolute",
    top: "10px",
    left: "10px",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    backdropFilter: "blur(4px)",
  },
  info: {
    flex: 1,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  infoTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  tourTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "4px",
  },
  tourDest: { fontSize: "13px", color: "#6b7280" },
  bookingId: {
    fontSize: "12px",
    color: "#9ca3af",
    background: "#f3f4f6",
    padding: "3px 8px",
    borderRadius: "6px",
    flexShrink: 0,
  },
  metaRow: { display: "flex", gap: "16px", flexWrap: "wrap" },
  meta: { fontSize: "13px", color: "#6b7280" },
  countdown: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: "8px 12px",
  },
  countdownIcon: { fontSize: "16px" },
  countdownText: { fontSize: "13px", fontWeight: "600", color: "#1d4ed8" },
  completedBanner: {
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    borderRadius: "8px",
    padding: "10px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  reviewPrompt: { fontSize: "12px", color: "#6b7280" },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: "12px",
    borderTop: "1px solid #f3f4f6",
  },
  totalPrice: { fontSize: "20px", fontWeight: "800", color: "#e94560" },
  actions: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  cancelBtn: {
    padding: "7px 14px",
    background: "transparent",
    border: "1px solid #e94560",
    color: "#e94560",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  invoiceBtn: {
    padding: "7px 14px",
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  reviewBtn: {
    padding: "7px 16px",
    background: "#f59e0b",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  reviewedBadge: { fontSize: "13px", color: "#059669", fontWeight: "500" },
  viewBtn: {
    padding: "7px 14px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    color: "#374151",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
};

export default MyBookingsPage;
