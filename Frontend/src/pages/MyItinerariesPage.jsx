import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyItineraries,
  deleteItinerary,
} from "../store/slices/itinerarySlice";
import { toast } from "react-toastify";
import Loader from "../components/common/Loader";

const travelStyleColors = {
  budget: { bg: "#f0fdf4", color: "#16a34a" },
  comfort: { bg: "#eff6ff", color: "#1d4ed8" },
  luxury: { bg: "#faf5ff", color: "#7c3aed" },
};

const MyItinerariesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { itineraries, loading } = useSelector((s) => s.itineraries);

  useEffect(() => {
    dispatch(fetchMyItineraries());
  }, [dispatch]);

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete "${title}"?`)) {
      dispatch(deleteItinerary(id))
        .unwrap()
        .then(() => toast.success("Itinerary deleted"));
    }
  };

  if (loading) return <Loader message="Loading your itineraries..." />;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>My Itineraries</h1>
          <p style={styles.sub}>
            {itineraries.length} saved trip{itineraries.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link to="/trip-planner" style={styles.newBtn}>
          ✨ Plan New Trip
        </Link>
      </div>

      {itineraries.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyIcon}>🗺</p>
          <h3 style={styles.emptyTitle}>No itineraries yet</h3>
          <p style={styles.emptyText}>
            Let our AI plan your perfect trip in seconds.
          </p>
          <Link to="/trip-planner" style={styles.emptyBtn}>
            ✨ Plan Your First Trip
          </Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {itineraries.map((itin) => {
            const styleColor =
              travelStyleColors[itin.travel_style] || travelStyleColors.comfort;
            const budgetPct = Math.min(
              (itin.total_estimated_cost / itin.budget) * 100,
              100,
            );
            const overBudget = itin.total_estimated_cost > itin.budget;

            return (
              <div key={itin.id} style={styles.card}>
                {/* Card header */}
                <div style={styles.cardHeader}>
                  <div style={styles.cardHeaderLeft}>
                    <span
                      style={{
                        ...styles.styleBadge,
                        background: styleColor.bg,
                        color: styleColor.color,
                      }}
                    >
                      🎒 {itin.travel_style}
                    </span>
                    {itin.ai_generated && (
                      <span style={styles.aiBadge}>✨ AI</span>
                    )}
                  </div>
                </div>

                {/* Card body */}
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{itin.title}</h3>
                  <p style={styles.cardDest}>📍 {itin.destination}</p>

                  <div style={styles.cardMeta}>
                    <span style={styles.metaItem}>🗓 {itin.days} days</span>
                    <span style={styles.metaItem}>👥 {itin.travelers}</span>
                  </div>

                  {/* Budget bar */}
                  <div style={styles.budgetSection}>
                    <div style={styles.budgetRow}>
                      <span style={styles.budgetLabel}>Budget</span>
                      <span
                        style={{
                          ...styles.budgetValue,
                          color: overBudget ? "#ef4444" : "#10b981",
                        }}
                      >
                        ₹
                        {Number(itin.total_estimated_cost).toLocaleString(
                          "en-IN",
                        )}{" "}
                        / ₹{Number(itin.budget).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div style={styles.progressTrack}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${budgetPct}%`,
                          background: overBudget ? "#ef4444" : "#10b981",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card footer */}
                <div style={styles.cardFooter}>
                  <span style={styles.cardDate}>
                    {new Date(itin.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <div style={styles.cardActions}>
                    <button
                      onClick={() => handleDelete(itin.id, itin.title)}
                      style={styles.deleteBtn}
                    >
                      🗑
                    </button>
                    <button
                      onClick={() => navigate(`/itineraries/${itin.id}`)}
                      style={styles.viewBtn}
                    >
                      View Plan →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  heading: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "4px",
  },
  sub: { color: "#6b7280", fontSize: "14px" },
  newBtn: {
    background: "#e94560",
    color: "#fff",
    padding: "12px 22px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
  },
  empty: { textAlign: "center", padding: "80px 20px" },
  emptyIcon: { fontSize: "64px", marginBottom: "16px" },
  emptyTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "8px",
  },
  emptyText: { color: "#9ca3af", marginBottom: "24px" },
  emptyBtn: {
    display: "inline-block",
    background: "#e94560",
    color: "#fff",
    padding: "12px 28px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "600",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    padding: "14px 18px 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeaderLeft: { display: "flex", gap: "8px", alignItems: "center" },
  styleBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  aiBadge: {
    background: "#faf5ff",
    color: "#7c3aed",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  cardBody: { padding: "14px 18px", flex: 1 },
  cardTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "6px",
  },
  cardDest: { fontSize: "14px", color: "#6b7280", marginBottom: "10px" },
  cardMeta: { display: "flex", gap: "16px", marginBottom: "14px" },
  metaItem: { fontSize: "13px", color: "#6b7280" },
  budgetSection: { marginTop: "4px" },
  budgetRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "6px",
  },
  budgetLabel: { fontSize: "12px", color: "#9ca3af" },
  budgetValue: { fontSize: "12px", fontWeight: "600" },
  progressTrack: {
    height: "6px",
    background: "#e5e7eb",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.5s ease",
  },
  cardFooter: {
    padding: "14px 18px",
    borderTop: "1px solid #f3f4f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardDate: { fontSize: "12px", color: "#9ca3af" },
  cardActions: { display: "flex", gap: "8px", alignItems: "center" },
  deleteBtn: {
    background: "#fef2f2",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  viewBtn: {
    background: "#e94560",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
};

export default MyItinerariesPage;
