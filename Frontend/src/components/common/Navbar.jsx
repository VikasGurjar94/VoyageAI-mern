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
    <nav className="flex justify-between items-center py-4 px-6 md:px-12 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
      <Link to="/" className="text-white text-xl font-bold tracking-tight flex items-center gap-2">
        <span className="text-primary">✈</span> Voyage
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/tours" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
          Tours
        </Link>

        {user ? (
          <>
            <Link to="/my-bookings" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              My Bookings
            </Link>
            <Link to="/profile" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              {user.name}
            </Link>
            {user.role === "admin" && (
              <Link to="/admin" className="text-sm font-medium text-primary hover:text-white transition-colors">
                Admin
              </Link>
            )}
            <button 
              onClick={handleLogout} 
              className="text-sm font-medium text-zinc-400 hover:text-white border border-zinc-800 rounded-md px-4 py-1.5 transition-all hover:bg-zinc-800/50"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/register" className="text-sm font-medium bg-white text-black px-4 py-1.5 rounded-md hover:bg-zinc-200 transition-colors">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
