import "./index.css";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";


import { Link, Navigate } from "react-router-dom";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaArrowRight,
  FaShieldAlt,
  FaHome,
  FaUsers,
  FaBuilding,
  FaHeadset,
  FaHeart,
} from "react-icons/fa";
import {  MdLocationOn,
  MdPhone,
  MdEmail,
  MdSecurity,
  MdDashboard, } from "react-icons/md";
  import { motion } from "framer-motion";

import Landing from "./pages/Landing";
import ResidentLogin from "./pages/Login/ResidentLogin";
import AdminLogin from "./pages/Login/AdminLogin";
import SecurityLogin from "./pages/Login/SecurityLogin";
import ResidentSignup from "./pages/Signup/ResidentSignup";
import SecuritySignup from "./pages/Signup/SecuritySignup";
import ResidentDashboard from "./pages/dashboard/ResidentDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import SecurityDashboard from "./pages/dashboard/SecurityDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AIChatBot from "./components/AIChatBot";

import GateDashboard from "./pages/SecurityDashboard";
import NotFound from "./pages/NotFound";
import RegisterSociety from "./pages/RegisterSociety";
import FindSociety from "./pages/AllSociety";



///////////////new onne ////////////////

function App() {
  const Footer = () => (
    <footer className="bg-black text-white pt-12 pb-6 z-20 max-h-full">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          {/* Company Info */}
          <div className="w-full md:w-1/4 mb-8 md:mb-0">
            <h3 className="text-4xl font-bold mb-4">UrbanNest</h3>
            <p className="mb-4 text-gray-400">
              Connecting residents, administration, and security for a safer,
              more organized community living.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaLinkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="w-full sm:w-1/2 md:w-1/4 mb-8 md:mb-0 mx-auto">
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/login/resident"
                  className="text-gray-400 hover:text-white transition"
                >
                  Resident Login
                </Link>
              </li>
              <li>
                <Link
                  to="/login/admin"
                  className="text-gray-400 hover:text-white transition"
                >
                  Admin Login
                </Link>
              </li>
              <li>
                <Link
                  to="/login/security"
                  className="text-gray-400 hover:text-white transition"
                >
                  Security Login
                </Link>
              </li>
              <li>
                <Link
                  to="/signup/resident"
                  className="text-gray-400 hover:text-white transition"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="w-full sm:w-1/2 md:w-1/4 mb-8 md:mb-0">
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Community Guidelines
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="w-full md:w-1/4">
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MdLocationOn className="mt-1 mr-2 flex-shrink-0" />
                <span className="text-gray-400">LUCKNOW, 226028</span>
              </li>
              <li className="flex items-center">
                <MdPhone className="mr-2" />
                <span className="text-gray-400">+91 1234567890</span>
              </li>
              <li className="flex items-center">
                <MdEmail className="mr-2" />
                <span className="text-gray-400">support@Nestmate.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright and Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Community Portal. All rights
            reserved.
          </p>
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-gray-400 hover:text-white text-sm transition"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white text-sm transition"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white text-sm transition"
            >
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <Provider store={store}>
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/login/resident" element={<ResidentLogin />} />
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/login/security" element={<SecurityLogin />} />
          <Route path="/signup/resident" element={<ResidentSignup />} />
          <Route path="/signup/security" element={<SecuritySignup />} />
        
          <Route path="/services" element={<GateDashboard />} />
          <Route path="/register-society" element={<RegisterSociety />} />
           <Route path="/FindSociety" element={<FindSociety />} />


          <Route element={<ProtectedRoute />}>
            <Route path="/resident/dashboard" element={<ResidentDashboard />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/security/dashboard" element={<SecurityDashboard />} />
          </Route>
        </Routes>
      </div>
      <Footer />
      <AIChatBot />
    </div>
    </Provider>
  );
}

export default App;
