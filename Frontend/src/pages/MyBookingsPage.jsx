import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyBookings, cancelBooking } from "../store/slices/bookingSlice";
import { toast } from "react-toastify";
import Loader from "../components/common/Loader";
import {
  formatPrice,
  formatDate,
  getImageUrl,
  getStatusColor,
} from "../utils/helpers";

const MyBookingsPage = () => {
  const dispatch = useDispatch();
  const { bookings, loading } = useSelector((s) => s.bookings);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const handleCancel = (id) => {
    if (window.confirm("Cancel this booking?")) {
      dispatch(cancelBooking(id)).then(() =>
        toast.success("Booking cancelled"),
      );
    }
  };

  if (loading) return <Loader message="Loading your bookings..." />;

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>My Bookings</h1>

      {bookings.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyText}>You have no bookings yet.</p>
          <a href="/tours" style={styles.exploreBtn}>
            Explore Tours
          </a>
        </div>
      ) : (
        <div style={styles.list}>
          {bookings.map((booking) => (
            <div key={booking.id} style={styles.card}>
              {/* Tour image */}
              <img
                src={getImageUrl(booking.Tour?.image)}
                alt={booking.Tour?.title}
                style={styles.img}
                onError={(e) => {
                  e.target.src = "/placeholder.jpg";
                }}
              />

              {/* Booking info */}
              <div style={styles.info}>
                <div style={styles.infoTop}>
                  <h3 style={styles.tourTitle}>{booking.Tour?.title}</h3>
                  <span
                    style={{
                      ...styles.statusBadge,
                      background: getStatusColor(booking.status) + "22",
                      color: getStatusColor(booking.status),
                    }}
                  >
                    {booking.status}
                  </span>
                </div>

                <p style={styles.destination}>📍 {booking.Tour?.destination}</p>

                <div style={styles.metaRow}>
                  <span style={styles.meta}>
                    📅 Travel date: {formatDate(booking.travel_date)}
                  </span>
                  <span style={styles.meta}>
                    👥 {booking.num_people} person
                    {booking.num_people > 1 ? "s" : ""}
                  </span>
                  <span style={styles.meta}>
                    🕐 {booking.Tour?.duration_days} days
                  </span>
                </div>

                <div style={styles.cardFooter}>
                  <span style={styles.totalPrice}>
                    {formatPrice(booking.total_price)}
                  </span>

                  {booking.status === "pending" && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      style={styles.cancelBtn}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { maxWidth: "900px", margin: "0 auto", padding: "40px 20px" },
  heading: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "28px",
  },
  empty: { textAlign: "center", padding: "80px 20px" },
  emptyText: { color: "#9ca3af", fontSize: "18px", marginBottom: "20px" },
  exploreBtn: {
    background: "#e94560",
    color: "#fff",
    padding: "12px 28px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "600",
  },
  list: { display: "flex", flexDirection: "column", gap: "16px" },
  card: {
    background: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    display: "flex",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  img: { width: "180px", height: "160px", objectFit: "cover", flexShrink: 0 },
  info: {
    flex: 1,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  infoTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  tourTitle: { fontSize: "18px", fontWeight: "700", color: "#111827" },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
    flexShrink: 0,
  },
  destination: { fontSize: "14px", color: "#6b7280" },
  metaRow: { display: "flex", gap: "20px", flexWrap: "wrap" },
  meta: { fontSize: "13px", color: "#6b7280" },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: "12px",
    borderTop: "1px solid #f3f4f6",
  },
  totalPrice: { fontSize: "20px", fontWeight: "800", color: "#e94560" },
  cancelBtn: {
    padding: "8px 18px",
    background: "transparent",
    border: "1px solid #e94560",
    color: "#e94560",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
};

export default MyBookingsPage;
