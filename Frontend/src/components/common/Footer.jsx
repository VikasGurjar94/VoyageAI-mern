import { Link } from "react-router-dom";
import { FiMapPin, FiPhone, FiMail } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-[#09090b] text-zinc-400 pt-16 pb-8 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="text-white text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="text-primary">✈</span> Voyage
            </Link>
            <p className="text-sm leading-relaxed text-zinc-500 max-w-xs">
              Discover the world's most stunning destinations with our expertly crafted
              tour packages. Your dream journey starts here.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wide uppercase">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Home", to: "/" },
                { label: "All Tours", to: "/tours" },
                { label: "My Bookings", to: "/my-bookings" },
                { label: "Profile", to: "/profile" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-zinc-500 hover:text-white transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wide uppercase">Contact Us</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <FiMapPin size={14} className="text-primary" />
                </div>
                Jaipur, Rajasthan, India
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <FiPhone size={14} className="text-primary" />
                </div>
                +91 9427XXXXXX
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <FiMail size={14} className="text-primary" />
                </div>
                hello@voyagetravel.in
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} Voyage Travel. All rights reserved.</p>
          <p>Built with <span className="text-rose-500">❤️</span> in India</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
