import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, ArrowLeft, Building, Shield, Users } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    console.error("404 Page:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center overflow-hidden">
      {/* Floating gradient orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/20 blur-3xl rounded-full animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-400/20 blur-3xl rounded-full animate-pulse"></div>

      {/* Main Card */}
      <div
        className={`relative z-10 backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl rounded-3xl p-12 max-w-2xl text-center transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
          <Building size={40} />
        </div>

        {/* 404 */}
        <h1 className="text-7xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          404
        </h1>

        {/* Heading */}
        <h2 className="text-3xl font-bold text-slate-800 mb-3">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-slate-600 text-lg mb-6">
          The page you are trying to access does not exist in the UrbanNest
          community system. It may have been moved or removed.
        </p>

        {/* Current Route */}
        <div className="bg-slate-100 rounded-xl p-4 mb-8">
          <p className="text-sm text-slate-500 mb-1">Requested Path</p>
          <code className="text-blue-600 font-mono">{location.pathname}</code>
        </div>

        {/* Buttons */}
        <div className="flex justify-center items-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-5 rounded-xl font-semibold hover:scale-105 transition"
          >
            <Home size={18} />
            Home
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="flex justify-center gap-6 mt-10 text-sm text-slate-500">
          <Link to="/about" className="hover:text-blue-600">
            About
          </Link>

          <Link to="/contact" className="hover:text-blue-600">
            Contact
          </Link>

          <Link to="/help" className="hover:text-blue-600">
            Help Center
          </Link>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-xs text-slate-400">
          UrbanNest Society Management System
        </p>
      </div>
    </div>
  );
};

export default NotFound;
