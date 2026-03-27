import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMe, clearError } from "../store/slices/authSlice";
import { toast } from "react-toastify";
import api from "../services/api";
import { FiUser, FiMail, FiPhone, FiLock, FiSave, FiSettings } from "react-icons/fi";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);

  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || "", phone: user.phone || "" });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) { toast.error("Name is required"); return; }
    setProfileLoading(true);
    try {
      await api.patch("/users/me", profileForm);
      dispatch(getMe());
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setPwLoading(true);
    try {
      await api.patch("/auth/update-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success("Password changed successfully");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-[#09090b] min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-12 border-b border-white/5 pb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <FiSettings className="text-zinc-500" /> Account Settings
          </h1>
          <p className="text-zinc-400 mt-2 text-base">Manage your personal information and security preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Avatar & Overview */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-4xl font-bold text-white mb-6">
                {user.name?.[0]?.toUpperCase()}
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white">{user.name}</h2>
                <p className="text-zinc-500 text-sm mt-1">{user.email}</p>
                <div className="mt-4">
                  <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">Security Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400 flex items-center gap-2"><FiLock className="text-zinc-500" /> Password</span>
                  <span className="text-white font-medium">Secure</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400 flex items-center gap-2"><FiMail className="text-zinc-500" /> Email</span>
                  <span className="text-white font-medium">Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Forms */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Profile Update Form */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8">
              <h2 className="text-lg font-bold text-white mb-6">Personal Information</h2>
              
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                      <FiUser className="text-zinc-500" /> Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 outline-none focus:border-zinc-600 transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                      <FiPhone className="text-zinc-500" /> Phone <span className="text-zinc-600 text-xs font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 outline-none focus:border-zinc-600 transition-colors"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                    <FiMail className="text-zinc-500" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full bg-black border border-white/5 text-zinc-600 rounded-lg px-4 py-2.5 cursor-not-allowed"
                  />
                  <p className="text-xs text-zinc-600 mt-1">Email address cannot be changed.</p>
                </div>
                
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="bg-white text-black font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-zinc-200 transition-colors flex items-center gap-2 disabled:opacity-60"
                  >
                    <FiSave />
                    {profileLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8">
              <h2 className="text-lg font-bold text-white mb-6">Change Password</h2>
              
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Current Password</label>
                  <input
                    type="password"
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">New Password</label>
                    <input
                      type="password"
                      value={pwForm.newPassword}
                      onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 outline-none focus:border-zinc-600 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Confirm New Password</label>
                    <input
                      type="password"
                      value={pwForm.confirm}
                      onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 outline-none focus:border-zinc-600 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="border border-zinc-800 text-white hover:bg-zinc-800 text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
                  >
                    <FiLock />
                    {pwLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;