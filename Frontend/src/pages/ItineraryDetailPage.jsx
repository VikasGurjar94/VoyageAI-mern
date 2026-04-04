import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchItinerary,
  updateActivity,
  updateItinerary,
  deleteItinerary,
  clearItinerary,
} from "../store/slices/itinerarySlice";
import { toast } from "react-toastify";
import Loader from "../components/common/Loader";

// category color map
const categoryColors = {
  sightseeing: { bg: "#eff6ff", color: "#1d4ed8" },
  food: { bg: "#fef3c7", color: "#d97706" },
  adventure: { bg: "#f0fdf4", color: "#16a34a" },
  transport: { bg: "#f5f3ff", color: "#7c3aed" },
  accommodation: { bg: "#fce7f3", color: "#be185d" },
  shopping: { bg: "#fff7ed", color: "#c2410c" },
  relaxation: { bg: "#ecfdf5", color: "#059669" },
  culture: { bg: "#fef9c3", color: "#854d0e" },
};

const categoryIcons = {
  sightseeing: "👁",
  food: "🍽",
  adventure: "🧗",
  transport: "🚗",
  accommodation: "🏨",
  shopping: "🛍",
  relaxation: "🧘",
  culture: "🏛",
};

const ItineraryDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { itinerary, loading } = useSelector((s) => s.itineraries);

  const [activeDay, setActiveDay] = useState(0);
  const [editingId, setEditingId] = useState(null); // activity being edited
  const [editForm, setEditForm] = useState({});
  const [savingTitle, setSavingTitle] = useState(false);
  const [titleEdit, setTitleEdit] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  useEffect(() => {
    dispatch(fetchItinerary(id));
    return () => dispatch(clearItinerary());
  }, [id, dispatch]);

  useEffect(() => {
    if (itinerary) setTitleValue(itinerary.title);
  }, [itinerary]);

  if (loading) return <Loader message="Loading your itinerary..." />;
  if (!itinerary)
    return <div style={styles.notFound}>Itinerary not found.</div>;

  const days = itinerary.ItineraryDays || [];
  const currentDay = days[activeDay];

  // start editing an activity
  const startEdit = (activity) => {
    setEditingId(activity.id);
    setEditForm({
      time: activity.time,
      activity: activity.activity,
      description: activity.description || "",
      estimated_cost: activity.estimated_cost,
      location: activity.location || "",
      tips: activity.tips || "",
      category: activity.category,
    });
  };

  // save edited activity
  const saveEdit = async () => {
    await dispatch(
      updateActivity({
        itineraryId: itinerary.id,
        activityId: editingId,
        activityData: editForm,
      }),
    ).unwrap();
    setEditingId(null);
    toast.success("Activity updated");
    // refresh to get updated costs
    dispatch(fetchItinerary(id));
  };

  const cancelEdit = () => setEditingId(null);

  // save itinerary title
  const saveTitle = async () => {
    setSavingTitle(true);
    await dispatch(
      updateItinerary({
        id: itinerary.id,
        data: { title: titleValue },
      }),
    ).unwrap();
    setTitleEdit(false);
    setSavingTitle(false);
    toast.success("Title updated");
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this itinerary? This cannot be undone.")) {
      await dispatch(deleteItinerary(itinerary.id)).unwrap();
      toast.success("Itinerary deleted");
      navigate("/my-itineraries");
    }
  };

  const budgetUsed = itinerary.total_estimated_cost;
  const budgetPct = Math.min((budgetUsed / itinerary.budget) * 100, 100);
  const overBudget = budgetUsed > itinerary.budget;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button
            onClick={() => navigate("/my-itineraries")}
            style={styles.backBtn}
          >
            ← Back
          </button>
          {titleEdit ? (
            <div style={styles.titleEditRow}>
              <input
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                style={styles.titleInput}
              />
              <button
                onClick={saveTitle}
                disabled={savingTitle}
                style={styles.saveTitleBtn}
              >
                {savingTitle ? "..." : "Save"}
              </button>
              <button
                onClick={() => setTitleEdit(false)}
                style={styles.cancelTitleBtn}
              >
                Cancel
              </button>
            </div>
          ) : (
            <h1 style={styles.heading} onClick={() => setTitleEdit(true)}>
              {itinerary.title}
              <span style={styles.editIcon}>✏️</span>
            </h1>
          )}
          <div style={styles.metaTags}>
            <span style={styles.metaTag}>📍 {itinerary.destination}</span>
            <span style={styles.metaTag}>🗓 {itinerary.days} days</span>
            <span style={styles.metaTag}>
              👥 {itinerary.travelers} traveler
              {itinerary.travelers > 1 ? "s" : ""}
            </span>
            <span style={styles.metaTag}>🎒 {itinerary.travel_style}</span>
            <span
              style={{
                ...styles.metaTag,
                background: "#ecfdf5",
                color: "#059669",
              }}
            >
              ✨ AI Generated
            </span>
          </div>
        </div>

        <div style={styles.headerRight}>
          <button onClick={handleDelete} style={styles.deleteBtn}>
            🗑 Delete
          </button>
        </div>
      </div>

      {/* Budget progress bar */}
      <div style={styles.budgetCard}>
        <div style={styles.budgetHeader}>
          <span style={styles.budgetLabel}>Budget Overview</span>
          <span
            style={{
              ...styles.budgetAmount,
              color: overBudget ? "#ef4444" : "#10b981",
            }}
          >
            ₹{Number(budgetUsed).toLocaleString("en-IN")} / ₹
            {Number(itinerary.budget).toLocaleString("en-IN")}
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
        <p style={styles.budgetNote}>
          {overBudget
            ? `⚠️ Over budget by ₹${Number(budgetUsed - itinerary.budget).toLocaleString("en-IN")}`
            : `✅ ₹${Number(itinerary.budget - budgetUsed).toLocaleString("en-IN")} remaining`}
        </p>
      </div>

      <div style={styles.content}>
        {/* Day tabs */}
        <div style={styles.dayTabs}>
          {days.map((day, i) => (
            <button
              key={day.id}
              onClick={() => setActiveDay(i)}
              style={{
                ...styles.dayTab,
                ...(activeDay === i ? styles.dayTabActive : {}),
              }}
            >
              <span style={styles.dayNum}>Day {day.day_number}</span>
              <span style={styles.dayTheme}>{day.theme}</span>
              <span style={styles.dayCost}>
                ₹{Number(day.total_day_cost).toLocaleString("en-IN")}
              </span>
            </button>
          ))}
        </div>

        {/* Activities */}
        {currentDay && (
          <div style={styles.dayContent}>
            <div style={styles.dayHeader}>
              <div>
                <h2 style={styles.dayTitle}>
                  Day {currentDay.day_number} — {currentDay.theme}
                </h2>
                <p style={styles.daySummary}>{currentDay.summary}</p>
              </div>
              <div style={styles.dayCostBadge}>
                <span style={styles.dayCostLabel}>Day budget</span>
                <span style={styles.dayCostValue}>
                  ₹{Number(currentDay.total_day_cost).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div style={styles.timeline}>
              {(currentDay.ItineraryActivities || []).map((activity, index) => (
                <div key={activity.id} style={styles.timelineItem}>
                  {/* Time column */}
                  <div style={styles.timeCol}>
                    <span style={styles.time}>{activity.time}</span>
                    {index < currentDay.ItineraryActivities.length - 1 && (
                      <div style={styles.connector} />
                    )}
                  </div>

                  {/* Activity card */}
                  <div style={styles.activityCard}>
                    {editingId === activity.id ? (
                      // ── EDIT MODE ──────────────────────────
                      <div style={styles.editForm}>
                        <div style={styles.editRow}>
                          <div style={styles.editField}>
                            <label style={styles.editLabel}>Time</label>
                            <input
                              value={editForm.time}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  time: e.target.value,
                                })
                              }
                              style={styles.editInput}
                              placeholder="09:00 AM"
                            />
                          </div>
                          <div style={styles.editField}>
                            <label style={styles.editLabel}>Category</label>
                            <select
                              value={editForm.category}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  category: e.target.value,
                                })
                              }
                              style={styles.editInput}
                            >
                              {Object.keys(categoryColors).map((c) => (
                                <option key={c} value={c}>
                                  {categoryIcons[c]} {c}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div style={styles.editField}>
                            <label style={styles.editLabel}>Cost (₹)</label>
                            <input
                              type="number"
                              value={editForm.estimated_cost}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  estimated_cost: e.target.value,
                                })
                              }
                              style={styles.editInput}
                            />
                          </div>
                        </div>
                        <div style={styles.editField}>
                          <label style={styles.editLabel}>Activity name</label>
                          <input
                            value={editForm.activity}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                activity: e.target.value,
                              })
                            }
                            style={styles.editInput}
                          />
                        </div>
                        <div style={styles.editField}>
                          <label style={styles.editLabel}>Description</label>
                          <textarea
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                description: e.target.value,
                              })
                            }
                            rows={2}
                            style={styles.editTextarea}
                          />
                        </div>
                        <div style={styles.editRow}>
                          <div style={styles.editField}>
                            <label style={styles.editLabel}>Location</label>
                            <input
                              value={editForm.location}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  location: e.target.value,
                                })
                              }
                              style={styles.editInput}
                              placeholder="Place name"
                            />
                          </div>
                        </div>
                        <div style={styles.editField}>
                          <label style={styles.editLabel}>Tips</label>
                          <input
                            value={editForm.tips}
                            onChange={(e) =>
                              setEditForm({ ...editForm, tips: e.target.value })
                            }
                            style={styles.editInput}
                            placeholder="Practical tip..."
                          />
                        </div>
                        <div style={styles.editActions}>
                          <button onClick={saveEdit} style={styles.saveEditBtn}>
                            ✓ Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            style={styles.cancelEditBtn}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // ── VIEW MODE ──────────────────────────
                      <>
                        <div style={styles.activityTop}>
                          <div style={styles.activityLeft}>
                            <span
                              style={{
                                ...styles.categoryBadge,
                                background:
                                  categoryColors[activity.category]?.bg ||
                                  "#f3f4f6",
                                color:
                                  categoryColors[activity.category]?.color ||
                                  "#374151",
                              }}
                            >
                              {categoryIcons[activity.category]}{" "}
                              {activity.category}
                            </span>
                            <h3 style={styles.activityName}>
                              {activity.activity}
                            </h3>
                            {activity.location && (
                              <p style={styles.activityLocation}>
                                📍 {activity.location}
                              </p>
                            )}
                          </div>
                          <div style={styles.activityRight}>
                            <span style={styles.activityCost}>
                              ₹
                              {Number(activity.estimated_cost).toLocaleString(
                                "en-IN",
                              )}
                            </span>
                            {activity.duration_minutes && (
                              <span style={styles.activityDur}>
                                ⏱ {activity.duration_minutes}min
                              </span>
                            )}
                            <button
                              onClick={() => startEdit(activity)}
                              style={styles.editBtn}
                            >
                              ✏️ Edit
                            </button>
                          </div>
                        </div>
                        {activity.description && (
                          <p style={styles.activityDesc}>
                            {activity.description}
                          </p>
                        )}
                        {activity.tips && (
                          <div style={styles.tipBox}>
                            <span style={styles.tipIcon}>💡</span>
                            <span style={styles.tipText}>{activity.tips}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" },
  notFound: { textAlign: "center", padding: "80px", color: "#6b7280" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  headerLeft: { flex: 1 },
  headerRight: { display: "flex", gap: "10px" },
  backBtn: {
    background: "none",
    border: "1px solid #e5e7eb",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    marginBottom: "12px",
    color: "#374151",
  },
  heading: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#111827",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
  },
  editIcon: { fontSize: "18px", opacity: 0.4 },
  titleEditRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginBottom: "10px",
  },
  titleInput: {
    fontSize: "22px",
    fontWeight: "700",
    padding: "8px 12px",
    border: "2px solid #e94560",
    borderRadius: "8px",
    outline: "none",
    flex: 1,
  },
  saveTitleBtn: {
    background: "#e94560",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  cancelTitleBtn: {
    background: "#f3f4f6",
    color: "#374151",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  metaTags: { display: "flex", flexWrap: "wrap", gap: "8px" },
  metaTag: {
    background: "#f3f4f6",
    color: "#374151",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
  },
  deleteBtn: {
    background: "#fef2f2",
    color: "#dc2626",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
  },
  budgetCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  budgetHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  budgetLabel: { fontSize: "14px", fontWeight: "600", color: "#374151" },
  budgetAmount: { fontSize: "14px", fontWeight: "700" },
  progressTrack: {
    height: "8px",
    background: "#e5e7eb",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "8px",
  },
  progressFill: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.5s ease",
  },
  budgetNote: { fontSize: "13px", color: "#6b7280", margin: 0 },
  content: { display: "flex", gap: "24px", alignItems: "flex-start" },
  dayTabs: {
    width: "220px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  dayTab: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "14px 16px",
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  dayTabActive: { border: "2px solid #e94560", background: "#fff5f6" },
  dayNum: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#e94560",
    textTransform: "uppercase",
  },
  dayTheme: { fontSize: "13px", fontWeight: "600", color: "#111827" },
  dayCost: { fontSize: "12px", color: "#6b7280" },
  dayContent: { flex: 1 },
  dayHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  dayTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "6px",
  },
  daySummary: { color: "#6b7280", fontSize: "14px", lineHeight: "1.6" },
  dayCostBadge: { textAlign: "right", flexShrink: 0, marginLeft: "20px" },
  dayCostLabel: {
    display: "block",
    fontSize: "12px",
    color: "#9ca3af",
    marginBottom: "4px",
  },
  dayCostValue: {
    display: "block",
    fontSize: "20px",
    fontWeight: "800",
    color: "#e94560",
  },
  timeline: { display: "flex", flexDirection: "column", gap: "0" },
  timelineItem: { display: "flex", gap: "16px", marginBottom: "16px" },
  timeCol: {
    width: "80px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  time: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#6b7280",
    background: "#f3f4f6",
    padding: "4px 8px",
    borderRadius: "6px",
    whiteSpace: "nowrap",
  },
  connector: {
    width: "2px",
    flex: 1,
    background: "#e5e7eb",
    margin: "4px 0",
    minHeight: "20px",
  },
  activityCard: {
    flex: 1,
    background: "#fff",
    borderRadius: "12px",
    padding: "18px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid #f3f4f6",
  },
  activityTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "8px",
  },
  activityLeft: { flex: 1 },
  activityRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "6px",
    flexShrink: 0,
  },
  categoryBadge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "6px",
    textTransform: "capitalize",
  },
  activityName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "4px",
  },
  activityLocation: { fontSize: "13px", color: "#6b7280" },
  activityCost: { fontSize: "15px", fontWeight: "700", color: "#e94560" },
  activityDur: { fontSize: "12px", color: "#9ca3af" },
  editBtn: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "none",
    padding: "5px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
  },
  activityDesc: {
    color: "#4b5563",
    fontSize: "14px",
    lineHeight: "1.6",
    marginBottom: "10px",
  },
  tipBox: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "8px",
    padding: "10px 12px",
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
  },
  tipIcon: { fontSize: "14px", flexShrink: 0 },
  tipText: { fontSize: "13px", color: "#92400e", lineHeight: "1.5" },
  editForm: { display: "flex", flexDirection: "column", gap: "12px" },
  editRow: { display: "flex", gap: "12px" },
  editField: { flex: 1, display: "flex", flexDirection: "column", gap: "4px" },
  editLabel: { fontSize: "12px", fontWeight: "500", color: "#6b7280" },
  editInput: {
    padding: "8px 10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
  },
  editTextarea: {
    padding: "8px 10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
  },
  editActions: { display: "flex", gap: "8px" },
  saveEditBtn: {
    padding: "8px 20px",
    background: "#e94560",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  cancelEditBtn: {
    padding: "8px 16px",
    background: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default ItineraryDetailPage;
