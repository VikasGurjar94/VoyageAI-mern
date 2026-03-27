import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../../store/slices/adminSlice";
import Loader from "../../components/common/Loader";
import { formatPrice, formatDate } from "../../utils/helpers";
import { Link } from "react-router-dom";
import { FiPackage, FiCalendar, FiClock, FiDollarSign, FiChevronRight } from "react-icons/fi";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const statCards = stats
    ? [
        {
          label: "Total Tours",
          value: stats.totalTours,
          icon: <FiPackage size={20} />,
          color: "text-zinc-400",
        },
        {
          label: "Total Bookings",
          value: stats.totalBookings,
          icon: <FiCalendar size={20} />,
          color: "text-zinc-400",
        },
        {
          label: "Pending Booking",
          value: stats.pendingBookings,
          icon: <FiClock size={20} />,
          color: "text-amber-500",
        },
        {
          label: "Total Revenue",
          value: formatPrice(stats.totalRevenue),
          icon: <FiDollarSign size={20} />,
          color: "text-emerald-500",
        },
      ]
    : [];

  const statusCls = {
    pending:   "bg-amber-500/10 text-amber-500 border-amber-500/20",
    confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <div className="bg-[#09090b] min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
            <p className="text-zinc-400 mt-2 text-base">Key metrics and recent activity across your platform</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader /></div>
        ) : (
          <div>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {statCards.map(({ label, value, icon, color }) => (
                <div
                  key={label}
                  className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-zinc-400 text-sm font-medium">{label}</p>
                    <div className={color}>{icon}</div>
                  </div>
                  <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <h2 className="text-lg font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Link
                to="/admin/tours"
                className="bg-[#0a0a0a] flex items-center justify-between rounded-2xl p-6 hover:bg-zinc-900 border border-white/5 transition-colors group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                    <FiPackage size={22} className="text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">Manage Tours</h3>
                    <p className="text-zinc-500 text-sm">Add or edit travel packages</p>
                  </div>
                </div>
                <FiChevronRight className="text-zinc-600 group-hover:text-white transition-colors" />
              </Link>
              
              <Link
                to="/admin/bookings"
                className="bg-[#0a0a0a] flex items-center justify-between rounded-2xl p-6 hover:bg-zinc-900 border border-white/5 transition-colors group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                    <FiCalendar size={22} className="text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">Manage Bookings</h3>
                    <p className="text-zinc-500 text-sm">Review customer reservations</p>
                  </div>
                </div>
                <FiChevronRight className="text-zinc-600 group-hover:text-white transition-colors" />
              </Link>
            </div>

            {/* Recent Bookings Table */}
            {stats?.recentBookings?.length > 0 && (
              <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5">
                  <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-[11px] uppercase tracking-wider text-zinc-500 bg-zinc-900/50 border-b border-white/5">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-left">Customer</th>
                        <th className="px-6 py-4 font-semibold text-left">Tour</th>
                        <th className="px-6 py-4 font-semibold text-left">Travel Date</th>
                        <th className="px-6 py-4 font-semibold text-right">Amount</th>
                        <th className="px-6 py-4 font-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {stats.recentBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-zinc-900/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-medium text-white">{b.User?.name || "—"}</span>
                          </td>
                          <td className="px-6 py-4 text-zinc-400">
                            {b.Tour?.title || "—"}
                          </td>
                          <td className="px-6 py-4 text-zinc-400">
                            {formatDate(b.travel_date)}
                          </td>
                          <td className="px-6 py-4 font-medium text-white text-right">
                            {formatPrice(b.total_price)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded inline-block border ${statusCls[b.status] || "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;