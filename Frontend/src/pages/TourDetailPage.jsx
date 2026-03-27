import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTourById } from "../store/slices/tourSlice";
import { fetchReviews, submitReview, clearReviewState } from "../store/slices/reviewSlice";
import Loader from "../components/common/Loader";
import StarRating from "../components/common/StarRating";
import { formatPrice, formatDate, getImageUrl } from "../utils/helpers";
import { toast } from "react-toastify";
import { FiMapPin, FiClock, FiUsers, FiStar, FiChevronLeft } from "react-icons/fi";
import { FaQuoteLeft } from "react-icons/fa";

const difficultyConfig = {
  easy:     { label: "Easy",     cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
  moderate: { label: "Moderate", cls: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
  hard:     { label: "Hard",     cls: "bg-rose-500/10 text-rose-400 border border-rose-500/20" },
};

const TourDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tour, loading } = useSelector((s) => s.tours);
  const { reviews, loading: reviewLoading, submitSuccess, error: reviewError } =
    useSelector((s) => s.reviews);
  const { user } = useSelector((s) => s.auth);

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    dispatch(fetchTourById(id));
    dispatch(fetchReviews(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (submitSuccess) {
      toast.success("Review submitted!");
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: "" });
      dispatch(clearReviewState());
    }
    if (reviewError) {
      toast.error(reviewError);
      dispatch(clearReviewState());
    }
  }, [submitSuccess, reviewError, dispatch]);

  if (loading) return <div className="py-32 flex justify-center"><Loader /></div>;
  if (!tour) return (
    <div className="min-h-screen flex items-center justify-center text-zinc-500 text-lg bg-[#09090b]">
      Tour not found.
    </div>
  );

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const diff = difficultyConfig[tour.difficulty] || { label: tour.difficulty, cls: "bg-zinc-800 text-zinc-300 border-zinc-700" };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!user) { toast.error("Please login to write a review"); return; }
    dispatch(submitReview({ tourId: id, ...reviewForm }));
  };

  return (
    <div className="bg-[#09090b] min-h-screen pb-20">
      {/* ── HERO IMAGE ─────────────────────────────────────────── */}
      <div className="relative h-[60vh] md:h-[70vh] w-full">
        <img
          src={getImageUrl(tour.image)}
          alt={tour.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-black/30" />
        
        <div className="absolute top-24 left-6 z-20">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors bg-black/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
            <FiChevronLeft size={16} /> Back
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full z-10">
          <div className="max-w-6xl mx-auto px-6 pb-12 w-full">
            <div className="max-w-3xl">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded inline-block mb-4 backdrop-blur-sm border ${diff.cls}`}>
                {diff.label}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                {tour.title}
              </h1>
              
              <div className="flex items-center gap-4 text-zinc-300 text-sm flex-wrap">
                <span className="flex items-center gap-2 font-medium">
                  <FiMapPin className="text-white" size={16} /> {tour.destination}
                </span>
                <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                <span className="flex items-center gap-2 font-medium">
                  <FiClock className="text-white" size={16} /> {tour.duration_days} days
                </span>
                {avgRating > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <FiStar className="text-white fill-white" size={16} />
                      <span className="text-white">{avgRating.toFixed(1)}</span>
                      <span className="text-zinc-500 font-normal">({reviews.length} reviews)</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

          {/* Left — main content */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Info grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Price",      value: formatPrice(tour.price), icon: <span className="text-lg">₹</span> },
                { label: "Duration",   value: `${tour.duration_days} Days`,  icon: <FiClock size={16} /> },
                { label: "Group Size", value: `Max ${tour.max_group_size}`,  icon: <FiUsers size={16} /> },
                { label: "Difficulty", value: tour.difficulty,               icon: <FiStar size={16} /> },
              ].map(({ label, value, icon }, idx) => (
                <div key={idx} className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 text-center flex flex-col items-center justify-center">
                  <div className="text-zinc-500 mb-2">
                    {icon}
                  </div>
                  <p className="font-semibold text-white text-base mb-1 truncate w-full">{value}</p>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">The Experience</h2>
              <div className="prose prose-invert max-w-none text-zinc-400 font-light leading-loose text-lg">
                <p className="whitespace-pre-line">{tour.description}</p>
              </div>
            </div>

            <hr className="border-white/5" />

            {/* Reviews */}
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Traveler Reviews
                  <span className="text-zinc-500 font-normal ml-2">({reviews.length})</span>
                </h2>
                {user && (
                  <button
                    onClick={() => setShowReviewForm((v) => !v)}
                    className="border border-zinc-800 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    {showReviewForm ? "Cancel" : "Write a Review"}
                  </button>
                )}
              </div>

              {/* Review form */}
              {showReviewForm && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="p-6 bg-[#0a0a0a] rounded-xl border border-white/5 space-y-6"
                >
                  <div>
                    <label className="text-sm font-medium text-zinc-400 mb-3 block">Your Rating</label>
                    <StarRating
                      rating={reviewForm.rating}
                      onChange={(r) => setReviewForm({ ...reviewForm, rating: r })}
                      size={24}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-400 mb-3 block">Comment</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="Share your experience..."
                      rows={4}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-zinc-500 outline-none transition-colors resize-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={reviewLoading}
                      className="bg-white text-black px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-200 transition-colors"
                    >
                      {reviewLoading ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </form>
              )}

              {/* Review cards */}
              {reviews.length === 0 ? (
                <div className="text-left py-8 text-zinc-500 bg-[#0a0a0a] rounded-xl border border-dashed border-zinc-800 px-6">
                  No reviews yet. Be the first to share your experience!
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {reviews.map((r) => (
                    <div 
                      key={r.id} 
                      className="p-5 bg-[#0a0a0a] border border-white/5 rounded-xl flex gap-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                        {r.User?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-white text-sm">{r.User?.name || "Anonymous"}</span>
                          <span className="text-[11px] text-zinc-500 uppercase tracking-widest">{formatDate(r.createdAt)}</span>
                        </div>
                        <div className="mb-3">
                          <StarRating rating={r.rating} size={12} />
                        </div>
                        {r.comment && (
                          <div className="relative">
                            <FaQuoteLeft className="absolute -left-1.5 -top-1 text-white/5 text-lg" />
                            <p className="text-zinc-400 text-sm leading-relaxed pl-5 font-light">
                              {r.comment}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 md:p-8 sticky top-28">
              <h3 className="text-xl font-bold text-white mb-2">Reserve Your Spot</h3>
              <p className="text-zinc-500 text-sm mb-6 leading-relaxed">Secure your booking today to guarantee your extraordinary adventure.</p>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-zinc-400 font-medium text-sm">Price per person</span>
                  <span className="font-bold text-2xl text-white">{formatPrice(tour.price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-medium text-sm">Duration</span>
                  <span className="text-white text-sm font-medium">{tour.duration_days} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-medium text-sm">Available slots</span>
                  <span className="text-white text-sm font-medium">{tour.max_group_size}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!user) { navigate("/login"); return; }
                  navigate(`/book/${tour.id}`);
                }}
                className="w-full bg-white text-black font-semibold py-3.5 rounded-lg text-sm hover:bg-zinc-200 transition-colors"
              >
                Book This Experience
              </button>

              {!user && (
                <p className="text-center text-zinc-500 text-xs mt-4">
                  Please{" "}
                  <button onClick={() => navigate("/login")} className="text-white font-medium hover:underline transition-colors">
                    sign in
                  </button>{" "}
                  to secure your booking
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;