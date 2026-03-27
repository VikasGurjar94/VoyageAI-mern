import { Link } from "react-router-dom";
import { FiMapPin, FiClock, FiUsers } from "react-icons/fi";
import { formatPrice, getImageUrl } from "../../utils/helpers";

const difficultyConfig = {
  easy:     { label: "Easy",    color: "text-[#e9c176]", bg: "bg-[#e9c176]/10" },
  moderate: { label: "Moderate",  color: "text-[#d1c5b4]", bg: "bg-[#4e4639]/20" },
  hard:     { label: "Hard", color: "text-[#ffb4ab]", bg: "bg-[#ffb4ab]/10" },
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
    color: "text-[#d1c5b4]",
    bg: "bg-[#4e4639]/20"
  };

  return (
    <Link 
      to={`/tours/${tour.id}`}
      className="bg-[#1c1b1c] flex flex-col group transition-all duration-500 hover:-translate-y-2 relative overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
    >
      {/* Ghost Border */}
      <div className="absolute inset-0 border border-[#4e4639]/20 rounded-2xl pointer-events-none transition-colors duration-500 group-hover:border-[#e9c176]/30"></div>

      <div className="relative overflow-hidden h-[22rem] bg-[#0e0e0f]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1b1c] via-[#1c1b1c]/10 to-transparent z-10"></div>
        
        <img
          src={getImageUrl(tour.image)}
          alt={tour.title}
          className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80";
          }}
        />
        
        <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 backdrop-blur-md rounded-full ${diff.bg} ${diff.color}`}>
            {diff.label}
          </span>
          
          {avgRating && (
            <span className="bg-[#131314]/80 backdrop-blur-md border border-[#4e4639]/30 text-[#e9c176] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
              ★ {avgRating}
            </span>
          )}
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1 relative z-20 -mt-16 bg-gradient-to-t from-[#1c1b1c] to-transparent">
        <h3 className="text-2xl font-serif text-[#e5e2e3] mb-6 line-clamp-2 tracking-[0.02em] group-hover:text-[#e9c176] transition-colors duration-500">
          {tour.title}
        </h3>

        <div className="flex flex-col gap-4 mb-8 flex-1">
          <div className="flex items-center gap-4 text-[#d1c5b4] text-sm font-light">
            <div className="w-8 h-8 rounded-full bg-[#131314] flex items-center justify-center border border-[#4e4639]/30 text-[#e9c176]">
              <FiMapPin size={14} />
            </div>
            <span className="truncate">{tour.destination}</span>
          </div>
          <div className="flex items-center gap-4 text-[#d1c5b4] text-sm font-light">
            <div className="w-8 h-8 rounded-full bg-[#131314] flex items-center justify-center border border-[#4e4639]/30 text-[#e9c176]">
              <FiClock size={14} />
            </div>
            <span>{tour.duration_days} Days</span>
          </div>
          <div className="flex items-center gap-4 text-[#d1c5b4] text-sm font-light">
            <div className="w-8 h-8 rounded-full bg-[#131314] flex items-center justify-center border border-[#4e4639]/30 text-[#e9c176]">
              <FiUsers size={14} />
            </div>
            <span>Max group size: {tour.max_group_size}</span>
          </div>
        </div>

        <div className="pt-6 flex items-end justify-between mt-auto">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#d1c5b4]/70 mb-2">Price</p>
            <span className="text-2xl font-serif text-[#e9c176] tracking-wide">
              {formatPrice(tour.price)}
            </span>
          </div>
          <div className="text-sm font-semibold text-[#d1c5b4] group-hover:text-[#e9c176] transition-colors flex items-center gap-2 pb-1 border-b border-transparent group-hover:border-[#e9c176]">
            Details
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TourCard;
