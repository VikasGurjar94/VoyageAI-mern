import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updatePassword, clearError } from "../store/slices/authSlice";
import { toast } from "react-toastify";
import api from "../services/api";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((s) => s.auth);

  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handlePassChange = (e) =>
    setPassForm({ ...passForm, [e.target.name]: e.target.value });

  const handlePassSubmit = (e) => {
    e.preventDefault();
    if (!passForm.currentPassword || !passForm.newPassword) {
      toast.error("Both fields are required");
      return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    dispatch(updatePassword(passForm))
      .unwrap()
      .then(() => {
        toast.success("Password updated successfully");
        setPassForm({ currentPassword: "", newPassword: "" });
      });
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>My Profile</h1>

      <div style={styles.layout}>
        {/* Profile info card */}
        <div style={styles.card}>
          <div style={styles.avatarWrapper}>
            <div style={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <h2 style={styles.name}>{user?.name}</h2>
          <p style={styles.email}>{user?.email}</p>
          <span
            style={{
              ...styles.roleBadge,
              background: user?.role === "admin" ? "#fef3c7" : "#e0f2fe",
              color: user?.role === "admin" ? "#92400e" : "#0369a1",
            }}
          >
            {user?.role}
          </span>

          <div style={styles.divider} />

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Phone</span>
            <span style={styles.infoValue}>
              {user?.phone || "Not provided"}
            </span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Member since</span>
            <span style={styles.infoValue}>
              {new Date(user?.createdAt).toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Change password card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Change Password</h2>
          <form onSubmit={handlePassSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passForm.currentPassword}
                onChange={handlePassChange}
                placeholder="••••••••"
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passForm.newPassword}
                onChange={handlePassChange}
                placeholder="••••••••"
                style={styles.input}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={loading ? styles.btnDisabled : styles.btn}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
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
  layout: {
    display: "flex",
    gap: "24px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  card: {
    flex: 1,
    minWidth: "280px",
    background: "#fff",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
  },
  avatarWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "16px",
  },
  avatar: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: "#e94560",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    fontWeight: "700",
  },
  name: {
    textAlign: "center",
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "4px",
  },
  email: {
    textAlign: "center",
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "10px",
  },
  roleBadge: {
    display: "block",
    width: "fit-content",
    margin: "0 auto",
    padding: "4px 16px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  divider: { borderTop: "1px solid #f3f4f6", margin: "20px 0" },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  infoLabel: { fontSize: "14px", color: "#9ca3af" },
  infoValue: { fontSize: "14px", color: "#111827", fontWeight: "500" },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "20px",
  },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "14px", fontWeight: "500", color: "#374151" },
  input: {
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    outline: "none",
  },
  btn: {
    padding: "12px",
    background: "#e94560",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnDisabled: {
    padding: "12px",
    background: "#f9a8b4",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    cursor: "not-allowed",
  },
};

export default ProfilePage;
