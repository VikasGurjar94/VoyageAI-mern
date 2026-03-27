import { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import Loader from "../../components/common/Loader";
import { formatPrice, formatDate } from "../../utils/helpers";

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState(null); // id being updated

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/bookings", { params });
      setBookings(data.bookings);
      setTotalPages(data.pages);
    } catch (err) {
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter]);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdating(id);
    try {
      await api.patch(`/bookings/${id}/status`, { status: newStatus });
      toast.success(`Booking marked as ${newStatus}`);
      // update locally without refetching
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)),
      );
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>Manage Bookings</h1>
          <p style={styles.sub}>Review and update all booking statuses</p>
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          style={styles.filterSelect}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Tour</th>
                  <th style={styles.th}>Travel Date</th>
                  <th style={styles.th}>People</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={styles.empty}>
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={styles.idBadge}>#{b.id}</span>
                      </td>
                      <td style={styles.td}>
                        <p style={styles.customerName}>{b.User?.name}</p>
                        <p style={styles.customerEmail}>{b.User?.email}</p>
                      </td>
                      <td style={styles.td}>
                        <p style={styles.tourName}>{b.Tour?.title}</p>
                        <p style={styles.tourDest}>📍 {b.Tour?.destination}</p>
                      </td>
                      <td style={styles.td}>{formatDate(b.travel_date)}</td>
                      <td style={styles.td}>{b.num_people}</td>
                      <td style={styles.td}>
                        <strong>{formatPrice(b.total_price)}</strong>
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...statusStyles[b.status],
                          }}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {b.status === "pending" && (
                          <div style={styles.actionBtns}>
                            <button
                              onClick={() =>
                                handleStatusUpdate(b.id, "confirmed")
                              }
                              disabled={updating === b.id}
                              style={styles.confirmBtn}
                            >
                              {updating === b.id ? "..." : "Confirm"}
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(b.id, "cancelled")
                              }
                              disabled={updating === b.id}
                              style={styles.cancelBtn}
                            >
                              {updating === b.id ? "..." : "Cancel"}
                            </button>
                          </div>
                        )}
                        {b.status === "confirmed" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(b.id, "cancelled")
                            }
                            disabled={updating === b.id}
                            style={styles.cancelBtn}
                          >
                            {updating === b.id ? "..." : "Cancel"}
                          </button>
                        )}
                        {b.status === "cancelled" && (
                          <span style={styles.noAction}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                style={page === 1 ? styles.pageDisabled : styles.pageBtn}
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={p === page ? styles.pageActive : styles.pageBtn}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                style={
                  page === totalPages ? styles.pageDisabled : styles.pageBtn
                }
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const statusStyles = {
  pending: { background: "#fffbeb", color: "#d97706" },
  confirmed: { background: "#ecfdf5", color: "#059669" },
  cancelled: { background: "#fef2f2", color: "#dc2626" },
};

const styles = {
  page: { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "16px",
  },
  heading: { fontSize: "28px", fontWeight: "700", color: "#111827" },
  sub: { color: "#6b7280", fontSize: "14px", marginTop: "4px" },
  filterSelect: {
    padding: "10px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    minWidth: "160px",
  },
  tableCard: {
    background: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    overflowX: "auto",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "800px" },
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
  empty: {
    textAlign: "center",
    padding: "48px",
    color: "#9ca3af",
    fontSize: "15px",
  },
  idBadge: {
    background: "#f3f4f6",
    color: "#6b7280",
    padding: "3px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
  },
  customerName: { fontWeight: "600", color: "#111827", marginBottom: "2px" },
  customerEmail: { fontSize: "12px", color: "#9ca3af" },
  tourName: { fontWeight: "600", color: "#111827", marginBottom: "2px" },
  tourDest: { fontSize: "12px", color: "#9ca3af" },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  actionBtns: { display: "flex", gap: "8px" },
  confirmBtn: {
    background: "#ecfdf5",
    color: "#059669",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  cancelBtn: {
    background: "#fef2f2",
    color: "#dc2626",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  noAction: { color: "#d1d5db", fontSize: "16px" },
  pagination: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginTop: "28px",
  },
  pageBtn: {
    padding: "8px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    background: "#fff",
    cursor: "pointer",
    fontSize: "13px",
  },
  pageActive: {
    padding: "8px 14px",
    border: "1px solid #e94560",
    borderRadius: "6px",
    background: "#e94560",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px",
  },
  pageDisabled: {
    padding: "8px 14px",
    border: "1px solid #f3f4f6",
    borderRadius: "6px",
    background: "#f9fafb",
    color: "#d1d5db",
    cursor: "not-allowed",
    fontSize: "13px",
  },
};

export default ManageBookings;
