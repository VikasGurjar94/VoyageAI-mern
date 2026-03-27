import { Link, useLocation } from "react-router-dom";

const AdminLayout = ({ children }) => {
  const { pathname } = useLocation();

  const links = [
    { to: "/admin", label: "📊 Dashboard" },
    { to: "/admin/tours", label: "🗺 Tours" },
    { to: "/admin/bookings", label: "📋 Bookings" },
  ];

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <p style={styles.sidebarTitle}>Admin Panel</p>
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            style={{
              ...styles.sidebarLink,
              ...(pathname === to ? styles.sidebarActive : {}),
            }}
          >
            {label}
          </Link>
        ))}
        <Link to="/" style={styles.backLink}>
          ← Back to site
        </Link>
      </aside>

      {/* Main content */}
      <main style={styles.main}>{children}</main>
    </div>
  );
};

const styles = {
  layout: { display: "flex", minHeight: "calc(100vh - 64px)" },
  sidebar: {
    width: "220px",
    background: "#1a1a2e",
    padding: "28px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flexShrink: 0,
  },
  sidebarTitle: {
    color: "#9ca3af",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "12px",
    paddingLeft: "12px",
  },
  sidebarLink: {
    color: "#d1d5db",
    textDecoration: "none",
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
  },
  sidebarActive: { background: "#e94560", color: "#fff" },
  backLink: {
    color: "#6b7280",
    textDecoration: "none",
    fontSize: "13px",
    padding: "10px 12px",
    marginTop: "auto",
  },
  main: { flex: 1, background: "#f9fafb", overflowX: "hidden" },
};

export default AdminLayout;
