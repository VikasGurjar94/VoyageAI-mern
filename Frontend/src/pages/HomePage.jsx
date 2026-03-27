import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTours } from "../store/slices/tourSlice";
import { formatPrice, getImageUrl } from "../utils/helpers";

const HomePage = () => {
  const dispatch = useDispatch();
  const { tours } = useSelector((s) => s.tours);

  useEffect(() => {
    // fetch latest 6 tours for the featured section
    dispatch(fetchTours({ limit: 6, sort: "price_asc" }));
  }, [dispatch]);

  return (
    <div>
      {/* Hero section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Discover the World <br />
            <span style={styles.heroHighlight}>Your Way</span>
          </h1>
          <p style={styles.heroSub}>
            Handpicked tours across India's most breathtaking destinations. Book
            in minutes, travel with confidence.
          </p>
          <div style={styles.heroButtons}>
            <Link to="/tours" style={styles.heroBtnPrimary}>
              Explore Tours
            </Link>
            <Link to="/register" style={styles.heroBtnSecondary}>
              Join Free
            </Link>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={styles.statsBar}>
        {[
          { value: "50+", label: "Tours Available" },
          { value: "1000+", label: "Happy Travellers" },
          { value: "20+", label: "Destinations" },
          { value: "4.8⭐", label: "Average Rating" },
        ].map(({ value, label }) => (
          <div key={label} style={styles.statItem}>
            <span style={styles.statValue}>{value}</span>
            <span style={styles.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* Featured tours */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Featured Tours</h2>
        <p style={styles.sectionSub}>
          Handpicked experiences for every traveller
        </p>

        <div style={styles.grid}>
          {tours.map((tour) => (
            <div key={tour.id} style={styles.card}>
              <img
                src={getImageUrl(tour.image)}
                alt={tour.title}
                style={styles.cardImg}
                onError={(e) => {
                  e.target.src = "/placeholder.jpg";
                }}
              />
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{tour.title}</h3>
                <p style={styles.cardDest}>📍 {tour.destination}</p>
                <p style={styles.cardDur}>🕐 {tour.duration_days} days</p>
                <div style={styles.cardFooter}>
                  <span style={styles.cardPrice}>
                    {formatPrice(tour.price)}
                  </span>
                  <Link to={`/tours/${tour.id}`} style={styles.cardBtn}>
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.viewAll}>
          <Link to="/tours" style={styles.viewAllBtn}>
            View All Tours →
          </Link>
        </div>
      </div>

      {/* Why us section */}
      <div style={styles.whySection}>
        <h2 style={styles.sectionTitle}>Why Choose Voyage?</h2>
        <div style={styles.whyGrid}>
          {[
            {
              icon: "🛡️",
              title: "Safe & Trusted",
              desc: "All tours are verified and curated by our expert team.",
            },
            {
              icon: "💰",
              title: "Best Prices",
              desc: "Competitive pricing with no hidden charges ever.",
            },
            {
              icon: "📱",
              title: "Easy Booking",
              desc: "Book your dream tour in just a few clicks.",
            },
            {
              icon: "⭐",
              title: "Top Rated",
              desc: "Thousands of happy travellers rate us 4.8 out of 5.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={styles.whyCard}>
              <div style={styles.whyIcon}>{icon}</div>
              <h3 style={styles.whyTitle}>{title}</h3>
              <p style={styles.whyDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA section */}
      <div style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to explore?</h2>
        <p style={styles.ctaSub}>
          Join thousands of travellers discovering India with Voyage.
        </p>
        <Link to="/register" style={styles.ctaBtn}>
          Get Started — It's Free
        </Link>
      </div>
    </div>
  );
};

const styles = {
  hero: {
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    minHeight: "520px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    textAlign: "center",
  },
  heroContent: { maxWidth: "700px" },
  heroTitle: {
    fontSize: "52px",
    fontWeight: "800",
    color: "#fff",
    lineHeight: "1.2",
    marginBottom: "20px",
  },
  heroHighlight: { color: "#e94560" },
  heroSub: {
    fontSize: "18px",
    color: "#9ca3af",
    marginBottom: "36px",
    lineHeight: "1.7",
  },
  heroButtons: { display: "flex", gap: "16px", justifyContent: "center" },
  heroBtnPrimary: {
    background: "#e94560",
    color: "#fff",
    padding: "14px 32px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "16px",
    textDecoration: "none",
  },
  heroBtnSecondary: {
    background: "transparent",
    color: "#fff",
    padding: "14px 32px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "16px",
    textDecoration: "none",
    border: "2px solid #fff",
  },
  statsBar: {
    background: "#fff",
    display: "flex",
    justifyContent: "center",
    gap: "60px",
    padding: "32px 20px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    flexWrap: "wrap",
  },
  statItem: { textAlign: "center" },
  statValue: {
    display: "block",
    fontSize: "28px",
    fontWeight: "800",
    color: "#e94560",
  },
  statLabel: {
    display: "block",
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "4px",
  },
  section: { maxWidth: "1200px", margin: "0 auto", padding: "60px 20px" },
  sectionTitle: {
    fontSize: "30px",
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: "8px",
  },
  sectionSub: { textAlign: "center", color: "#6b7280", marginBottom: "40px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "#fff",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
  },
  cardImg: { width: "100%", height: "190px", objectFit: "cover" },
  cardBody: { padding: "16px" },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "6px",
  },
  cardDest: { fontSize: "13px", color: "#6b7280", marginBottom: "3px" },
  cardDur: { fontSize: "13px", color: "#6b7280", marginBottom: "14px" },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardPrice: { fontSize: "18px", fontWeight: "800", color: "#e94560" },
  cardBtn: {
    background: "#e94560",
    color: "#fff",
    padding: "7px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none",
  },
  viewAll: { textAlign: "center", marginTop: "40px" },
  viewAllBtn: {
    display: "inline-block",
    border: "2px solid #e94560",
    color: "#e94560",
    padding: "12px 32px",
    borderRadius: "10px",
    fontWeight: "700",
    textDecoration: "none",
    fontSize: "15px",
  },
  whySection: { background: "#f9fafb", padding: "60px 20px" },
  whyGrid: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "24px",
    marginTop: "40px",
  },
  whyCard: {
    background: "#fff",
    borderRadius: "14px",
    padding: "28px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  whyIcon: { fontSize: "36px", marginBottom: "14px" },
  whyTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "8px",
  },
  whyDesc: { fontSize: "14px", color: "#6b7280", lineHeight: "1.6" },
  cta: { background: "#1a1a2e", padding: "60px 20px", textAlign: "center" },
  ctaTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#fff",
    marginBottom: "12px",
  },
  ctaSub: { color: "#9ca3af", fontSize: "16px", marginBottom: "28px" },
  ctaBtn: {
    display: "inline-block",
    background: "#e94560",
    color: "#fff",
    padding: "14px 36px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "16px",
    textDecoration: "none",
  },
};

export default HomePage;
