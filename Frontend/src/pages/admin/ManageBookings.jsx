import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllBookingsAdmin,
  updateBookingStatusAdmin,
} from "../../store/slices/adminSlice";
import Loader from "../../components/common/Loader";
import { formatPrice, formatDate } from "../../utils/helpers";
import { toast } from "react-toastify";
import { FiFilter } from "react-icons/fi";

const statusCls = {
  pending:   "bg-amber-500/10 text-amber-500 border-amber-500/20",
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const ManageBookings = () => {
  const dispatch = useDispatch();
  const { bookings, loading, total } = useSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchAllBookingsAdmin({ limit: 100 }));
  }, [dispatch]);

  const handleStatusChange = async (id, status) => {
    try {
      await dispatch(updateBookingStatusAdmin({ id, status })).unwrap();
      toast.success(`Booking marked as ${status}`);
    } catch (err) {
      toast.error(err || "Failed to update status");
    }
  };

  return (
    <div className="bg-[#09090b] min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Manage Bookings</h1>
            <p className="text-zinc-400 mt-2 text-sm">{total} total reservations across the platform</p>
          </div>
          
          <div className="flex items-center gap-2 bg-[#0a0a0a] border border-zinc-800 rounded-lg px-4 py-2 w-fit">
            <FiFilter className="text-zinc-500" size={14} />
            <select className="bg-transparent text-sm text-zinc-300 outline-none border-none cursor-pointer">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader /></div>
        ) : bookings.length === 0 ? (
          <div className="bg-[#0a0a0a] rounded-2xl p-16 text-center border border-white/5">
            <p className="text-zinc-500 text-sm">No bookings found system-wide.</p>
          </div>
        ) : (
          <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 bg-zinc-900/50 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left">Order ID</th>
                    <th className="px-6 py-4 text-left">Customer</th>
                    <th className="px-6 py-4 text-left">Tour Selection</th>
                    <th className="px-6 py-4 text-left">Travel Date</th>
                    <th className="px-6 py-4 text-center">Pax</th>
                    <th className="px-6 py-4 text-right">Revenue</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-4 text-zinc-500 font-mono text-xs">#{b.id.substring(0,8)}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{b.User?.name || "—"}</p>
                        <p className="text-zinc-500 text-xs mt-0.5">{b.User?.email}</p>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 max-w-[200px] truncate">
                        {b.Tour?.title || "—"}
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {formatDate(b.travel_date)}
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className="text-zinc-300 text-xs">{b.num_people}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-white text-right">
                        {formatPrice(b.total_price)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded inline-block border ${statusCls[b.status] || "bg-zinc-800 text-zinc-400 border-white/5"}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-block relative">
                           <select
                              value={b.status}
                              onChange={(e) => handleStatusChange(b.id, e.target.value)}
                              className="appearance-none bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg pl-3 pr-8 py-2 outline-none focus:border-zinc-500 transition-colors cursor-pointer"
                            >
                              <option value="pending" className="bg-[#18181b]">Pending</option>
                              <option value="confirmed" className="bg-[#18181b]">Confirmed</option>
                              <option value="cancelled" className="bg-[#18181b]">Cancelled</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBookings;