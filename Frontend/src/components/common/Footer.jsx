import { Link } from "react-router-dom";
import { FiMapPin, FiPhone, FiMail } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-[#131314] text-[#d1c5b4] pt-24 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-8 md:px-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
          
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="text-[#e9c176] text-2xl font-serif font-bold tracking-widest flex items-center gap-3">
              Voyage
            </Link>
              Discover the world's most stunning destinations with our expertly planned
              tours. Your unforgettable journey begins here.
          </div>

          {/* Quick Links */}
          <div className="md:ml-auto">
            <h4 className="text-[#e9c176] font-serif text-lg mb-6 tracking-wide">Quick Links</h4>
            <ul className="space-y-4 text-sm font-medium">
              {[
                { label: "All Tours", to: "/tours" },
                { label: "My Bookings", to: "/my-bookings" },
                { label: "Profile", to: "/profile" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-[#d1c5b4] hover:text-[#e9c176] transition-colors duration-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:ml-auto">
            <h4 className="text-[#e9c176] font-serif text-lg mb-6 tracking-wide">Contact Us</h4>
            <ul className="space-y-6 text-sm text-[#d1c5b4]/90">
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-[#1c1b1c] flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#201f20]">
                  <FiMapPin size={16} className="text-[#e9c176]" />
                </div>
                <span>Jaipur, Rajasthan, India</span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-[#1c1b1c] flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#201f20]">
                  <FiPhone size={16} className="text-[#e9c176]" />
                </div>
                <span>+91 9427XXXXXX</span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-[#1c1b1c] flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#201f20]">
                  <FiMail size={16} className="text-[#e9c176]" />
                </div>
                <span>concierge@voyagetravel.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sequence */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#4e4639]">
          <p>© {new Date().getFullYear()} Voyage Travel. All rights reserved.</p>
          <p>Voyage Tours</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
