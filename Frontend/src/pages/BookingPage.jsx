import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTourById } from "../store/slices/tourSlice";
import { createBooking, clearBookingState } from "../store/slices/bookingSlice";
import { toast } from "react-toastify";
import { formatPrice, getImageUrl } from "../utils/helpers";
import Loader from "../components/common/Loader";

const BookingPage = () => {
  const { tourId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { tour, loading: tourLoading } = useSelector((s) => s.tours);
  const { loading, error, success, booking } = useSelector((s) => s.bookings);

  const [form, setForm] = useState({
    travel_date: "",
    num_people: 1,
    special_requests: "",
  });

  useEffect(() => {
    dispatch(fetchTourById(tourId));
  }, [tourId, dispatch]);

  // on success — show toast and redirect to my bookings
  useEffect(() => {
    if (success && booking) {
      toast.success("Booking created successfully!");
      dispatch(clearBookingState());
      navigate("/my-bookings");
    }
  }, [success, booking, dispatch, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearBookingState());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.travel_date) {
      toast.error("Please select a travel date");
      return;
    }
    dispatch(
      createBooking({
        tour_id: parseInt(tourId),
        travel_date: form.travel_date,
        num_people: parseInt(form.num_people),
        special_requests: form.special_requests,
      }),
    );
  };

  if (tourLoading) return <Loader />;
  if (!tour) return <div style={styles.notFound}>Tour not found.</div>;

  const totalPrice = tour.price * form.num_people;

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Complete your booking</h1>

      <div style={styles.layout}>
        {/* Booking form */}
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Trip details</h2>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Travel Date</label>
              <input
                type="date"
                name="travel_date"
                value={form.travel_date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Number of People</label>
              <input
                type="number"
                name="num_people"
                value={form.num_people}
                onChange={handleChange}
                min={1}
                max={tour.max_group_size}
                style={styles.input}
              />
              <span style={styles.hint}>
                Max {tour.max_group_size} people per booking
              </span>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Special Requests (optional)</label>
              <textarea
                name="special_requests"
                value={form.special_requests}
                onChange={handleChange}
                rows={3}
                placeholder="Vegetarian meals, wheelchair access, etc."
                style={styles.textarea}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={loading ? styles.btnDisabled : styles.btn}
            >
              {loading ? "Confirming..." : "Confirm Booking"}
            </button>
          </form>
        </div>

        {/* Summary card */}
        <div style={styles.summaryCard}>
          <img
            src={getImageUrl(tour.image)}
            alt={tour.title}
            style={styles.summaryImg}
            onError={(e) => {
              e.target.src = "/placeholder.jpg";
            }}
          />
          <div style={styles.summaryBody}>
            <h3 style={styles.summaryTitle}>{tour.title}</h3>
            <p style={styles.summaryDestination}>📍 {tour.destination}</p>
            <p style={styles.summaryDuration}>🕐 {tour.duration_days} days</p>

            <div style={styles.divider} />

            <div style={styles.priceRow}>
              <span style={styles.priceLabel}>
                {formatPrice(tour.price)} × {form.num_people} person
                {form.num_people > 1 ? "s" : ""}
              </span>
            </div>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total</span>
              <span style={styles.totalPrice}>{formatPrice(totalPrice)}</span>
            </div>

            <p style={styles.note}>✅ Free cancellation before travel date</p>
          </div>
        </div>
      </div>
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
  notFound: { textAlign: "center", padding: "80px", color: "#6b7280" },
  layout: { display: "flex", gap: "28px", alignItems: "flex-start" },
  formCard: {
    flex: 1,
    background: "#fff",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "22px",
  },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "14px", fontWeight: "500", color: "#374151" },
  input: {
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    outline: "none",
  },
  textarea: {
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    outline: "none",
    resize: "vertical",
  },
  hint: { fontSize: "12px", color: "#9ca3af" },
  btn: {
    padding: "14px",
    background: "#e94560",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
  },
  btnDisabled: {
    padding: "14px",
    background: "#f9a8b4",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "not-allowed",
  },
  summaryCard: {
    width: "300px",
    flexShrink: 0,
    background: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
  },
  summaryImg: { width: "100%", height: "180px", objectFit: "cover" },
  summaryBody: { padding: "20px" },
  summaryTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "6px",
  },
  summaryDestination: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "4px",
  },
  summaryDuration: { fontSize: "13px", color: "#6b7280" },
  divider: { borderTop: "1px solid #f3f4f6", margin: "16px 0" },
  priceRow: { marginBottom: "10px" },
  priceLabel: { fontSize: "14px", color: "#6b7280" },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  totalLabel: { fontSize: "16px", fontWeight: "700", color: "#111827" },
  totalPrice: { fontSize: "22px", fontWeight: "800", color: "#e94560" },
  note: {
    fontSize: "12px",
    color: "#10b981",
    background: "#ecfdf5",
    padding: "8px 12px",
    borderRadius: "8px",
  },
};

export default BookingPage;
