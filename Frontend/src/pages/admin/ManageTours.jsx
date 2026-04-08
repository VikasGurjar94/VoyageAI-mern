import { useEffect, useState } from "react";
import api from "../../services/api";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTours,
  createTour,
  updateTour,
  deleteTour,
} from "../../store/slices/tourSlice";
import { toast } from "react-toastify";
import Loader from "../../components/common/Loader";
import { formatPrice, getImageUrl } from "../../utils/helpers";

// empty form state — reused for both create and edit
const emptyForm = {
  title: "",
  description: "",
  destination: "",
  price: "",
  duration_days: "",
  max_group_size: "",
  difficulty: "easy",
  image: null,
};

const ManageTours = () => {
  const dispatch = useDispatch();
  const { tours, loading } = useSelector((s) => s.tours);
const [itinModal, setItinModal] = useState(false);
const [itinTourId, setItinTourId] = useState(null);
const [itinTourName, setItinTourName] = useState("");
const [itinDays, setItinDays] = useState([]);
const [itinSaving, setItinSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editTour, setEditTour] = useState(null); // null = create mode
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null); // image preview URL


  const openItinModal = async (tour) => {
    setItinTourId(tour.id);
    setItinTourName(tour.title);
    // fetch existing days
    try {
      const { data } = await api.get(`/tours/${tour.id}/itinerary`);
      if (data.days.length > 0) {
        setItinDays(
          data.days.map((d) => ({
            day_number: d.day_number,
            title: d.title,
            description: d.description,
            location: d.location || "",
            activities: (d.activities || []).join("\n"),
            accommodation: d.accommodation || "",
            distance_km: d.distance_km || 0,
            meals_b: d.meals?.breakfast || false,
            meals_l: d.meals?.lunch || false,
            meals_d: d.meals?.dinner || false,
          })),
        );
      } else {
        // default empty days based on tour duration
        setItinDays(
          Array.from({ length: tour.duration_days }, (_, i) => ({
            day_number: i + 1,
            title: "",
            description: "",
            location: "",
            activities: "",
            accommodation: "",
            distance_km: 0,
            meals_b: false,
            meals_l: false,
            meals_d: false,
          })),
        );
      }
    } catch {
      setItinDays([]);
    }
    setItinModal(true);
  };

  const saveItinerary = async () => {
    setItinSaving(true);
    try {
      const days = itinDays.map((d) => ({
        day_number: d.day_number,
        title: d.title,
        description: d.description,
        location: d.location,
        activities: d.activities.split("\n").filter((a) => a.trim()),
        meals: {
          breakfast: d.meals_b,
          lunch: d.meals_l,
          dinner: d.meals_d,
        },
        accommodation: d.accommodation,
        distance_km: parseFloat(d.distance_km) || 0,
      }));

      await api.post(`/tours/${itinTourId}/itinerary`, { days });
      toast.success("Itinerary saved successfully!");
      setItinModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save itinerary");
    } finally {
      setItinSaving(false);
    }
  };

  const updateItinDay = (index, field, value) => {
    setItinDays((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
    );
  };

  useEffect(() => {
    dispatch(fetchTours({ limit: 100 }));
  }, [dispatch]);

  // open modal in CREATE mode
  const openCreate = () => {
    setEditTour(null);
    setForm(emptyForm);
    setPreview(null);
    setShowModal(true);
  };

  // open modal in EDIT mode — pre-fill form with tour data
  const openEdit = (tour) => {
    setEditTour(tour);
    setForm({
      title: tour.title,
      description: tour.description,
      destination: tour.destination,
      price: tour.price,
      duration_days: tour.duration_days,
      max_group_size: tour.max_group_size,
      difficulty: tour.difficulty,
      image: null, // user must re-upload if they want to change
    });
    setPreview(getImageUrl(tour.image));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTour(null);
    setForm(emptyForm);
    setPreview(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, image: file });
    // show local preview immediately
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // build FormData — required because of image file
    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (val !== null && val !== "") fd.append(key, val);
    });

    try {
      if (editTour) {
        await dispatch(updateTour({ id: editTour.id, formData: fd })).unwrap();
        toast.success("Tour updated successfully");
      } else {
        await dispatch(createTour(fd)).unwrap();
        toast.success("Tour created successfully");
      }
      closeModal();
      dispatch(fetchTours({ limit: 100 })); // refresh list
    } catch (err) {
      toast.error(err || "Something went wrong");
    }
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Deactivate "${title}"? It won't appear in listings.`)) {
      dispatch(deleteTour(id))
        .unwrap()
        .then(() => toast.success("Tour deactivated"))
        .catch((err) => toast.error(err));
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>Manage Tours</h1>
          <p style={styles.sub}>{tours.length} tours in total</p>
        </div>
        <button onClick={openCreate} style={styles.addBtn}>
          + Add New Tour
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Tour</th>
                <th style={styles.th}>Destination</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Duration</th>
                <th style={styles.th}>Difficulty</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tours.map((tour) => (
                <tr key={tour.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.tourCell}>
                      <img
                        src={getImageUrl(tour.image)}
                        alt={tour.title}
                        style={styles.tourThumb}
                        onError={(e) => {
                          e.target.src = "/placeholder.jpg";
                        }}
                      />
                      <span style={styles.tourName}>{tour.title}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{tour.destination}</td>
                  <td style={styles.td}>{formatPrice(tour.price)}</td>
                  <td style={styles.td}>{tour.duration_days} days</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.diffBadge,
                        ...diffStyles[tour.difficulty],
                      }}
                    >
                      {tour.difficulty}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={tour.is_active ? styles.active : styles.inactive}
                    >
                      {tour.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => openEdit(tour)}
                      style={styles.editBtn}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openItinModal(tour)}
                      style={styles.itinBtn}
                    >
                      Itinerary
                    </button>
                    <button
                      onClick={() => handleDelete(tour.id, tour.title)}
                      style={styles.deleteBtn}
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editTour ? "Edit Tour" : "Add New Tour"}
              </h2>
              <button onClick={closeModal} style={styles.closeBtn}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                {/* Title */}
                <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Tour Title</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    style={styles.input}
                    placeholder="e.g. Goa Beach Tour"
                  />
                </div>

                {/* Description */}
                <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    style={styles.textarea}
                    placeholder="Describe the tour experience..."
                  />
                </div>

                {/* Destination */}
                <div style={styles.field}>
                  <label style={styles.label}>Destination</label>
                  <input
                    name="destination"
                    value={form.destination}
                    onChange={handleChange}
                    required
                    style={styles.input}
                    placeholder="e.g. Goa"
                  />
                </div>

                {/* Price */}
                <div style={styles.field}>
                  <label style={styles.label}>Price (₹)</label>
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    required
                    style={styles.input}
                    placeholder="e.g. 12000"
                  />
                </div>

                {/* Duration */}
                <div style={styles.field}>
                  <label style={styles.label}>Duration (days)</label>
                  <input
                    name="duration_days"
                    type="number"
                    value={form.duration_days}
                    onChange={handleChange}
                    required
                    style={styles.input}
                    placeholder="e.g. 5"
                  />
                </div>

                {/* Group size */}
                <div style={styles.field}>
                  <label style={styles.label}>Max Group Size</label>
                  <input
                    name="max_group_size"
                    type="number"
                    value={form.max_group_size}
                    onChange={handleChange}
                    required
                    style={styles.input}
                    placeholder="e.g. 15"
                  />
                </div>

                {/* Difficulty */}
                <div style={styles.field}>
                  <label style={styles.label}>Difficulty</label>
                  <select
                    name="difficulty"
                    value={form.difficulty}
                    onChange={handleChange}
                    style={styles.input}
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {/* Image upload */}
                <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
                  <label style={styles.label}>
                    Tour Image {editTour && "(leave empty to keep current)"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={styles.fileInput}
                  />
                  {preview && (
                    <img src={preview} alt="preview" style={styles.preview} />
                  )}
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={loading ? styles.submitBtnDisabled : styles.submitBtn}
                >
                  {loading
                    ? "Saving..."
                    : editTour
                      ? "Update Tour"
                      : "Create Tour"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Itinerary Modal */}
      {itinModal && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: "780px" }}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Itinerary — {itinTourName}</h2>
              <button
                onClick={() => setItinModal(false)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {itinDays.map((day, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "16px",
                    marginBottom: "14px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#e94560",
                      marginBottom: "12px",
                    }}
                  >
                    Day {day.day_number}
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div style={styles.field}>
                      <label style={styles.label}>Day Title</label>
                      <input
                        value={day.title}
                        onChange={(e) =>
                          updateItinDay(index, "title", e.target.value)
                        }
                        placeholder="e.g. Arrival & Beach Exploration"
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Location (for map)</label>
                      <input
                        value={day.location}
                        onChange={(e) =>
                          updateItinDay(index, "location", e.target.value)
                        }
                        placeholder="e.g. Calangute Beach, Goa"
                        style={styles.input}
                      />
                    </div>
                    <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
                      <label style={styles.label}>Description</label>
                      <textarea
                        value={day.description}
                        onChange={(e) =>
                          updateItinDay(index, "description", e.target.value)
                        }
                        rows={2}
                        placeholder="Describe this day..."
                        style={styles.textarea}
                      />
                    </div>
                    <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
                      <label style={styles.label}>
                        Activities (one per line)
                      </label>
                      <textarea
                        value={day.activities}
                        onChange={(e) =>
                          updateItinDay(index, "activities", e.target.value)
                        }
                        rows={3}
                        placeholder="Morning beach walk&#10;Snorkeling session&#10;Sunset cruise"
                        style={styles.textarea}
                      />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Accommodation</label>
                      <input
                        value={day.accommodation}
                        onChange={(e) =>
                          updateItinDay(index, "accommodation", e.target.value)
                        }
                        placeholder="e.g. 3-star beach resort"
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Distance (km)</label>
                      <input
                        type="number"
                        value={day.distance_km}
                        onChange={(e) =>
                          updateItinDay(index, "distance_km", e.target.value)
                        }
                        style={styles.input}
                      />
                    </div>
                    <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
                      <label style={styles.label}>Meals included</label>
                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          marginTop: "4px",
                        }}
                      >
                        {["meals_b", "meals_l", "meals_d"].map((key, mi) => (
                          <label
                            key={key}
                            style={{
                              display: "flex",
                              gap: "6px",
                              alignItems: "center",
                              fontSize: "14px",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={day[key]}
                              onChange={(e) =>
                                updateItinDay(index, key, e.target.checked)
                              }
                            />
                            {["🍳 Breakfast", "🥗 Lunch", "🍽 Dinner"][mi]}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ ...styles.modalFooter, marginTop: "16px" }}>
              <button
                type="button"
                onClick={() => setItinModal(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={saveItinerary}
                disabled={itinSaving}
                style={itinSaving ? styles.submitBtnDisabled : styles.submitBtn}
              >
                {itinSaving ? "Saving..." : "Save Itinerary"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const diffStyles = {
  easy: { background: "#dcfce7", color: "#166534" },
  moderate: { background: "#fef9c3", color: "#854d0e" },
  hard: { background: "#fee2e2", color: "#991b1b" },
};

const styles = {
  page: { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
  },
  heading: { fontSize: "28px", fontWeight: "700", color: "#111827" },
  sub: { color: "#6b7280", fontSize: "14px", marginTop: "4px" },
  addBtn: {
    background: "#e94560",
    color: "#fff",
    padding: "10px 22px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },
  tableCard: {
    background: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f9fafb" },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "1px solid #f3f4f6",
  },
  tr: { borderBottom: "1px solid #f9fafb" },
  td: {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#374151",
    verticalAlign: "middle",
  },
  tourCell: { display: "flex", alignItems: "center", gap: "12px" },
  tourThumb: {
    width: "48px",
    height: "48px",
    borderRadius: "8px",
    objectFit: "cover",
  },
  tourName: { fontWeight: "600", color: "#111827" },
  diffBadge: {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  active: {
    background: "#dcfce7",
    color: "#166534",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  inactive: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  editBtn: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "none",
    padding: "6px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    marginRight: "8px",
  },
  deleteBtn: {
    background: "#fef2f2",
    color: "#dc2626",
    border: "none",
    padding: "6px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  // modal
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    padding: "20px",
  },
  modal: {
    background: "#fff",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "680px",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "32px",
  },
  itinBtn: {
    background: "#f0fdf4",
    color: "#16a34a",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    marginRight: "8px",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  modalTitle: { fontSize: "20px", fontWeight: "700", color: "#111827" },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#6b7280",
  },
  form: { display: "flex", flexDirection: "column", gap: "0" },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "24px",
  },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "500", color: "#374151" },
  input: {
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
  },
  textarea: {
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
  },
  fileInput: { fontSize: "14px", color: "#374151" },
  preview: {
    width: "100%",
    height: "160px",
    objectFit: "cover",
    borderRadius: "8px",
    marginTop: "8px",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    paddingTop: "20px",
    borderTop: "1px solid #f3f4f6",
  },
  cancelBtn: {
    padding: "10px 22px",
    background: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    color: "#374151",
  },
  submitBtn: {
    padding: "10px 22px",
    background: "#e94560",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  submitBtnDisabled: {
    padding: "10px 22px",
    background: "#f9a8b4",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "not-allowed",
  },
};

export default ManageTours;
