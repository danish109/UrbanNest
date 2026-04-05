import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import {
  FaArrowRight,
  FaShieldAlt,
  FaUsers,
  FaUserCog,
  FaQrcode,
  FaBell,
  FaChartLine,
  FaMobileAlt,
  FaLock,
  FaPlay,
  FaStar,
  FaCheckCircle,
  FaHome,
  FaCog,
  FaEye,
  FaWifi,
  FaCloud,
  FaRocket,
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaTwitter,
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaCamera,
  FaCalendarAlt,
  FaFileAlt,
  FaCreditCard,
  FaHeadset,
  FaAward,
  FaMoneyBillWave,
  FaTimesCircle,
  FaBuilding,
  FaCar,
  FaLightbulb,
  FaTools,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import heroBuilding from "../assets/hero-building.png";
import ContactSection from "../components/ContactSection";
import patternBg from "../assets/pattern-bg.jpg";
import teamCollaboration from "../assets/team-collaboration.jpg";
import securityDashboard from "../assets/security-dashboard.jpg";
import logo from "../assets/logo6.png";

const LandingPageComplete = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState("monthly");
  const [openFaq, setOpenFaq] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("features");
  const heroRef = useRef(null);

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.getAttribute("data-section") || "default"]: true,
            }));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" },
    );

    const sections = document.querySelectorAll("[data-section]");
    sections.forEach((section) => observer.observe(section));

    // Initial hero animation
    setTimeout(() => setIsVisible((prev) => ({ ...prev, hero: true })), 300);

    return () => observer.disconnect();
  }, []);

   useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ["features", "services", "pricing", "about", "contact"];
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) {
          setActive(id);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = (role) => {
    if (role === "Resident") navigate("/login/resident");
    else if (role === "Admin") navigate("/login/admin");
    else if (role === "Security") navigate("/login/security");
  };

  // Embedded styles to replace tailwind config
  const embeddedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
    
    :root {
      --brand-primary: 59 130 246;
      --brand-secondary: 139 92 246;
      --brand-accent: 236 72 153;
      --brand-success: 34 197 94;
      --brand-warning: 251 191 36;
      --brand-danger: 239 68 68;
      --glass-bg: rgba(255, 255, 255, 0.1);
      --glass-border: rgba(255, 255, 255, 0.2);
    }

    .font-display { font-family: 'Poppins', sans-serif; }
    .font-sans { font-family: 'Inter', sans-serif; }
    
    .glass {
      background: var(--glass-bg);
      backdrop-filter: blur(16px);
      border: 1px solid var(--glass-border);
    }
    
    .btn-primary {
      background: linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)));
      color: white;
      padding: 0.875rem 2rem;
      border-radius: 1rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 25px -8px rgba(var(--brand-primary), 0.5);
      position: relative;
      overflow: hidden;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 35px -8px rgba(var(--brand-primary), 0.6);
    }
    
    .btn-secondary {
      background: rgba(255, 255, 255, 0.9);
      color: rgb(51, 65, 85);
      padding: 0.875rem 2rem;
      border-radius: 1rem;
      font-weight: 600;
      border: 1px solid rgba(255, 255, 255, 0.3);
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(8px);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 1);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.1);
    }
    
    .card-hover {
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .card-hover:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    
    .hover-glow:hover {
      box-shadow: 0 0 40px rgba(var(--brand-primary), 0.3);
    }
    
    .underline-animated {
      position: relative;
    }
    
    .underline-animated::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 2px;
      bottom: -4px;
      left: 0;
      background: linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)));
      transform: scaleX(0);
      transform-origin: bottom right;
      transition: transform 0.3s ease;
    }
    
    .underline-animated:hover::after {
      transform: scaleX(1);
      transform-origin: bottom left;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-20px) rotate(1deg); }
      66% { transform: translateY(-10px) rotate(-1deg); }
    }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeInLeft {
      from { opacity: 0; transform: translateX(-40px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes fadeInRight {
      from { opacity: 0; transform: translateX(40px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes zoomIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(60px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-fade-in-up { animation: fadeInUp 0.8s ease-out; }
    .animate-fade-in-left { animation: fadeInLeft 0.8s ease-out; }
    .animate-fade-in-right { animation: fadeInRight 0.8s ease-out; }
    .animate-fade-in-down { animation: fadeInDown 0.8s ease-out; }
    .animate-zoom-in { animation: zoomIn 0.3s ease-out; }
    .animate-slide-up { animation: slideUp 0.8s ease-out; }
    
    .animate-stagger-1 { animation-delay: 0.1s; }
    .animate-stagger-2 { animation-delay: 0.2s; }
    .animate-stagger-3 { animation-delay: 0.3s; }
    .animate-stagger-4 { animation-delay: 0.4s; }
    .animate-stagger-5 { animation-delay: 0.5s; }
    .animate-stagger-6 { animation-delay: 0.6s; }
    
    .bg-gradient-primary {
      background: linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)));
    }
    
    .bg-gradient-secondary {
      background: linear-gradient(135deg, rgb(var(--brand-secondary)), rgb(var(--brand-accent)));
    }
    
    .bg-gradient-accent {
      background: linear-gradient(135deg, rgb(var(--brand-accent)), rgb(var(--brand-primary)));
    }
    
    .text-brand-primary { color: rgb(var(--brand-primary)); }
    .text-brand-secondary { color: rgb(var(--brand-secondary)); }
    .text-brand-accent { color: rgb(var(--brand-accent)); }
    .text-brand-success { color: rgb(var(--brand-success)); }
    
    .rounded-4xl { border-radius: 2rem; }
    
    .pricing-card.popular {
      position: relative;
      border: 2px solid rgb(var(--brand-primary));
    }
    
    .pricing-card.popular::before {
      content: 'Most Popular';
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)));
      color: white;
      padding: 0.5rem 1.5rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .bg-gradient-to-br { background: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
    .from-slate-50 { --tw-gradient-from: #f8fafc; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(248, 250, 252, 0)); }
    .via-blue-50 { --tw-gradient-stops: var(--tw-gradient-from), #eff6ff, var(--tw-gradient-to, rgba(239, 246, 255, 0)); }
    .to-purple-50 { --tw-gradient-to: #faf5ff; }
    .text-slate-700 { color: #334155; }
    .text-slate-800 { color: #1e293b; }
    .text-slate-600 { color: #475569; }
    .text-white { color: #ffffff; }
    .bg-white { background-color: #ffffff; }
    .text-yellow-400 { color: #facc15; }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
    .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    .text-5xl { font-size: 3rem; line-height: 1; }
    .text-6xl { font-size: 3.75rem; line-height: 1; }
    .text-7xl { font-size: 4.5rem; line-height: 1; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .font-medium { font-weight: 500; }
    .leading-tight { line-height: 1.25; }
    .leading-relaxed { line-height: 1.625; }
    .min-h-screen { min-height: 100vh; }
    .overflow-hidden { overflow: hidden; }
    .fixed { position: fixed; }
    .relative { position: relative; }
    .absolute { position: absolute; }
    .inset-0 { top: 0px; right: 0px; bottom: 0px; left: 0px; }
    .z-50 { z-index: 50; }
    .z-10 { z-index: 10; }
    .pointer-events-none { pointer-events: none; }
    .flex { display: flex; }
    .inline-flex { display: inline-flex; }
    .grid { display: grid; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-8 { gap: 2rem; }
    .gap-12 { gap: 3rem; }
    .gap-16 { gap: 4rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .px-8 { padding-left: 2rem; padding-right: 2rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
    .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
    .py-16 { padding-top: 4rem; padding-bottom: 4rem; }
    .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
    .py-32 { padding-top: 8rem; padding-bottom: 8rem; }
    .p-3 { padding: 0.75rem; }
    .p-4 { padding: 1rem; }
    .p-6 { padding: 1.5rem; }
    .p-8 { padding: 2rem; }
    .p-12 { padding: 3rem; }
    .p-16 { padding: 4rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-8 { margin-bottom: 2rem; }
    .mb-12 { margin-bottom: 3rem; }
    .mb-16 { margin-bottom: 4rem; }
    .mb-20 { margin-bottom: 5rem; }
    .mt-3 { margin-top: 0.75rem; }
    .ml-1 { margin-left: 0.25rem; }
    .ml-2 { margin-left: 0.5rem; }
    .pt-8 { padding-top: 2rem; }
    .pt-0 { padding-top: 0px; }
    .w-2 { width: 0.5rem; }
    .w-3 { width: 0.75rem; }
    .w-8 { width: 2rem; }
    .w-10 { width: 2.5rem; }
    .w-12 { width: 3rem; }
    .w-14 { width: 3.5rem; }
    .w-56 { width: 14rem; }
    .w-72 { width: 18rem; }
    .w-80 { width: 20rem; }
    .w-96 { width: 24rem; }
    .w-full { width: 100%; }
    .h-2 { height: 0.5rem; }
    .h-3 { height: 0.75rem; }
    .h-8 { height: 2rem; }
    .h-10 { height: 2.5rem; }
    .h-12 { height: 3rem; }
    .h-14 { height: 3.5rem; }
    .h-full { height: 100%; }
    .h-500 { height: 500px; }
    .h-600 { height: 600px; }
    .max-w-2xl { max-width: 42rem; }
    .max-w-3xl { max-width: 48rem; }
    .max-w-4xl { max-width: 56rem; }
    .max-w-7xl { max-width: 80rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .rounded-full { border-radius: 9999px; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-xl { border-radius: 0.75rem; }
    .rounded-2xl { border-radius: 1rem; }
    .rounded-3xl { border-radius: 1.5rem; }
    .border { border-width: 1px; }
    .border-2 { border-width: 2px; }
    .border-t { border-top-width: 1px; }
    .border-b { border-bottom-width: 1px; }
    .border-white { border-color: #ffffff; }
    .border-slate-200 { border-color: #e2e8f0; }
    .backdrop-blur-sm { backdrop-filter: blur(4px); }
    .backdrop-blur-xl { backdrop-filter: blur(24px); }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
    .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
    .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
    .object-cover { object-fit: cover; }
    .cursor-pointer { cursor: pointer; }
    .transition-all { transition-property: all; }
    .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; }
    .transition-transform { transition-property: transform; }
    .duration-300 { transition-duration: 300ms; }
    .duration-500 { transition-duration: 500ms; }
    .duration-700 { transition-duration: 700ms; }
    .duration-1000 { transition-duration: 1000ms; }
    .ease-out { transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }
    .hover\\:scale-105:hover { transform: scale(1.05); }
    .hover\\:scale-110:hover { transform: scale(1.1); }
    .hover\\:rotate-12:hover { transform: rotate(12deg); }
    .hover\\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
    .hover\\:shadow-2xl:hover { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
    .hover\\:text-brand-primary:hover { color: rgb(var(--brand-primary)); }
    .hover\\:text-white:hover { color: #ffffff; }
    .hover\\:bg-white:hover { background-color: #ffffff; }
    .hover\\:bg-gradient-primary:hover { background: linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary))); }
    .hover\\:border-transparent:hover { border-color: transparent; }
    .group:hover .group-hover\\:scale-110 { transform: scale(1.1); }
    .group:hover .group-hover\\:translate-x-2 { transform: translateX(0.5rem); }
    .group:hover .group-hover\\:opacity-100 { opacity: 1; }
    .group:hover .group-hover\\:text-brand-primary { color: rgb(var(--brand-primary)); }
    .opacity-0 { opacity: 0; }
    .opacity-20 { opacity: 0.2; }
    .opacity-30 { opacity: 0.3; }
    .opacity-100 { opacity: 1; }
    .bg-clip-text { background-clip: text; }
    .text-transparent { color: transparent; }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem; }
    .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
    .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
    .space-y-8 > :not([hidden]) ~ :not([hidden]) { margin-top: 2rem; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .flex-col { flex-direction: column; }
    .flex-wrap { flex-wrap: wrap; }
    .flex-shrink-0 { flex-shrink: 0; }
    .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    .resize-none { resize: none; }
    .focus\\:outline-none:focus { outline: 2px solid transparent; outline-offset: 2px; }
    .focus\\:ring-2:focus { box-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color); }
    .focus\\:ring-blue-500:focus { --tw-ring-color: #3b82f6; }
    .bg-brand-primary { background-color: rgb(var(--brand-primary)); }
    .bg-brand-secondary { background-color: rgb(var(--brand-secondary)); }
    .bg-brand-accent { background-color: rgb(var(--brand-accent)); }
    .bg-brand-success { background-color: rgb(var(--brand-success)); }
    .transform { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
    .translate-x-\\[\\-50px\\] { --tw-translate-x: -50px; }
    .translate-x-\\[50px\\] { --tw-translate-x: 50px; }
    .translate-y-\\[30px\\] { --tw-translate-y: 30px; }
    .scale-90 { --tw-scale-x: 0.9; --tw-scale-y: 0.9; }
    .rotate-180 { --tw-rotate: 180deg; }
    
    @media (min-width: 768px) {
      .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .md\\:flex-row { flex-direction: row; }
    }
    
    @media (min-width: 1024px) {
      .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .lg\\:text-5xl { font-size: 3rem; line-height: 1; }
      .lg\\:text-6xl { font-size: 3.75rem; line-height: 1; }
      .lg\\:text-7xl { font-size: 4.5rem; line-height: 1; }
      .lg\\:text-2xl { font-size: 1.5rem; line-height: 2rem; }
    }
    
    @media (min-width: 640px) {
      .sm\\:flex-row { flex-direction: row; }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
    }

    .max-h-0 { max-height: 0px; }
    .max-h-96 { max-height: 24rem; }
    .overflow-hidden { overflow: hidden; }
    .top-full { top: 100%; }
    .right-0 { right: 0px; }
    .left-0 { left: 0px; }
    .left-1\\/3 { left: 33.333333%; }
    .left-50\\% { left: 50%; }
    .top-20 { top: 5rem; }
    .top-1\\/3 { top: 33.333333%; }
    .top-8 { top: 2rem; }
    .top-1\\/2 { top: 50%; }
    .bottom-8 { bottom: 2rem; }
    .bottom-20 { bottom: 5rem; }
    .right-8 { right: 2rem; }
    .right-20 { right: 5rem; }
    .left-8 { left: 2rem; }
    .left-20 { left: 5rem; }
    .left-4 { left: 1rem; }
    .blur-3xl { filter: blur(64px); }
  `;

  const features = [
    {
      icon: <FaShieldAlt className="text-3xl mb-4 text-brand-primary" />,
      title: "AI-Powered Security",
      description:
        "Advanced threat detection with machine learning algorithms that adapt to your community's patterns",
      highlight: "99.9% accuracy",
    },
    {
      icon: <FaUsers className="text-3xl mb-4 text-brand-secondary" />,
      title: "Smart Resident Portal",
      description:
        "Intuitive dashboard for residents to manage services, communicate, and access community features",
      highlight: "5-min setup",
    },
    {
      icon: <FaUserCog className="text-3xl mb-4 text-brand-accent" />,
      title: "Admin Command Center",
      description:
        "Comprehensive management suite with real-time analytics and automated workflows",
      highlight: "100+ tools",
    },
    {
      icon: <FaQrcode className="text-3xl mb-4 text-brand-primary" />,
      title: "Contactless Access",
      description:
        "QR-based entry system with pre-approval workflows and visitor management",
      highlight: "Zero touch",
    },
    {
      icon: <FaBell className="text-3xl mb-4 text-brand-secondary" />,
      title: "Smart Notifications",
      description:
        "AI-prioritized alerts with multi-channel delivery and personalization",
      highlight: "Real-time",
    },
    {
      icon: <FaChartLine className="text-3xl mb-4 text-brand-accent" />,
      title: "Predictive Analytics",
      description:
        "Machine learning insights for maintenance, security, and community optimization",
      highlight: "ML-powered",
    },
    {
      icon: <FaCamera className="text-3xl mb-4 text-brand-primary" />,
      title: "Video Surveillance",
      description:
        "24/7 monitoring with facial recognition and automatic incident detection",
      highlight: "HD quality",
    },
    {
      icon: <FaWifi className="text-3xl mb-4 text-brand-secondary" />,
      title: "IoT Integration",
      description:
        "Connect smart devices throughout your community for automated management",
      highlight: "500+ devices",
    },
    {
      icon: <FaCloud className="text-3xl mb-4 text-brand-accent" />,
      title: "Cloud Infrastructure",
      description:
        "Secure, scalable cloud platform with 99.99% uptime guarantee",
      highlight: "Enterprise-grade",
    },
  ];

  const stats = [
    { number: "50K+", label: "Happy Residents", icon: <FaUsers /> },
    { number: "500+", label: "Smart Societies", icon: <FaShieldAlt /> },
    { number: "99.9%", label: "Uptime Guarantee", icon: <FaCheckCircle /> },
    { number: "24/7", label: "Support Available", icon: <FaHeadset /> },
  ];

  const services = [
    {
      icon: <FaHome className="text-4xl text-brand-primary mb-4" />,
      title: "Property Management",
      description:
        "Complete property lifecycle management with maintenance tracking, tenant relations, and asset optimization.",
      features: [
        "Maintenance Scheduling",
        "Tenant Portal",
        "Asset Tracking",
        "Financial Reporting",
      ],
    },
    {
      icon: <FaShieldAlt className="text-4xl text-brand-secondary mb-4" />,
      title: "Security Solutions",
      description:
        "Comprehensive security ecosystem with AI monitoring, access control, and emergency response systems.",
      features: [
        "AI Surveillance",
        "Access Control",
        "Emergency Response",
        "Threat Detection",
      ],
    },
    {
      icon: <FaUsers className="text-4xl text-brand-accent mb-4" />,
      title: "Community Engagement",
      description:
        "Foster stronger communities with event management, communication tools, and social platforms.",
      features: [
        "Event Management",
        "Social Platform",
        "Communication Hub",
        "Feedback System",
      ],
    },
    {
      icon: <FaCog className="text-4xl text-brand-primary mb-4" />,
      title: "Automation & IoT",
      description:
        "Smart automation for utilities, maintenance, and daily operations to improve efficiency.",
      features: [
        "Smart Utilities",
        "Automated Maintenance",
        "Energy Management",
        "IoT Integration",
      ],
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: { monthly: 99, yearly: 990 },
      description: "Perfect for small communities",
      features: [
        "Up to 100 residents",
        "Basic security monitoring",
        "Resident portal",
        "Mobile app access",
        "Email support",
        "Basic analytics",
      ],
      popular: false,
    },
    {
      name: "Professional",
      price: { monthly: 299, yearly: 2990 },
      description: "Ideal for growing communities",
      features: [
        "Up to 500 residents",
        "Advanced security with AI",
        "Visitor management",
        "IoT device integration",
        "Priority support",
        "Advanced analytics",
        "Custom branding",
        "API access",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: { monthly: 599, yearly: 5990 },
      description: "For large communities and organizations",
      features: [
        "Unlimited residents",
        "Full security suite",
        "Multi-location support",
        "Dedicated support manager",
        "Custom integrations",
        "White-label solution",
        "SLA guarantee",
        "Training & onboarding",
      ],
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Community Manager",
      company: "Green Valley Residences",
      image: "/src/assets/person2.jpeg",
      rating: 5,
      text: "Nestmate has revolutionized how we manage our community. The security features alone have prevented multiple incidents, and residents love the convenience of the mobile app.",
    },
    {
      name: "Michael Chen",
      role: "Property Director",
      company: "Metropolitan Heights",
      image: "/src/assets/person1.jpeg",
      rating: 5,
      text: "The analytics and reporting features have helped us reduce operational costs by 30% while improving resident satisfaction scores across all metrics.",
    },
    {
      name: "Emily Rodriguez",
      role: "Security Chief",
      company: "Luxury Living Complex",
      image: "/src/assets/person4.jpeg",
      rating: 5,
      text: "The AI-powered security monitoring is incredible. It's like having a team of security experts watching our property 24/7, with instant alerts for any unusual activity.",
    },
  ];

  const faqs = [
    {
      question: "How quickly can Nestmate be implemented in our community?",
      answer:
        "Implementation typically takes 1-2 weeks depending on your community size and requirements. Our team handles setup, training, and migration from existing systems.",
    },
    {
      question: "Is there a mobile app for residents?",
      answer:
        "Yes! We provide native iOS and Android apps for residents, with features like visitor pre-approval, service requests, community updates, and emergency alerts.",
    },
    {
      question: "What security measures protect our data?",
      answer:
        "We use enterprise-grade encryption, regular security audits, and comply with GDPR and SOC 2 standards. All data is stored in secure cloud infrastructure with automated backups.",
    },
    {
      question: "Can Nestmate integrate with our existing systems?",
      answer:
        "Absolutely! We offer API integrations with most property management systems, accounting software, and IoT devices. Custom integrations are available for enterprise plans.",
    },
    {
      question: "What kind of support do you provide?",
      answer:
        "We offer 24/7 technical support, dedicated account managers for enterprise clients, comprehensive training materials, and regular webinars for feature updates.",
    },
    {
      question: "Is there a free trial available?",
      answer:
        "Yes, we offer a 30-day free trial with full access to all features. No credit card required, and our team will help you get set up during the trial period.",
    },
  ];

  return (
    <div className=" relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 font-sans overflow-hidden z-0">
      <div
        dangerouslySetInnerHTML={{ __html: `<style>${embeddedStyles}</style>` }}
      />

      {/* Background Pattern */}
      <div
        className="fixed inset-0 opacity-30 z-0"
        style={{
          backgroundImage: `url(${patternBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />

      {/* Floating Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-primary opacity-20 rounded-full blur-3xl animate-float"
          style={{
            transform: `translate(${mousePosition.x * 20}px, ${
              mousePosition.y * 20
            }px)`,
          }}
        />
        <div
          className="absolute top-1/3 right-20 w-80 h-80 bg-gradient-accent opacity-20 rounded-full blur-3xl animate-float"
          style={{
            animationDelay: "1s",
            transform: `translate(${mousePosition.x * -15}px, ${
              mousePosition.y * 15
            }px)`,
          }}
        />
        <div
          className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-secondary opacity-20 rounded-full blur-3xl animate-float"
          style={{
            animationDelay: "2s",
            transform: `translate(${mousePosition.x * 25}px, ${
              mousePosition.y * -10
            }px)`,
          }}
        />
      </div>

      {/* Navbar */}
      <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass backdrop-blur-xl border-b border-white/10 shadow-xl"
          : "bg-transparent"
      }`}
    >
      <div className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4 max-w-7xl mx-auto">

        {/* LOGO */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl cursor-pointer transition-all duration-500 hover:scale-110 hover:rotate-12 shadow-lg hover:shadow-2xl">
            <img src={logo} alt="UrbanNest" />
          </div>

          <span className="text-2xl md:text-5xl font-bold font-display bg-gradient-primary bg-clip-text text-transparent tracking-wide">
            UrbanNest
          </span>
          
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "Services", "Pricing", "About", "Contact"].map((item) => {
            const id = item.toLowerCase();
            return (
              <a
                key={item}
                href={`#${id}`}
                className={`relative font-medium transition-all duration-300 ${
                  active === id
                    ? "text-brand-primary"
                    : "text-slate-700 hover:text-brand-primary"
                }`}
              >
                {item}

                {/* 🔥 Active underline */}
                <span
                  className={`absolute left-0 -bottom-1 h-[2px] bg-gradient-primary transition-all duration-300 ${
                    active === id ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </a>
            );
          })}

          {/* LOGIN DROPDOWN */}
          <div className="relative">
            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              Login
              <span
                className={`transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-3 w-56 glass rounded-2xl flex flex-col p-3 gap-2 animate-zoom-in border border-white/10 shadow-2xl">
                {["Resident", "Admin", "Security"].map((role) => (
                  <button
                    key={role}
                    onClick={() => handleLogin(role)}
                    className="bg-white/80 hover:bg-gradient-primary text-slate-700 hover:text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    {role} Login
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-2xl text-slate-700"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* 🔥 MOBILE MENU (SMOOTH SLIDE) */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4">
          <div className="glass rounded-2xl p-4 flex flex-col gap-4">

            {["Features", "Services", "Pricing", "About", "Contact"].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-slate-700 hover:text-brand-primary font-medium py-2 border-b border-white/10"
                >
                  {item}
                </a>
              )
            )}

            {/* MOBILE LOGIN */}
            <div className="flex flex-col gap-2 pt-2">
              {["Resident", "Admin", "Security"].map((role) => (
                <button
                  key={role}
                  onClick={() => handleLogin(role)}
                  className="btn-primary w-full"
                >
                  {role} Login
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-6 py-20"
        data-section="hero"
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div
            className={`space-y-8 transform transition-all duration-1000 ${
              isVisible.hero
                ? "animate-fade-in-left"
                : "opacity-0 translate-x-[-50px]"
            }`}
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40 animate-fade-in-up">
                <div className="w-2 h-2 bg-brand-success rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">
                  Trusted by 500+ Smart Communities
                </span>
              </div>

              <h1
                className={`text-5xl lg:text-7xl font-bold font-display leading-tight transform transition-all duration-1000 delay-200 ${
                  isVisible.hero
                    ? "animate-fade-in-up"
                    : "opacity-0 translate-y-[30px]"
                }`}
              >
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Security
                </span>
                <br />
                <span className="text-slate-800">Reinvented for</span>
                <br />
                <span className="bg-gradient-secondary bg-clip-text text-transparent">
                  Smart Societies
                </span>
              </h1>

              <p
                className={`text-xl lg:text-2xl text-slate-600 leading-relaxed max-w-2xl transform transition-all duration-1000 delay-400 ${
                  isVisible.hero
                    ? "animate-fade-in-up"
                    : "opacity-0 translate-y-[30px]"
                }`}
              >
                Experience the future of community living with AI-powered
                security, seamless resident management, and intelligent
                automation that transforms how societies operate.
              </p>

              {/* Stats */}
              <div
                className={`grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 transform transition-all duration-1000 delay-600 ${
                  isVisible.hero
                    ? "animate-fade-in-up"
                    : "opacity-0 translate-y-[30px]"
                }`}
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="text-brand-primary mb-2 flex justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-slate-800">
                      {stat.number}
                    </div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`flex flex-wrap gap-4 pt-8 transform transition-all duration-1000 delay-800 ${
                isVisible.hero
                  ? "animate-fade-in-up"
                  : "opacity-0 translate-y-[30px]"
              }`}
            >
              <button
                onClick={() => navigate("/register-society")}
                className="btn-primary flex items-center gap-3 text-lg group"
              >
                Register Your Society
                <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-2" />
              </button>
              {/* <button className="btn-secondary flex items-center gap-3 text-lg group">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaPlay className="text-white ml-1" />
                </div>
                Watch Demo
              </button> */}
            </div>
          </div>

          {/* Right Image */}
          <div
            className={`relative transform transition-all duration-1000 delay-300 ${
              isVisible.hero
                ? "animate-fade-in-right"
                : "opacity-0 translate-x-[50px]"
            }`}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-3xl blur-2xl group-hover:opacity-30 transition-opacity duration-500"></div>
              <img
                src={heroBuilding}
                alt="Smart Society Building"
                className="relative z-10 w-full h-600 object-cover rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-700 border border-white/20"
              />

              {/* Floating UI Elements */}
              <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg animate-float border border-white/40">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-brand-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-slate-700">
                    Security Active
                  </span>
                </div>
              </div>

              <div
                className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg animate-float border border-white/40"
                style={{ animationDelay: "1s" }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-primary">
                    24/7
                  </div>
                  <div className="text-sm text-slate-600">AI Monitoring</div>
                </div>
              </div>

              <div
                className="absolute top-1/2 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg animate-float border border-white/40"
                style={{ animationDelay: "2s" }}
              >
                <div className="flex items-center gap-2">
                  <FaUsers className="text-brand-secondary" />
                  <div>
                    <div className="text-lg font-bold text-slate-800">50K+</div>
                    <div className="text-xs text-slate-600">Residents</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative py-32 px-6"
        data-section="features"
      >
        <div className="max-w-7xl mx-auto">
          <div
            className={`text-center mb-20 transform transition-all duration-1000 ${
              isVisible.features
                ? "animate-fade-in-up"
                : "opacity-0 translate-y-[30px]"
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full border border-white/40 mb-8">
              <FaStar className="text-brand-primary" />
              <span className="font-semibold text-slate-700">
                Award-Winning Platform
              </span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold font-display mb-6 bg-gradient-secondary bg-clip-text text-transparent">
              Comprehensive Features
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to manage, secure, and enhance your smart
              society
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative glass backdrop-blur-xl p-8 rounded-3xl border border-white/20 card-hover transform transition-all duration-1000 ${
                  isVisible.features
                    ? "animate-fade-in-up"
                    : "opacity-0 translate-y-[30px]"
                } animate-stagger-${(index % 6) + 1} overflow-hidden`}
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                <div className="relative z-10">
                  <div className="inline-flex p-4 bg-white/50 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-2xl font-bold text-slate-800 group-hover:text-brand-primary transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <div className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-sm font-semibold">
                        {feature.highlight}
                      </div>
                    </div>

                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        className="relative py-32 px-6 bg-gradient-to-r from-slate-900/5 to-blue-900/5"
        data-section="services"
      >
        <div className="max-w-7xl mx-auto">
          <div
            className={`text-center mb-20 transform transition-all duration-1000 ${
              isVisible.services
                ? "animate-fade-in-up"
                : "opacity-0 translate-y-[30px]"
            }`}
          >
            <h2 className="text-5xl lg:text-6xl font-bold font-display mb-6 text-slate-800">
              Complete{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Service Suite
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              End-to-end solutions tailored for modern community management
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {services.map((service, index) => (
              <div
                key={index}
                className={`glass backdrop-blur-xl p-12 rounded-4xl border border-white/20 card-hover transform transition-all duration-1000 ${
                  isVisible.services
                    ? "animate-fade-in-up"
                    : "opacity-0 translate-y-[30px]"
                } animate-stagger-${index + 1}`}
              >
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="p-6 bg-white/50 rounded-3xl">
                      {service.icon}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-slate-800 mb-2">
                        {service.title}
                      </h3>
                      <p className="text-lg text-slate-600">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <FaCheckCircle className="text-brand-success flex-shrink-0" />
                        <span className="text-slate-700 font-medium">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Showcase Section */}
      <section className="relative py-32 px-6" data-section="showcase">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div
              className={`transform transition-all duration-1000 ${
                isVisible.showcase
                  ? "animate-fade-in-left"
                  : "opacity-0 translate-x-[-30px]"
              }`}
            >
              <img
                src={teamCollaboration}
                alt="Team Collaboration"
                className="w-full h-500 object-cover rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-700"
              />
            </div>

            <div
              className={`space-y-8 transform transition-all duration-1000 ${
                isVisible.showcase
                  ? "animate-fade-in-right"
                  : "opacity-0 translate-x-[30px]"
              }`}
            >
              <h3 className="text-4xl lg:text-5xl font-bold font-display text-slate-800">
                Built for{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">
                  Collaboration
                </span>
              </h3>
              <p className="text-xl text-slate-600 leading-relaxed">
                Our platform brings together residents, administrators, and
                security teams in one seamless ecosystem designed for modern
                community living.
              </p>

              <div className="space-y-6">
                {[
                  "Real-time communication across all stakeholders",
                  "Advanced AI-powered security monitoring",
                  "Seamless visitor management and approval",
                  "Community engagement and social tools",
                  "Automated maintenance and service requests",
                  "Comprehensive analytics and reporting",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-brand-success/20 rounded-full flex items-center justify-center">
                      <FaCheckCircle className="text-brand-success" />
                    </div>
                    <span className="text-lg text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div
              className={`space-y-8 transform transition-all duration-1000 ${
                isVisible.showcase
                  ? "animate-fade-in-left"
                  : "opacity-0 translate-x-[-30px]"
              }`}
            >
              <h3 className="text-4xl lg:text-5xl font-bold font-display text-slate-800">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Intelligence
                </span>{" "}
                at Scale
              </h3>
              <p className="text-xl text-slate-600 leading-relaxed">
                Harness the power of artificial intelligence to automate complex
                processes, predict maintenance needs, and ensure optimal
                security for your community.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: <FaRocket />,
                    title: "Predictive Maintenance",
                    desc: "AI predicts equipment failures before they happen",
                  },
                  {
                    icon: <FaEye />,
                    title: "Smart Surveillance",
                    desc: "Facial recognition and behavior analysis",
                  },
                  {
                    icon: <FaChartLine />,
                    title: "Usage Analytics",
                    desc: "Deep insights into community patterns",
                  },
                  {
                    icon: <FaBell />,
                    title: "Intelligent Alerts",
                    desc: "Context-aware notifications and prioritization",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-800">
                        {item.title}
                      </h4>
                      <p className="text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`transform transition-all duration-1000 ${
                isVisible.showcase
                  ? "animate-fade-in-right"
                  : "opacity-0 translate-x-[30px]"
              }`}
            >
              <img
                src={securityDashboard}
                alt="Security Dashboard"
                className="w-full h-500 object-cover rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="relative py-32 px-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50"
        data-section="pricing"
      >
        <div className="max-w-7xl mx-auto">
          <div
            className={`text-center mb-20 transform transition-all duration-1000 ${
              isVisible.pricing
                ? "animate-fade-in-up"
                : "opacity-0 translate-y-[30px]"
            }`}
          >
            <h2 className="text-5xl lg:text-6xl font-bold font-display mb-6 text-slate-800">
              Simple{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Pricing
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Choose the perfect plan for your community size and needs
            </p>

            {/* Pricing Toggle */}
            <div className="inline-flex bg-white/60 backdrop-blur-sm p-2 rounded-2xl border border-white/40">
              <button
                onClick={() => setActiveTab("monthly")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === "monthly"
                    ? "bg-gradient-primary text-white shadow-lg"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setActiveTab("yearly")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === "yearly"
                    ? "bg-gradient-primary text-white shadow-lg"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Yearly
                <span className="ml-2 bg-brand-success text-white px-2 py-1 rounded-lg text-xs">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`pricing-card relative glass backdrop-blur-xl p-8 rounded-4xl border border-white/20 card-hover transform transition-all duration-1000 ${
                  isVisible.pricing
                    ? "animate-fade-in-up"
                    : "opacity-0 translate-y-[30px]"
                } animate-stagger-${index + 1} ${
                  plan.popular ? "popular" : ""
                }`}
              >
                <div className="space-y-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-slate-600 mb-6">{plan.description}</p>
                    <div className="space-y-2">
                      <div className="text-5xl font-bold text-slate-800">
                        ₹
                        {activeTab === "monthly"
                          ? plan.price.monthly
                          : plan.price.yearly}
                      </div>
                      <div className="text-slate-600">
                        per {activeTab === "monthly" ? "month" : "year"}
                      </div>
                      {activeTab === "yearly" && (
                        <div className="text-sm text-brand-success font-semibold">
                          Save ₹{plan.price.monthly * 12 - plan.price.yearly}{" "}
                          annually
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <FaCheckCircle className="text-brand-success mt-1 flex-shrink-0" />
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                      plan.popular ? "btn-primary" : "btn-secondary"
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div
            className={`text-center mt-16 transform transition-all duration-1000 ${
              isVisible.pricing
                ? "animate-fade-in-up"
                : "opacity-0 translate-y-[30px]"
            }`}
          >
            <p className="text-lg text-slate-600 mb-6">
              Need a custom solution?
            </p>
            <button className="btn-secondary">
              Contact Sales for Enterprise Pricing
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-32 px-6" data-section="testimonials">
        <div className="max-w-7xl mx-auto">
          <div
            className={`text-center mb-20 transform transition-all duration-1000 ${
              isVisible.testimonials
                ? "animate-fade-in-up"
                : "opacity-0 translate-y-[30px]"
            }`}
          >
            <h2 className="text-5xl lg:text-6xl font-bold font-display mb-6 text-slate-800">
              Trusted by{" "}
              <span className="bg-gradient-secondary bg-clip-text text-transparent">
                Thousands
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              See what community leaders are saying about Nestmate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`glass backdrop-blur-xl p-8 rounded-3xl border border-white/20 card-hover transform transition-all duration-1000 ${
                  isVisible.testimonials
                    ? "animate-fade-in-up"
                    : "opacity-0 translate-y-[30px]"
                } animate-stagger-${index + 1}`}
              >
                <div className="space-y-6">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-slate-700 leading-relaxed text-lg">
                    "{testimonial.text}"
                  </p>

                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-slate-800">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-slate-600">
                        {testimonial.role}
                      </div>
                      <div className="text-sm text-brand-primary">
                        {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        className="relative py-32 px-6 bg-gradient-to-r from-slate-900/5 to-blue-900/5"
        data-section="faq"
      >
        <div className="max-w-4xl mx-auto">
          <div
            className={`text-center mb-20 transform transition-all duration-1000 ${
              isVisible.faq
                ? "animate-fade-in-up"
                : "opacity-0 translate-y-[30px]"
            }`}
          >
            <h2 className="text-5xl lg:text-6xl font-bold font-display mb-6 text-slate-800">
              Frequently Asked{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Everything you need to know about Nestmate
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`glass backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden transform transition-all duration-1000 ${
                  isVisible.faq
                    ? "animate-fade-in-up"
                    : "opacity-0 translate-y-[30px]"
                } animate-stagger-${index + 1}`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-white/10 transition-colors duration-300"
                >
                  <span className="text-lg font-semibold text-slate-800">
                    {faq.question}
                  </span>
                  <div
                    className={`transition-transform duration-300 ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === index
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-6 pt-0 text-slate-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6" data-section="cta">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`glass backdrop-blur-xl p-16 rounded-4xl border border-white/20 hover-glow transform transition-all duration-1000 ${
              isVisible.cta ? "animate-zoom-in" : "opacity-0 scale-90"
            }`}
          >
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full border border-white/40 mb-4">
                <FaRocket className="text-brand-primary" />
                <span className="font-semibold text-slate-700">
                  Ready to Transform Your Community?
                </span>
              </div>

              <h2 className="text-4xl lg:text-6xl font-bold font-display mb-6">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Start Your
                </span>
                <br />
                <span className="text-slate-800">Smart Society Journey</span>
              </h2>

              <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Join thousands of communities already experiencing the future of
                society management with AI-powered security and seamless
                operations.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
                <button
                  onClick={() => navigate("/signup/resident")}
                  className="btn-primary flex items-center gap-3 text-lg group justify-center"
                >
                  Start Free Trial
                  <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-2" />
                </button>
                <button className="btn-secondary flex items-center gap-3 text-lg justify-center">
                  Schedule Demo
                  <FaCalendarAlt />
                </button>
              </div>

              <div className="pt-8 text-sm text-slate-500">
                30-day free trial • No credit card required • Setup in minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="relative py-32 px-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50"
        data-section="contact"
      >
        <div className="max-w-7xl mx-auto">
          <div
            className={`text-center mb-20 transform transition-all duration-1000 ${
              isVisible.contact
                ? "animate-fade-in-up"
                : "opacity-0 translate-y-[30px]"
            }`}
          >
            <h2 className="text-5xl lg:text-6xl font-bold font-display mb-6 text-slate-800">
              Get in{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Touch
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Ready to transform your community? Let's discuss your specific
              needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div
              className={`glass backdrop-blur-xl p-8 rounded-4xl border border-white/20 transform transition-all duration-1000 ${
                isVisible.contact
                  ? "animate-fade-in-left"
                  : "opacity-0 translate-x-[-30px]"
              }`}
            >
              <h3 className="text-2xl font-bold text-slate-800 mb-8">
                Send us a message
              </h3>

              <ContactSection />
            </div>

            {/* Contact Information */}
            <div
              className={`space-y-8 transform transition-all duration-1000 ${
                isVisible.contact
                  ? "animate-fade-in-right"
                  : "opacity-0 translate-x-[30px]"
              }`}
            >
              <div className="glass backdrop-blur-xl p-8 rounded-3xl border border-white/20">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">
                  Contact Information
                </h3>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center">
                      <FaPhone className="text-brand-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Phone</div>
                      <div className="text-slate-600">+1 (555) 123-4567</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-secondary/20 rounded-xl flex items-center justify-center">
                      <FaEnvelope className="text-brand-secondary" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Email</div>
                      <div className="text-slate-600">contact@nestmate.com</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-accent/20 rounded-xl flex items-center justify-center">
                      <FaMapMarkerAlt className="text-brand-accent" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Office</div>
                      <div className="text-slate-600">
                        123 Innovation Drive
                        <br />
                        Tech City, TC 12345
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass backdrop-blur-xl p-8 rounded-3xl border border-white/20">
                <h3 className="text-xl font-bold text-slate-800 mb-6">
                  Business Hours
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Monday - Friday</span>
                    <span className="text-slate-800 font-semibold">
                      9:00 AM - 6:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Saturday</span>
                    <span className="text-slate-800 font-semibold">
                      10:00 AM - 4:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Sunday</span>
                    <span className="text-slate-800 font-semibold">Closed</span>
                  </div>
                  <div className="pt-3 border-t border-white/20">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Emergency Support</span>
                      <span className="text-brand-primary font-semibold">
                        24/7 Available
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass backdrop-blur-xl p-8 rounded-3xl border border-white/20">
                <h3 className="text-xl font-bold text-slate-800 mb-6">
                  Follow Us
                </h3>

                <div className="flex gap-4">
                  {[
                    { icon: <FaTwitter />, color: "hover:bg-blue-500" },
                    { icon: <FaFacebookF />, color: "hover:bg-blue-600" },
                    { icon: <FaLinkedinIn />, color: "hover:bg-blue-700" },
                    { icon: <FaInstagram />, color: "hover:bg-pink-500" },
                  ].map((social, index) => (
                    <button
                      key={index}
                      className={`w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center text-slate-600 hover:text-white transition-all duration-300 ${social.color}`}
                    >
                      {social.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPageComplete;
