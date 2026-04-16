import { useState } from "react";
import { useDispatch } from "react-redux";
import api from "../../services/api";
import { toast } from "react-toastify";

const ReviewModal = ({ booking, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/tours/${booking.tour_id}/reviews`, {
        rating,
        comment,
      });
      toast.success("Review submitted! Thank you.");
      onSubmitted();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Leave a Review</h2>
          <button onClick={onClose} style={styles.closeBtn}>
            ✕
          </button>
        </div>

        {/* Tour info */}
        <div style={styles.tourInfo}>
          <p style={styles.tourName}>{booking.Tour?.title}</p>
          <p style={styles.tourMeta}>
            📍 {booking.Tour?.destination} ·
            {new Date(booking.travel_date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Star rating */}
        <div style={styles.ratingSection}>
          <p style={styles.ratingLabel}>Your rating</p>
          <div style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(star)}
                style={{
                  ...styles.star,
                  color: star <= (hovered || rating) ? "#f59e0b" : "#d1d5db",
                }}
              >
                ★
              </span>
            ))}
          </div>
          {(hovered || rating) > 0 && (
            <p style={styles.ratingText}>{labels[hovered || rating]}</p>
          )}
        </div>

        {/* Comment */}
        <div style={styles.commentSection}>
          <label style={styles.commentLabel}>
            Share your experience (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell other travellers about your experience on this tour..."
            rows={4}
            style={styles.textarea}
            maxLength={500}
          />
          <p style={styles.charCount}>{comment.length}/500</p>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button onClick={onClose} style={styles.cancelBtn}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            style={
              loading || rating === 0
                ? styles.submitBtnDisabled
                : styles.submitBtn
            }
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    padding: "20px",
  },
  modal: {
    background: "#fff",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "480px",
    padding: "32px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: { fontSize: "22px", fontWeight: "700", color: "#111827" },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#9ca3af",
  },
  tourInfo: {
    background: "#f9fafb",
    borderRadius: "10px",
    padding: "14px 16px",
    marginBottom: "24px",
  },
  tourName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "4px",
  },
  tourMeta: { fontSize: "13px", color: "#6b7280" },
  ratingSection: { textAlign: "center", marginBottom: "24px" },
  ratingLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "12px",
  },
  stars: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  star: {
    fontSize: "44px",
    cursor: "pointer",
    transition: "color 0.1s, transform 0.1s",
    lineHeight: "1",
  },
  ratingText: { fontSize: "16px", fontWeight: "700", color: "#f59e0b" },
  commentSection: { marginBottom: "24px" },
  commentLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
    lineHeight: "1.6",
    boxSizing: "border-box",
  },
  charCount: {
    textAlign: "right",
    fontSize: "12px",
    color: "#9ca3af",
    marginTop: "4px",
  },
  actions: { display: "flex", gap: "12px" },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    background: "#f3f4f6",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    cursor: "pointer",
    color: "#374151",
    fontWeight: "500",
  },
  submitBtn: {
    flex: 2,
    padding: "12px",
    background: "#e94560",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },
  submitBtnDisabled: {
    flex: 2,
    padding: "12px",
    background: "#f9a8b4",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    cursor: "not-allowed",
  },
};

export default ReviewModal;
