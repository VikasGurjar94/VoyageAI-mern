import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchTours } from "../store/slices/tourSlice";
import Loader from "../components/common/Loader";
import { formatPrice, getImageUrl } from "../utils/helpers";

const ToursPage = () => {
  const dispatch = useDispatch();
  const { tours, loading, total, pages, currentPage } = useSelector(
    (s) => s.tours,
  );

  const [filters, setFilters] = useState({
    destination: "",
    minPrice: "",
    maxPrice: "",
    difficulty: "",
    sort: "",
    page: 1,
  });

  // fetch tours whenever filters change
  useEffect(() => {
    // strip empty values before sending
    const clean = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== ""),
    );
    dispatch(fetchTours(clean));
  }, [filters, dispatch]);

  const handleFilter = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handlePage = (p) => setFilters({ ...filters, page: p });

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Explore Tours</h1>
      <p style={styles.sub}>{total} tours available</p>

      {/* Filters */}
      <div style={styles.filterRow}>
        <input
          name="destination"
          value={filters.destination}
          onChange={handleFilter}
          placeholder="Search destination..."
          style={styles.input}
        />
        <input
          name="minPrice"
          type="number"
          value={filters.minPrice}
          onChange={handleFilter}
          placeholder="Min price"
          style={styles.input}
        />
        <input
          name="maxPrice"
          type="number"
          value={filters.maxPrice}
          onChange={handleFilter}
          placeholder="Max price"
          style={styles.input}
        />
        <select
          name="difficulty"
          value={filters.difficulty}
          onChange={handleFilter}
          style={styles.select}
        >
          <option value="">All levels</option>
          <option value="easy">Easy</option>
          <option value="moderate">Moderate</option>
          <option value="hard">Hard</option>
        </select>
        <select
          name="sort"
          value={filters.sort}
          onChange={handleFilter}
          style={styles.select}
        >
          <option value="">Sort by</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="duration">Duration</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div style={styles.grid}>
            {tours.map((tour) => (
              <div key={tour.id} style={styles.card}>
                <img
                  src={getImageUrl(tour.image)}
                  alt={tour.title}
                  style={styles.img}
                  onError={(e) => {
                    e.target.src = "/placeholder.jpg";
                  }}
                />
                <div style={styles.cardBody}>
                  <span style={styles.badge}>{tour.difficulty}</span>
                  <h3 style={styles.cardTitle}>{tour.title}</h3>
                  <p style={styles.destination}>📍 {tour.destination}</p>
                  <p style={styles.duration}>🕐 {tour.duration_days} days</p>
                  <div style={styles.cardFooter}>
                    <span style={styles.price}>{formatPrice(tour.price)}</span>
                    <Link to={`/tours/${tour.id}`} style={styles.btn}>
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={styles.pagination}>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePage(p)}
                  style={p === currentPage ? styles.pageActive : styles.pageBtn}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  page: { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" },
  heading: { fontSize: "32px", fontWeight: "700", color: "#111827" },
  sub: { color: "#6b7280", margin: "8px 0 28px", fontSize: "15px" },
  filterRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "32px",
  },
  input: {
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    flex: 1,
    minWidth: "160px",
  },
  select: {
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    minWidth: "140px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
  },
  img: { width: "100%", height: "200px", objectFit: "cover" },
  cardBody: { padding: "16px" },
  badge: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "2px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    margin: "10px 0 6px",
    color: "#111827",
  },
  destination: { color: "#6b7280", fontSize: "14px", marginBottom: "4px" },
  duration: { color: "#6b7280", fontSize: "14px", marginBottom: "14px" },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: { fontSize: "20px", fontWeight: "700", color: "#e94560" },
  btn: {
    background: "#e94560",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
  },
  pagination: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    marginTop: "40px",
  },
  pageBtn: {
    padding: "8px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    background: "#fff",
    cursor: "pointer",
  },
  pageActive: {
    padding: "8px 14px",
    border: "1px solid #e94560",
    borderRadius: "6px",
    background: "#e94560",
    color: "#fff",
    cursor: "pointer",
  },
};

export default ToursPage;
