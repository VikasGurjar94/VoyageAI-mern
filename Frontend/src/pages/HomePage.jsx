import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTours } from "../store/slices/tourSlice";
import TourCard from "../components/tours/TourCard";
import Loader from "../components/common/Loader";
import { FiSearch, FiShield, FiThumbsUp, FiHeadphones } from "react-icons/fi";
import { FaPlane, FaUsers, FaMapMarkedAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const whyCards = [
  {
    icon: <FiShield size={24} />,
    title: "Safe & Secure",
    desc: "All tours are rigorously vetted with premium safety standards and trusted local guides.",
  },
  {
    icon: <FiThumbsUp size={24} />,
    title: "Price Match",
    desc: "We guarantee the best rates. No hidden fees, completely transparent billing always.",
  },
  {
    icon: <FiHeadphones size={24} />,
    title: "24/7 Support",
    desc: "Our travel experts are available round the clock to ensure flawless experiences.",
  },
];

const statItems = [
  { icon: <FaPlane />, value: "500+", label: "Curated Tours" },
  { icon: <FaUsers />,  value: "15K+", label: "Elite Travelers" },
  { icon: <FaMapMarkedAlt />, value: "80+", label: "Destinations" },
];

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tours, loading } = useSelector((s) => s.tours);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchTours({ limit: 6 }));
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/tours${search ? `?destination=${search}` : ""}`);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="bg-[#09090b]">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-10 overflow-hidden isolate">
        {/* Minimal dot pattern background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-20 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]"></div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto w-full">
          <motion.div initial="hidden" animate="show" variants={staggerContainer} className="flex flex-col items-center">
            
            <motion.span variants={fadeIn} className="text-zinc-500 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 border border-white/10 uppercase tracking-[0.15em]">
              Premium Travel Experiences
            </motion.span>
            
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6 tracking-tight">
              Discover the <br className="hidden md:block" />
              <span className="text-zinc-300">
                Extraordinary
              </span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-zinc-400 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
              Elevate your journey with our meticulously crafted luxury tours. Immersion, comfort, and unforgettable memories await.
            </motion.p>

            {/* Clean minimal search bar */}
            <motion.form
              variants={fadeIn}
              onSubmit={handleSearch}
              className="flex items-center w-full max-w-xl bg-zinc-900/50 border border-white/10 rounded-xl p-2 focus-within:border-zinc-700 focus-within:bg-zinc-900 transition-all"
            >
              <div className="flex-1 flex items-center px-4 gap-3 text-zinc-500">
                <FiSearch size={20} className="shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Where is your next escape?"
                  className="w-full bg-transparent text-white placeholder-zinc-600 outline-none border-none py-2 text-base"
                />
              </div>
              <button
                type="submit"
                className="bg-white text-black px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors hover:bg-zinc-200 shrink-0"
              >
                Explore
              </button>
            </motion.form>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 divide-y md:divide-y-0 md:divide-x divide-white/5 place-items-center">
            {statItems.map(({ icon, value, label }, idx) => (
              <motion.div 
                key={label} 
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                className={`flex flex-col items-center justify-center gap-2 pt-8 md:pt-0 w-full ${idx === 0 ? 'pt-0' : ''}`}
              >
                <div className="text-zinc-600 mb-2">
                  {icon}
                </div>
                <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
                <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest">{label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED TOURS ────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-zinc-500 font-semibold text-xs uppercase tracking-widest mb-3 block">
                Handpicked Curations
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Featured Journeys</h2>
            </div>
            <button
              onClick={() => navigate("/tours")}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group"
            >
              View All Collections
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><Loader /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY CHOOSE US ─────────────────────────────────────── */}
      <section className="py-24 border-t border-white/5 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Uncompromising Excellence</h2>
            <p className="text-zinc-400 max-w-xl text-base">We redefine exploration with a commitment to quality, security, and unparalleled service.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyCards.map(({ icon, title, desc }, idx) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                className="p-8 border border-white/5 bg-[#09090b] rounded-2xl hover:border-white/10 transition-colors"
              >
                <div className="text-zinc-300 mb-6">
                  {icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────── */}
      <section className="py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="p-12 md:p-20 rounded-3xl border border-white/10 bg-zinc-900 border-t border-zinc-800 flex flex-col items-center text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Begin Your Next Chapter
            </h2>
            <p className="text-zinc-400 mb-10 text-lg max-w-xl">
              Join our exclusive community of global explorers and turn your dream destinations into reality today.
            </p>
            <button
              onClick={() => navigate("/tours")}
              className="bg-white text-black font-semibold px-8 py-3.5 rounded-lg text-sm hover:bg-zinc-200 transition-colors inline-flex items-center gap-2 group"
            >
              Curated Collections
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;