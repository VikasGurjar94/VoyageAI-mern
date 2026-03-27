import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import { formatPrice } from "../../utils/helpers";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // fetch tours and bookings in parallel
        const [toursRes, bookingsRes] = await Promise.all([
          api.get("/tours?limit=100"),
          api.get("/bookings?limit=100"),
        ]);

        const tours = toursRes.data.tours;
        const bookings = bookingsRes.data.bookings;

        // calculate stats from the data
        const totalRevenue = bookings
          .filter((b) => b.status === "confirmed")
          .reduce((sum, b) => sum + parseFloat(b.total_price), 0);

        setStats({
          totalTours: tours.length,
          totalBookings: bookings.length,
          totalRevenue,
          pendingBookings: bookings.filter((b) => b.status === "pending")
            .length,
          confirmedBookings: bookings.filter((b) => b.status === "confirmed")
            .length,
          cancelledBookings: bookings.filter((b) => b.status === "cancelled")
            .length,
          recentBookings: bookings.slice(0, 5),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <Loader message="Loading dashboard..." />;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>Admin Dashboard</h1>
          <p style={styles.sub}>Overview of your tours and bookings</p>
        </div>
        <div style={styles.headerActions}>
          <Link to="/admin/tours" style={styles.actionBtn}>
            Manage Tours
          </Link>
          <Link to="/admin/bookings" style={styles.actionBtnOutline}>
            Manage Bookings
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div style={styles.statsGrid}>
        {[
          {
            label: "Total Tours",
            value: stats.totalTours,
            color: "#3b82f6",
            bg: "#eff6ff",
          },
          {
            label: "Total Bookings",
            value: stats.totalBookings,
            color: "#8b5cf6",
            bg: "#f5f3ff",
          },
          {
            label: "Total Revenue",
            value: formatPrice(stats.totalRevenue),
            color: "#10b981",
            bg: "#ecfdf5",
          },
          {
            label: "Pending",
            value: stats.pendingBookings,
            color: "#f59e0b",
            bg: "#fffbeb",
          },
          {
            label: "Confirmed",
            value: stats.confirmedBookings,
            color: "#10b981",
            bg: "#ecfdf5",
          },
          {
            label: "Cancelled",
            value: stats.cancelledBookings,
            color: "#ef4444",
            bg: "#fef2f2",
          },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{ ...styles.statCard, background: bg }}>
            <span style={{ ...styles.statValue, color }}>{value}</span>
            <span style={styles.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* Recent bookings table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>Recent Bookings</h2>
          <Link to="/admin/bookings" style={styles.viewAll}>
            View all →
          </Link>
        </div>

        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Tour</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentBookings.map((b) => (
              <tr key={b.id} style={styles.tr}>
                <td style={styles.td}>{b.User?.name}</td>
                <td style={styles.td}>{b.Tour?.title}</td>
                <td style={styles.td}>
                  {new Date(b.travel_date).toLocaleDateString("en-IN")}
                </td>
                <td style={styles.td}>{formatPrice(b.total_price)}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      background: statusBg[b.status],
                      color: statusColor[b.status],
                    }}
                  >
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const statusBg = {
  pending: "#fffbeb",
  confirmed: "#ecfdf5",
  cancelled: "#fef2f2",
};
const statusColor = {
  pending: "#d97706",
  confirmed: "#059669",
  cancelled: "#dc2626",
};

const styles = {
  page: { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "16px",
  },
  heading: { fontSize: "28px", fontWeight: "700", color: "#111827" },
  sub: { color: "#6b7280", fontSize: "14px", marginTop: "4px" },
  headerActions: { display: "flex", gap: "12px" },
  actionBtn: {
    background: "#e94560",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
  },
  actionBtnOutline: {
    border: "1px solid #e94560",
    color: "#e94560",
    padding: "10px 20px",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  statCard: { borderRadius: "12px", padding: "20px", textAlign: "center" },
  statValue: {
    display: "block",
    fontSize: "28px",
    fontWeight: "800",
    marginBottom: "6px",
  },
  statLabel: {
    display: "block",
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: "500",
  },
  tableCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  tableTitle: { fontSize: "18px", fontWeight: "700", color: "#111827" },
  viewAll: {
    color: "#e94560",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f9fafb" },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "1px solid #f3f4f6",
  },
  tr: { borderBottom: "1px solid #f9fafb" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#374151" },
  badge: {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
  },
};

export default AdminDashboard;
