import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTourById } from "../store/slices/tourSlice";
import { createBooking, clearBookingState } from "../store/slices/bookingSlice";
import { toast } from "react-toastify";
import { formatPrice, getImageUrl } from "../utils/helpers";
import Loader from "../components/common/Loader";
import api from "../services/api";

const BookingPage = () => {
  const { tourId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { tour, loading: tourLoading } = useSelector((s) => s.tours);
  const { loading, error, success, booking } = useSelector((s) => s.bookings);
  const { user } = useSelector((s) => s.auth);

  // step 1 = fill form, step 2 = pay
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    travel_date: "",
    num_people: 1,
    special_requests: "",
  });

  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchTourById(tourId));
  }, [tourId, dispatch]);

  // when booking is created — move to payment step
  useEffect(() => {
    if (success && booking) {
      setStep(2);
    }
  }, [success, booking]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearBookingState());
    }
  }, [error, dispatch]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Step 1 — create the booking
  const handleBookingSubmit = (e) => {
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

  // Step 2 — initiate Razorpay payment
  const handlePayment = async () => {
    setPayLoading(true);
    try {
      // 1. create Razorpay order from backend
      const { data } = await api.post("/payments/create-order", {
        booking_id: booking.id,
      });

      // 2. configure Razorpay checkout
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "Voyage Tours",
        description: tour.title,
        order_id: data.order_id,
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#e94560" },

        // 3. on payment success — verify with backend
        handler: async (response) => {
          try {
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: booking.id,
            });

            toast.success("Payment successful! Booking confirmed.");
            dispatch(clearBookingState());
            navigate("/my-bookings");
          } catch (err) {
            toast.error("Payment verification failed. Contact support.");
          }
        },

        // 4. on modal close without paying
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled. Your booking is still pending.");
            setPayLoading(false);
          },
        },
      };

      // 5. open Razorpay checkout modal
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate payment");
    } finally {
      setPayLoading(false);
    }
  };

  if (tourLoading) return <Loader />;
  if (!tour) return <div style={styles.notFound}>Tour not found.</div>;

  const totalPrice = tour.price * form.num_people;

  return (
    <div style={styles.page}>
      {/* Progress bar */}
      <div style={styles.progressBar}>
        {["Trip Details", "Payment", "Confirmation"].map((label, i) => (
          <div key={label} style={styles.progressStep}>
            <div
              style={{
                ...styles.progressCircle,
                background:
                  step > i ? "#e94560" : step === i + 1 ? "#e94560" : "#e5e7eb",
                color: step >= i + 1 ? "#fff" : "#9ca3af",
              }}
            >
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span
              style={{
                ...styles.progressLabel,
                color: step >= i + 1 ? "#e94560" : "#9ca3af",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <div style={styles.layout}>
        {/* Left — form or payment */}
        <div style={styles.formCard}>
          {/* STEP 1 — booking form */}
          {step === 1 && (
            <>
              <h2 style={styles.formTitle}>Trip Details</h2>
              <form onSubmit={handleBookingSubmit} style={styles.form}>
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
                    Max {tour.max_group_size} people
                  </span>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>
                    Special Requests (optional)
                  </label>
                  <textarea
                    name="special_requests"
                    value={form.special_requests}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Vegetarian meals, wheelchair access..."
                    style={styles.textarea}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={loading ? styles.btnDisabled : styles.btn}
                >
                  {loading ? "Saving..." : "Continue to Payment →"}
                </button>
              </form>
            </>
          )}

          {/* STEP 2 — payment */}
          {step === 2 && booking && (
            <>
              <h2 style={styles.formTitle}>Complete Payment</h2>

              <div style={styles.bookingConfirmBox}>
                <p style={styles.bookingConfirmLabel}>Booking created</p>
                <p style={styles.bookingId}>Booking #{booking.id}</p>
                <p style={styles.bookingStatus}>Status: Pending payment</p>
              </div>

              <div style={styles.paymentInfo}>
                <div style={styles.paymentRow}>
                  <span>Tour</span>
                  <span>{booking.Tour?.title || tour.title}</span>
                </div>
                <div style={styles.paymentRow}>
                  <span>People</span>
                  <span>{booking.num_people}</span>
                </div>
                <div style={styles.paymentRow}>
                  <span>Travel date</span>
                  <span>
                    {new Date(booking.travel_date).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <div style={styles.divider} />
                <div style={{ ...styles.paymentRow, ...styles.paymentTotal }}>
                  <span>Total Amount</span>
                  <span style={{ color: "#e94560" }}>
                    {formatPrice(booking.total_price)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={payLoading}
                style={payLoading ? styles.btnDisabled : styles.btn}
              >
                {payLoading
                  ? "Opening payment..."
                  : `Pay ${formatPrice(booking.total_price)}`}
              </button>

              <p style={styles.secureNote}>
                🔒 Secured by Razorpay. Supports UPI, cards, netbanking.
              </p>

              <button
                onClick={() => navigate("/my-bookings")}
                style={styles.laterBtn}
              >
                Pay later from My Bookings
              </button>
            </>
          )}
        </div>

        {/* Right — summary card */}
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
            <p style={styles.summaryMeta}>📍 {tour.destination}</p>
            <p style={styles.summaryMeta}>🕐 {tour.duration_days} days</p>
            <div style={styles.divider} />
            <div style={styles.priceRow}>
              <span style={styles.priceLabel}>
                {formatPrice(tour.price)} × {form.num_people}
              </span>
            </div>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total</span>
              <span style={styles.totalPrice}>{formatPrice(totalPrice)}</span>
            </div>
            <p style={styles.freeCancel}>
              ✅ Free cancellation before travel date
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { maxWidth: "900px", margin: "0 auto", padding: "40px 20px" },
  notFound: { textAlign: "center", padding: "80px", color: "#6b7280" },
  progressBar: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "40px",
    marginBottom: "40px",
  },
  progressStep: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  progressCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "700",
    transition: "all 0.3s",
  },
  progressLabel: {
    fontSize: "12px",
    fontWeight: "500",
    transition: "color 0.3s",
  },
  layout: { display: "flex", gap: "28px", alignItems: "flex-start" },
  formCard: {
    flex: 1,
    background: "#fff",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
  },
  formTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "24px",
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
    width: "100%",
  },
  btnDisabled: {
    padding: "14px",
    background: "#f9a8b4",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "not-allowed",
    width: "100%",
  },
  bookingConfirmBox: {
    background: "#f0fdf4",
    border: "1px solid #86efac",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "20px",
  },
  bookingConfirmLabel: {
    fontSize: "12px",
    color: "#16a34a",
    fontWeight: "600",
    marginBottom: "4px",
  },
  bookingId: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "2px",
  },
  bookingStatus: { fontSize: "13px", color: "#6b7280" },
  paymentInfo: {
    background: "#f9fafb",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "20px",
  },
  paymentRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    color: "#4b5563",
    marginBottom: "10px",
  },
  paymentTotal: { fontWeight: "700", fontSize: "16px", color: "#111827" },
  divider: { borderTop: "1px solid #e5e7eb", margin: "14px 0" },
  secureNote: {
    textAlign: "center",
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "12px",
  },
  laterBtn: {
    width: "100%",
    padding: "12px",
    background: "transparent",
    border: "1px solid #d1d5db",
    color: "#6b7280",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    marginTop: "12px",
  },
  summaryCard: {
    width: "280px",
    flexShrink: 0,
    background: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
  },
  summaryImg: { width: "100%", height: "180px", objectFit: "cover" },
  summaryBody: { padding: "20px" },
  summaryTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "6px",
  },
  summaryMeta: { fontSize: "13px", color: "#6b7280", marginBottom: "4px" },
  priceRow: { marginBottom: "8px" },
  priceLabel: { fontSize: "14px", color: "#6b7280" },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  totalLabel: { fontSize: "16px", fontWeight: "700", color: "#111827" },
  totalPrice: { fontSize: "20px", fontWeight: "800", color: "#e94560" },
  freeCancel: {
    fontSize: "12px",
    color: "#10b981",
    background: "#ecfdf5",
    padding: "8px 12px",
    borderRadius: "8px",
  },
};

export default BookingPage;
