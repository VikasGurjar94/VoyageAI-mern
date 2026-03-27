import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

/**
 * StarRating — display or interactive
 *
 * Props:
 *   rating   (number) — current value 0–5
 *   onChange (fn)     — if provided, renders clickable stars
 *   size     (number) — icon size in px, default 16
 *   color    (string) — star colour, default to Ethereal Gold
 */
const StarRating = ({ rating = 0, onChange, size = 16, color = "#e9c176" }) => {
  const stars = [1, 2, 3, 4, 5];

  if (onChange) {
    // Interactive
    return (
      <div className="flex items-center gap-2">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="cursor-pointer transition-all hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(233,193,118,0.5)]"
          >
            {star <= rating ? (
              <FaStar size={size} color={color} />
            ) : (
              <FaRegStar size={size} color={color} className="opacity-50" />
            )}
          </button>
        ))}
      </div>
    );
  }

  // Display only — supports half stars
  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => {
        if (star <= Math.floor(rating)) {
          return <FaStar key={star} size={size} color={color} className="drop-shadow-[0_0_2px_rgba(233,193,118,0.3)]" />;
        }
        if (star === Math.ceil(rating) && rating % 1 >= 0.5) {
          return <FaStarHalfAlt key={star} size={size} color={color} className="drop-shadow-[0_0_2px_rgba(233,193,118,0.3)]" />;
        }
        return <FaRegStar key={star} size={size} color={color} className="opacity-40" />;
      })}
    </div>
  );
};

export default StarRating;
