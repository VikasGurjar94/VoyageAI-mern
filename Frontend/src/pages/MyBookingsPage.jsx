import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyBookings, cancelBooking } from "../store/slices/bookingSlice";
import Loader from "../components/common/Loader";
import { formatPrice, formatDate, getImageUrl } from "../utils/helpers";
import { toast } from "react-toastify";
import { FiCalendar, FiUsers, FiMapPin, FiCompass } from "react-icons/fi";
import { Link } from "react-router-dom";

const statusConfig = {
  pending:   { cls: "bg-amber-500/10 text-amber-500 border-amber-500/20",   label: "Pending" },
  confirmed: { cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Confirmed" },
  cancelled: { cls: "bg-rose-500/10 text-rose-400 border-rose-500/20", label: "Cancelled" },
};

const MyBookingsPage = () => {
  const dispatch = useDispatch();
  const { bookings, loading } = useSelector((s) => s.bookings);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    const result = await dispatch(cancelBooking(id));
    if (!result.error) {
      toast.success("Booking cancelled successfully");
    } else {
      toast.error(result.payload || "Failed to cancel booking");
    }
  };

  return (
    <div className="bg-[#09090b] min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Your Journeys</h1>
            <p className="text-zinc-400 mt-2 text-base">Manage your upcoming and past adventures</p>
          </div>
          <Link
            to="/tours"
            className="inline-flex items-center gap-2 border border-zinc-800 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <FiCompass className="text-zinc-400" /> Explore More
          </Link>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader /></div>
        ) : bookings.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl py-24 text-center max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-2">No bookings yet</h3>
            <p className="text-zinc-500 text-sm mb-6 max-w-md mx-auto">
              You haven't booked any experiences yet. Your next great adventure is waiting.
            </p>
            <Link
              to="/tours"
              className="bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-zinc-200 transition-colors inline-block text-sm"
            >
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const status = statusConfig[booking.status] || {
                cls: "bg-zinc-900 border-zinc-800 text-zinc-300",
                label: booking.status,
              };
              return (
                <div
                  key={booking.id}
                  className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Tour Image */}
                    <div className="sm:w-64 flex-shrink-0 relative overflow-hidden bg-zinc-900 h-48 sm:h-auto">
                      <img
                        src={getImageUrl(booking.Tour?.image)}
                        alt={booking.Tour?.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80";
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
                          <div>
                            <h3 className="text-xl font-bold text-white leading-tight">
                              {booking.Tour?.title}
                            </h3>
                            <span className="text-zinc-500 text-sm flex items-center gap-1.5 mt-2">
                              <FiMapPin size={14} />
                              {booking.Tour?.destination}
                            </span>
                          </div>
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded border ${status.cls}`}>
                            {status.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 mb-4 border-y border-white/5">
                          <div>
                            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-wider mb-1">Travel Date</p>
                            <p className="font-medium text-zinc-300 flex items-center gap-1.5 text-sm">
                              <FiCalendar className="text-zinc-500" />
                              {formatDate(booking.travel_date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-wider mb-1">Guests</p>
                            <p className="font-medium text-zinc-300 flex items-center gap-1.5 text-sm">
                              <FiUsers className="text-zinc-500" />
                              {booking.num_people}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-wider mb-1">Duration</p>
                            <p className="font-medium text-zinc-300 text-sm">
                              {booking.Tour?.duration_days} Days
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-wider mb-1">Total Paid</p>
                            <p className="font-bold text-white text-sm md:text-base">
                              {formatPrice(booking.total_price)}
                            </p>
                          </div>
                        </div>

                        {booking.special_requests && (
                          <div className="mb-6">
                            <p className="text-sm font-medium text-zinc-400 mb-1">Notes:</p>
                            <p className="text-sm text-zinc-500">{booking.special_requests}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 mt-4">
                        <Link
                          to={`/tours/${booking.tour_id}`}
                          className="text-xs font-semibold bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 px-4 py-2 rounded-lg transition-colors"
                        >
                          View Details
                        </Link>
                        {booking.status === "pending" && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="text-xs font-semibold border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 px-4 py-2 rounded-lg transition-colors"
                          >
                            Cancel Request
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;