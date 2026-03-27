import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../store/slices/authSlice";
import { toast } from "react-toastify";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: "", password: "" });

  // if already logged in → redirect to home
  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);

  // show error toast when error changes
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    dispatch(login(form));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#09090b] px-4 py-12">
      <div className="bg-[#0a0a0a] p-8 sm:p-10 rounded-2xl w-full max-w-[420px] border border-white/5">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
        <p className="text-zinc-500 mb-8 text-sm">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-400">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-400">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-2 w-full py-3.5 rounded-xl text-sm font-semibold transition-colors ${
              loading
                ? "bg-zinc-800 text-zinc-400 cursor-not-allowed"
                : "bg-white text-black hover:bg-zinc-200"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-6 text-zinc-500 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-white font-medium hover:underline transition-all">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
