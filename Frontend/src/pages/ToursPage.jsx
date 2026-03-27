import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchTours } from "../store/slices/tourSlice";
import Loader from "../components/common/Loader";
import TourCard from "../components/tours/TourCard";
import { FiFilter, FiSearch } from "react-icons/fi";

const ToursPage = () => {
  const dispatch = useDispatch();
  const { tours, loading, total, pages, currentPage } = useSelector((s) => s.tours);

  const [filters, setFilters] = useState({
    destination: "",
    minPrice: "",
    maxPrice: "",
    difficulty: "",
    sort: "",
    page: 1,
  });

  useEffect(() => {
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
    <div className="bg-[#09090b] min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">Explore Collections</h1>
          <p className="text-zinc-400 text-lg">{total} extraordinary journeys available</p>
        </header>

        {/* Filters */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 mb-12 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                name="destination"
                value={filters.destination}
                onChange={handleFilter}
                placeholder="Search destinations..."
                className="w-full bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:border-zinc-600 transition-colors"
              />
            </div>
            
            <div className="flex gap-4">
              <input
                name="minPrice"
                type="number"
                value={filters.minPrice}
                onChange={handleFilter}
                placeholder="Min $..."
                className="w-full sm:w-28 bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-zinc-600 transition-colors"
              />
              <input
                name="maxPrice"
                type="number"
                value={filters.maxPrice}
                onChange={handleFilter}
                placeholder="Max $..."
                className="w-full sm:w-28 bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-zinc-600 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 lg:w-auto">
             <div className="relative flex items-center">
              <FiFilter className="absolute left-3.5 text-zinc-500 pointer-events-none" size={16} />
              <select
                name="difficulty"
                value={filters.difficulty}
                onChange={handleFilter}
                className="w-full sm:w-40 appearance-none bg-zinc-900/50 border border-zinc-800 text-zinc-300 rounded-xl pl-10 pr-8 py-2.5 text-sm outline-none focus:border-zinc-600 transition-colors cursor-pointer"
              >
                <option value="">Difficulty</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <select
              name="sort"
              value={filters.sort}
              onChange={handleFilter}
              className="w-full sm:w-48 bg-zinc-900/50 border border-zinc-800 text-zinc-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-zinc-600 transition-colors cursor-pointer"
            >
              <option value="">Sort by: Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="duration">Shorter Duration</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="py-32 flex justify-center"><Loader /></div>
        ) : tours.length === 0 ? (
          <div className="py-32 text-center">
            <h3 className="text-xl text-white font-semibold mb-2">No journeys found</h3>
            <p className="text-zinc-500">Try adjusting your filters to find what you're looking for.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePage(p)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      p === currentPage 
                        ? 'bg-white text-black' 
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ToursPage;
