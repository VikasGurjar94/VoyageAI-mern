import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError } from "../store/slices/authSlice";
import { toast } from "react-toastify";

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Name, email and password are required");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    dispatch(register(form));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#09090b] px-4 py-12">
      <div className="bg-[#0a0a0a] p-8 sm:p-10 rounded-2xl w-full max-w-[420px] border border-white/5">
        <h2 className="text-2xl font-bold text-white mb-2">Create account</h2>
        <p className="text-zinc-500 mb-8 text-sm">Start exploring today</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {["name", "email", "phone"].map((field) => (
            <div key={field} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-400">
                {field.charAt(0).toUpperCase() + field.slice(1)}
                {field === "phone" && <span className="text-zinc-600"> (optional)</span>}
              </label>
              <input
                type={field === "email" ? "email" : "text"}
                name={field}
                value={form[field]}
                onChange={handleChange}
                placeholder={`Enter your ${field}`}
                className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
          ))}
          
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-6 text-zinc-500 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-white font-medium hover:underline transition-all">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
