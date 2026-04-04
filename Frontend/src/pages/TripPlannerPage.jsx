import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  generateItinerary,
  clearItineraryState,
} from "../store/slices/itinerarySlice";
import { toast } from "react-toastify";

const INTERESTS = [
  { value: "culture", label: "🏛 Culture" },
  { value: "food", label: "🍜 Food" },
  { value: "adventure", label: "🧗 Adventure" },
  { value: "nature", label: "🌿 Nature" },
  { value: "beaches", label: "🏖 Beaches" },
  { value: "shopping", label: "🛍 Shopping" },
  { value: "nightlife", label: "🎶 Nightlife" },
  { value: "history", label: "📜 History" },
  { value: "photography", label: "📸 Photography" },
  { value: "spiritual", label: "🛕 Spiritual" },
  { value: "wildlife", label: "🐘 Wildlife" },
  { value: "wellness", label: "🧘 Wellness" },
];

const TripPlannerPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { generating, error, success, itinerary } = useSelector(
    (s) => s.itineraries,
  );

  const [form, setForm] = useState({
    destination: "",
    days: 3,
    budget: "",
    travelers: 1,
    travel_style: "comfort",
    interests: [],
  });

  // navigate to detail page after generation
  useEffect(() => {
    if (success && itinerary) {
      toast.success("Itinerary generated successfully!");
      dispatch(clearItineraryState());
      navigate(`/itineraries/${itinerary.id}`);
    }
  }, [success, itinerary, dispatch, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearItineraryState());
    }
  }, [error, dispatch]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleInterest = (value) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(value)
        ? prev.interests.filter((i) => i !== value)
        : [...prev.interests, value],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.destination.trim()) {
      toast.error("Please enter a destination");
      return;
    }
    if (!form.budget || form.budget <= 0) {
      toast.error("Please enter a valid budget");
      return;
    }
    if (form.interests.length === 0) {
      toast.error("Please select at least one interest");
      return;
    }
    dispatch(
      generateItinerary({
        ...form,
        days: parseInt(form.days),
        budget: parseFloat(form.budget),
        travelers: parseInt(form.travelers),
      }),
    );
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.heading}>✨ AI Trip Planner</h1>
        <p style={styles.sub}>
          Tell us about your dream trip and our AI will build a complete
          day-wise itinerary in seconds.
        </p>
      </div>

      <div style={styles.layout}>
        {/* Form */}
        <div style={styles.formCard}>
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Destination */}
            <div style={styles.field}>
              <label style={styles.label}>📍 Where do you want to go?</label>
              <input
                name="destination"
                value={form.destination}
                onChange={handleChange}
                placeholder="e.g. Goa, Kerala, Manali, Rajasthan"
                style={styles.input}
              />
            </div>

            {/* Days + Travelers row */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>🗓 Number of days</label>
                <input
                  name="days"
                  type="number"
                  value={form.days}
                  onChange={handleChange}
                  min={1}
                  max={14}
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>👥 Travelers</label>
                <input
                  name="travelers"
                  type="number"
                  value={form.travelers}
                  onChange={handleChange}
                  min={1}
                  max={20}
                  style={styles.input}
                />
              </div>
            </div>

            {/* Budget */}
            <div style={styles.field}>
              <label style={styles.label}>💰 Total budget (₹ INR)</label>
              <input
                name="budget"
                type="number"
                value={form.budget}
                onChange={handleChange}
                placeholder="e.g. 30000"
                style={styles.input}
              />
              {form.budget && form.travelers > 1 && (
                <span style={styles.hint}>
                  ≈ ₹
                  {Math.round(form.budget / form.travelers).toLocaleString(
                    "en-IN",
                  )}{" "}
                  per person
                </span>
              )}
            </div>

            {/* Travel style */}
            <div style={styles.field}>
              <label style={styles.label}>🎒 Travel style</label>
              <div style={styles.styleGrid}>
                {[
                  {
                    value: "budget",
                    label: "🎒 Budget",
                    desc: "Hostels, local food",
                  },
                  {
                    value: "comfort",
                    label: "🏨 Comfort",
                    desc: "3-4 star, good food",
                  },
                  {
                    value: "luxury",
                    label: "✨ Luxury",
                    desc: "5 star, fine dining",
                  },
                ].map(({ value, label, desc }) => (
                  <div
                    key={value}
                    onClick={() => setForm({ ...form, travel_style: value })}
                    style={{
                      ...styles.styleCard,
                      ...(form.travel_style === value
                        ? styles.styleCardActive
                        : {}),
                    }}
                  >
                    <span style={styles.styleLabel}>{label}</span>
                    <span style={styles.styleDesc}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div style={styles.field}>
              <label style={styles.label}>
                🎯 Interests{" "}
                <span style={styles.labelNote}>
                  ({form.interests.length} selected)
                </span>
              </label>
              <div style={styles.interestsGrid}>
                {INTERESTS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleInterest(value)}
                    style={{
                      ...styles.interestBtn,
                      ...(form.interests.includes(value)
                        ? styles.interestBtnActive
                        : {}),
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              style={generating ? styles.btnGenerating : styles.btn}
            >
              {generating
                ? "🤖 AI is generating your itinerary..."
                : "✨ Generate My Itinerary"}
            </button>
          </form>
        </div>

        {/* Info sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>How it works</h3>
            {[
              { icon: "📝", text: "Fill in your trip details and interests" },
              {
                icon: "🤖",
                text: "Our AI creates a personalized day-by-day plan",
              },
              {
                icon: "✏️",
                text: "Edit any activity, time, or cost to customize",
              },
              { icon: "💾", text: "Save your itinerary and access it anytime" },
            ].map(({ icon, text }) => (
              <div key={text} style={styles.infoStep}>
                <span style={styles.infoIcon}>{icon}</span>
                <span style={styles.infoText}>{text}</span>
              </div>
            ))}
          </div>

          <div style={styles.tipsCard}>
            <h3 style={styles.infoTitle}>💡 Tips for better results</h3>
            <ul style={styles.tipsList}>
              <li style={styles.tip}>
                Be specific — "Goa beaches" beats just "Goa"
              </li>
              <li style={styles.tip}>
                Select multiple interests for a varied plan
              </li>
              <li style={styles.tip}>
                Set a realistic budget for your travel style
              </li>
              <li style={styles.tip}>
                You can edit any activity after generation
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {generating && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingCard}>
            <div style={styles.spinner} />
            <h3 style={styles.loadingTitle}>Creating your itinerary...</h3>
            <p style={styles.loadingText}>
              Our AI is planning the perfect trip to{" "}
              <strong>{form.destination}</strong> for {form.days} days.
            </p>
            <p style={styles.loadingNote}>This usually takes 10–20 seconds.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" },
  header: { textAlign: "center", marginBottom: "40px" },
  heading: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#111827",
    marginBottom: "10px",
  },
  sub: { color: "#6b7280", fontSize: "16px", lineHeight: "1.6" },
  layout: { display: "flex", gap: "28px", alignItems: "flex-start" },
  formCard: {
    flex: 1,
    background: "#fff",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
  },
  form: { display: "flex", flexDirection: "column", gap: "24px" },
  field: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "15px", fontWeight: "600", color: "#111827" },
  labelNote: { fontSize: "13px", fontWeight: "400", color: "#9ca3af" },
  input: {
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "15px",
    outline: "none",
  },
  hint: { fontSize: "12px", color: "#6b7280" },
  row: { display: "flex", gap: "16px" },
  styleGrid: { display: "flex", gap: "12px" },
  styleCard: {
    flex: 1,
    padding: "14px",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    cursor: "pointer",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  styleCardActive: { border: "2px solid #e94560", background: "#fff5f6" },
  styleLabel: { fontSize: "14px", fontWeight: "600", color: "#111827" },
  styleDesc: { fontSize: "12px", color: "#9ca3af" },
  interestsGrid: { display: "flex", flexWrap: "wrap", gap: "8px" },
  interestBtn: {
    padding: "8px 14px",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    background: "#f9fafb",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
  },
  interestBtnActive: {
    background: "#e94560",
    color: "#fff",
    border: "1px solid #e94560",
  },
  btn: {
    padding: "16px",
    background: "#e94560",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
  },
  btnGenerating: {
    padding: "16px",
    background: "#f9a8b4",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    cursor: "not-allowed",
  },
  sidebar: {
    width: "300px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  infoCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
  },
  infoTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "16px",
  },
  infoStep: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    marginBottom: "14px",
  },
  infoIcon: { fontSize: "22px", flexShrink: 0 },
  infoText: { fontSize: "14px", color: "#4b5563", lineHeight: "1.5" },
  tipsCard: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "16px",
    padding: "24px",
  },
  tipsList: { paddingLeft: "16px", margin: 0 },
  tip: {
    fontSize: "13px",
    color: "#92400e",
    marginBottom: "8px",
    lineHeight: "1.5",
  },
  loadingOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  loadingCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: "48px",
    textAlign: "center",
    maxWidth: "380px",
    width: "90%",
  },
  spinner: {
    width: "52px",
    height: "52px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #e94560",
    borderRadius: "50%",
    margin: "0 auto 24px",
    animation: "spin 0.8s linear infinite",
  },
  loadingTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "10px",
  },
  loadingText: {
    color: "#6b7280",
    fontSize: "15px",
    lineHeight: "1.6",
    marginBottom: "8px",
  },
  loadingNote: { fontSize: "13px", color: "#9ca3af" },
};

export default TripPlannerPage;
