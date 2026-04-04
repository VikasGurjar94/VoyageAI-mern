import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { toast } from "react-toastify";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        ✈ Voyage
      </Link>

      <div style={styles.links}>
        <Link to="/tours" style={styles.link}>
          Tours
        </Link>

        {user ? (
          <>
            
            <Link to="/trip-planner" style={styles.link}>
              ✨ AI Planner
            </Link>
            <Link to="/my-itineraries" style={styles.link}>
              My Trips
            </Link>
            <Link to="/my-bookings" style={styles.link}>
              My Bookings
            </Link>
            <Link to="/profile" style={styles.link}>
              {user.name}
            </Link>
            {user.role === "admin" && (
              <Link to="/admin" style={styles.adminLink}>
                Admin
              </Link>
            )}
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>
              Login
            </Link>
            <Link to="/register" style={styles.registerBtn}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 40px",
    background: "#1a1a2e",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
  },
  brand: {
    color: "#e94560",
    fontSize: "24px",
    fontWeight: "700",
    textDecoration: "none",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  link: {
    color: "#ccc",
    textDecoration: "none",
    fontSize: "15px",
  },
  adminLink: {
    color: "#f59e0b",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "600",
  },
  logoutBtn: {
    background: "transparent",
    border: "1px solid #e94560",
    color: "#e94560",
    padding: "6px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  registerBtn: {
    background: "#e94560",
    color: "#fff",
    padding: "6px 18px",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "14px",
  },
};

export default Navbar;
