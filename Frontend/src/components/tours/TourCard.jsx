import { Link } from "react-router-dom";
import { FiMapPin, FiClock, FiUsers, FiStar } from "react-icons/fi";
import { formatPrice, getImageUrl } from "../../utils/helpers";

const difficultyConfig = {
  easy:     { label: "Easy",     bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  moderate: { label: "Moderate", bg: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  hard:     { label: "Hard",     bg: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
};

const TourCard = ({ tour }) => {
  const avgRating =
    tour.Reviews && tour.Reviews.length > 0
      ? (
          tour.Reviews.reduce((sum, r) => sum + r.rating, 0) /
          tour.Reviews.length
        ).toFixed(1)
      : null;

  const diff = difficultyConfig[tour.difficulty] || {
    label: tour.difficulty,
    bg: "bg-zinc-800 text-zinc-300 border-zinc-700",
  };

  return (
    <Link 
      to={`/tours/${tour.id}`}
      className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden group flex flex-col hover:border-white/10 transition-all duration-300 active:scale-[0.98]"
    >
      <div className="relative overflow-hidden h-56 bg-zinc-900 line-clamp-2">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent z-10"></div>
        
        <img
          src={getImageUrl(tour.image)}
          alt={tour.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80";
          }}
        />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border backdrop-blur-sm ${diff.bg}`}>
            {diff.label}
          </span>
          
          {avgRating && (
            <span className="bg-[#09090b]/80 backdrop-blur-sm border border-white/10 text-white text-[11px] font-semibold px-2 py-1 rounded flex items-center gap-1">
              <FiStar className="text-zinc-400 fill-zinc-400" size={10} />
              {avgRating}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 relative z-20 -mt-8">
        <h3 className="text-lg font-bold text-white mb-4 line-clamp-2 group-hover:text-zinc-300 transition-colors">
          {tour.title}
        </h3>

        <div className="flex flex-col gap-3 mb-6 flex-1">
          <div className="flex items-center gap-2.5 text-zinc-400 text-sm">
            <FiMapPin size={15} className="text-zinc-500" />
            <span className="truncate">{tour.destination}</span>
          </div>
          <div className="flex items-center gap-2.5 text-zinc-400 text-sm">
            <FiClock size={15} className="text-zinc-500" />
            <span>{tour.duration_days} Days</span>
          </div>
          <div className="flex items-center gap-2.5 text-zinc-400 text-sm">
            <FiUsers size={15} className="text-zinc-500" />
            <span>Up to {tour.max_group_size} travelers</span>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex items-end justify-between mt-auto">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-1">From</p>
            <span className="text-xl font-bold text-white">
              {formatPrice(tour.price)}
            </span>
          </div>
          <div className="text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors flex items-center gap-1 pb-1">
            Details
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-0.5 transition-transform" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12H19M19 12L12 5M19 12L12 19"/>
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TourCard;
