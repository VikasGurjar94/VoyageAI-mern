import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTourById } from "../store/slices/tourSlice";
import { createBooking, clearBookingState } from "../store/slices/bookingSlice";
import Loader from "../components/common/Loader";
import { formatPrice, getImageUrl } from "../utils/helpers";
import { toast } from "react-toastify";
import { FiCalendar, FiUsers, FiFileText, FiMapPin, FiClock } from "react-icons/fi";
import { motion } from "framer-motion";

const BookingPage = () => {
  const { tourId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tour, loading: tourLoading } = useSelector((s) => s.tours);
  const { loading, success, error } = useSelector((s) => s.bookings);

  const [form, setForm] = useState({
    travel_date: "",
    num_people: 1,
    special_requests: "",
  });

  useEffect(() => {
    dispatch(fetchTourById(tourId));
  }, [tourId, dispatch]);

  useEffect(() => {
    if (success) {
      toast.success("Booking confirmed! 🎉");
      dispatch(clearBookingState());
      navigate("/my-bookings");
    }
    if (error) {
      toast.error(error);
      dispatch(clearBookingState());
    }
  }, [success, error, dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "num_people" ? parseInt(value) : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.travel_date) {
      toast.error("Please select a travel date");
      return;
    }
    dispatch(createBooking({ tour_id: parseInt(tourId), ...form }));
  };

  const totalPrice = tour ? tour.price * form.num_people : 0;

  // Get today's date in YYYY-MM-DD for min date
  const today = new Date().toISOString().split("T")[0];

  if (tourLoading) return <div className="py-32 flex justify-center"><Loader /></div>;
  if (!tour) return (
    <div className="min-h-screen flex items-center justify-center text-zinc-500 bg-[#09090b]">Tour not found.</div>
  );

  return (
    <div className="bg-[#09090b] min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate(`/tours/${tourId}`)}
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors mb-6 flex items-center gap-2 group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform">←</span> Back to experience
          </button>
          <h1 className="text-3xl font-bold text-white tracking-tight">Complete Your Reservation</h1>
          <p className="text-zinc-400 text-base mt-2">Fill in the details below to secure your adventure.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 md:p-10 relative overflow-hidden">
              <h2 className="text-xl font-bold text-white mb-8">Traveler Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                    <FiCalendar className="text-zinc-500" />
                    Preferred Travel Date
                  </label>
                  <input
                    type="date"
                    name="travel_date"
                    value={form.travel_date}
                    onChange={handleChange}
                    min={today}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-white focus:border-zinc-600 transition-colors"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                    <FiUsers className="text-zinc-500" />
                    Group Size
                    <span className="text-zinc-600 font-normal ml-1">(Max {tour.max_group_size})</span>
                  </label>
                  <input
                    type="number"
                    name="num_people"
                    value={form.num_people}
                    onChange={handleChange}
                    min={1}
                    max={tour.max_group_size}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-white focus:border-zinc-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                    <FiFileText className="text-zinc-500" />
                    Special Requests
                    <span className="text-zinc-600 font-normal ml-1">(Optional)</span>
                  </label>
                  <textarea
                    name="special_requests"
                    value={form.special_requests}
                    onChange={handleChange}
                    placeholder="Dietary requirements, accessibility needs..."
                    rows={4}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-white focus:border-zinc-600 transition-colors resize-none"
                  />
                </div>

                <div className="pt-4 mt-8 border-t border-white/5">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-xl text-black font-semibold transition-colors flex items-center justify-center ${
                      loading
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : "bg-white hover:bg-zinc-200"
                    }`}
                  >
                    {loading ? "Processing..." : `Confirm & Pay — ${formatPrice(totalPrice)}`}
                  </button>
                  <p className="text-center text-xs text-zinc-600 mt-4 flex items-center justify-center gap-2">
                    <span>🔒 Secure booking</span> • <span>Free cancellation up to 48 hours</span>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Tour Summary */}
          <div className="lg:col-span-2">
            <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden sticky top-28">
              <div className="relative h-48 sm:h-56 bg-zinc-900">
                <img
                  src={getImageUrl(tour.image)}
                  alt={tour.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
              </div>
              
              <div className="p-6 sm:p-8 relative z-10">
                <h3 className="font-bold text-xl text-white mb-4">{tour.title}</h3>
                
                <div className="flex flex-wrap gap-3 text-zinc-400 text-sm mb-6">
                  <span className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                    <FiMapPin className="text-zinc-500" /> {tour.destination}
                  </span>
                  <span className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                    <FiClock className="text-zinc-500" /> {tour.duration_days} days
                  </span>
                </div>

                <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800/50 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Price Breakdown</h4>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">Price per person</span>
                    <span className="font-medium text-white">{formatPrice(tour.price)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">Group Size</span>
                    <span className="font-medium text-white">× {form.num_people}</span>
                  </div>
                  
                  <div className="flex justify-between items-center font-bold pt-4 border-t border-zinc-800">
                    <span className="text-white">Total</span>
                    <span className="text-white text-lg">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;