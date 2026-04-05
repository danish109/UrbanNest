
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import {
  FaEye,
  FaEyeSlash,
  FaUserShield,
  FaBars,
  FaTimes,
  FaArrowRight,
  FaShieldAlt,
  FaLock,
  FaPhone,
  FaCheckCircle,
  FaStar,
} from "react-icons/fa";
import logo from "../../assets/logo6.png";
import patternBg from "../../assets/pattern-bg.jpg";

// Define validation schema with Zod
const loginSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number can't exceed 15 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only numbers"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character"
    ),
});

const GuardLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });
  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    setTimeout(() => setIsVisible(true), 300);

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleLogin = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/user/guard/login",
        {
          phone: data.phone,
          password: data.password,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data.user));

        alert("Login successful!");
        navigate("/security/dashboard");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      setError("root", {
        type: "manual",
        message:
          error.response?.data?.message || "Login failed. Check credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Embedded styles matching the landing page
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
    
    .input-field {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 1rem;
      padding: 1rem 1.5rem;
      width: 100%;
      transition: all 0.3s ease;
      font-size: 1rem;
    }
    
    .input-field:focus {
      outline: none;
      border-color: rgb(var(--brand-primary));
      box-shadow: 0 0 0 3px rgba(var(--brand-primary), 0.1);
      background: rgba(255, 255, 255, 1);
    }
    
    .input-field.error {
      border-color: rgb(var(--brand-danger));
      box-shadow: 0 0 0 3px rgba(var(--brand-danger), 0.1);
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
    .text-brand-danger { color: rgb(var(--brand-danger)); }
    
    .rounded-4xl { border-radius: 2rem; }
    
    .bg-gradient-to-br { background: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
    .from-slate-50 { --tw-gradient-from: #f8fafc; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(248, 250, 252, 0)); }
    .via-blue-50 { --tw-gradient-stops: var(--tw-gradient-from), #eff6ff, var(--tw-gradient-to, rgba(239, 246, 255, 0)); }
    .to-purple-50 { --tw-gradient-to: #faf5ff; }
    .text-slate-700 { color: #334155; }
    .text-slate-800 { color: #1e293b; }
    .text-slate-600 { color: #475569; }
    .text-white { color: #ffffff; }
    .bg-white { background-color: #ffffff; }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
    .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    .text-5xl { font-size: 3rem; line-height: 1; }
    .text-6xl { font-size: 3.75rem; line-height: 1; }
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
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .px-8 { padding-left: 2rem; padding-right: 2rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
    .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
    .py-16 { padding-top: 4rem; padding-bottom: 4rem; }
    .p-3 { padding: 0.75rem; }
    .p-4 { padding: 1rem; }
    .p-6 { padding: 1.5rem; }
    .p-8 { padding: 2rem; }
    .p-12 { padding: 3rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-8 { margin-bottom: 2rem; }
    .mb-12 { margin-bottom: 3rem; }
    .mt-3 { margin-top: 0.75rem; }
    .ml-1 { margin-left: 0.25rem; }
    .ml-2 { margin-left: 0.5rem; }
    .w-8 { width: 2rem; }
    .w-10 { width: 2.5rem; }
    .w-12 { width: 3rem; }
    .w-16 { width: 4rem; }
    .w-full { width: 100%; }
    .h-8 { height: 2rem; }
    .h-10 { height: 2.5rem; }
    .h-12 { height: 3rem; }
    .h-16 { height: 4rem; }
    .h-full { height: 100%; }
    .max-w-md { max-width: 28rem; }
    .max-w-2xl { max-width: 42rem; }
    .max-w-7xl { max-width: 80rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .rounded-full { border-radius: 9999px; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-xl { border-radius: 0.75rem; }
    .rounded-2xl { border-radius: 1rem; }
    .rounded-3xl { border-radius: 1.5rem; }
    .border { border-width: 1px; }
    .border-2 { border-width: 2px; }
    .border-white { border-color: #ffffff; }
    .backdrop-blur-sm { backdrop-filter: blur(4px); }
    .backdrop-blur-xl { backdrop-filter: blur(24px); }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
    .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
    .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
    .cursor-pointer { cursor: pointer; }
    .transition-all { transition-property: all; }
    .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; }
    .duration-300 { transition-duration: 300ms; }
    .duration-500 { transition-duration: 500ms; }
    .ease-out { transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }
    .hover\\:scale-105:hover { transform: scale(1.05); }
    .hover\\:scale-110:hover { transform: scale(1.1); }
    .hover\\:rotate-12:hover { transform: rotate(12deg); }
    .hover\\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
    .hover\\:text-brand-primary:hover { color: rgb(var(--brand-primary)); }
    .hover\\:text-white:hover { color: #ffffff; }
    .group:hover .group-hover\\:translate-x-2 { transform: translateX(0.5rem); }
    .opacity-0 { opacity: 0; }
    .opacity-20 { opacity: 0.2; }
    .opacity-30 { opacity: 0.3; }
    .opacity-100 { opacity: 1; }
    .bg-clip-text { background-clip: text; }
    .text-transparent { color: transparent; }
    .text-center { text-align: center; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
    .space-y-8 > :not([hidden]) ~ :not([hidden]) { margin-top: 2rem; }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .flex-col { flex-direction: column; }
    .blur-3xl { filter: blur(64px); }
    .top-20 { top: 5rem; }
    .left-20 { left: 5rem; }
    .right-20 { right: 5rem; }
    .bottom-20 { bottom: 5rem; }
    .left-1\\/3 { left: 33.333333%; }
    .w-96 { width: 24rem; }
    .h-96 { height: 24rem; }
    .w-80 { width: 20rem; }
    .h-80 { height: 20rem; }
    .w-72 { width: 18rem; }
    .h-72 { height: 18rem; }
    
    @media (min-width: 768px) {
      .md\\:flex { display: flex; }
      .md\\:hidden { display: none; }
      .md\\:text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
      .md\\:w-1\\/2 { width: 50%; }
      .md\\:flex-row { flex-direction: row; }
    }
    
    @media (min-width: 1024px) {
      .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .lg\\:text-5xl { font-size: 3rem; line-height: 1; }
    }

    .disabled\\:opacity-50:disabled { opacity: 0.5; }
    .disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }
  `;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 font-sans overflow-hidden">
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

      <nav className="relative z-50 glass backdrop-blur-xl animate-fade-in-down" style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
              <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-2xl cursor-pointer transition-all duration-500 hover:scale-110 hover:rotate-12 shadow-lg hover:shadow-2xl">
                      <img src={logo} alt="UrbanNest" className="w-full h-full" />
                    </div>
                  </div>
                  <span className="text-xl md:text-3xl font-bold font-display bg-gradient-primary bg-clip-text text-transparent tracking-wide">
                    UrbanNest
                  </span>
                </div>
      
                <div className="hidden md:flex items-center gap-8">
                  <Link
                    to="/#about"
                    className="text-slate-700 hover:text-brand-primary transition-all duration-300 font-medium underline-animated"
                  >
                    About
                  </Link>
                  <Link
                    to="/#contact"
                    className="text-slate-700 hover:text-brand-primary transition-all duration-300 font-medium underline-animated"
                  >
                    Contact
                  </Link>
                  <Link
                    to="/"
                    className="btn-secondary gap-2"
                  >
                    <span>Back to Home</span>
                    <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-2" />
                  </Link>
                </div>
      
                <div className="md:hidden">
                  <button onClick={() => setIsOpen(!isOpen)} className="text-slate-700">
                    {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
                  </button>
                </div>
              </div>
      
              {isOpen && (
                <div className="md:hidden glass backdrop-blur-xl px-6 py-4 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                  <Link
                    to="/"
                    className="block text-slate-700 hover:text-brand-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/#about"
                    className="block text-slate-700 hover:text-brand-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    to="/#contact"
                    className="block text-slate-700 hover:text-brand-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Contact
                  </Link>
                </div>
              )}
            </nav>

      {/* Main Login Section */}
      <div className="relative min-h-screen flex items-center justify-center px-6 py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left Side - Feature Showcase */}
          <motion.div
            className={`space-y-8 transform transition-all duration-1000 ${
              isVisible
                ? "animate-fade-in-left"
                : "opacity-0 translate-x-[-50px]"
            }`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40">
                <div className="w-2 h-2 bg-brand-success rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">
                  Secure Access Portal
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold font-display leading-tight">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Welcome Back
                </span>
                <br />
                <span className="text-slate-800">to Your</span>
                <br />
                <span className="bg-gradient-secondary bg-clip-text text-transparent">
                  Security Dashboard
                </span>
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
                Access your comprehensive security management system with
                advanced monitoring, real-time alerts, and intelligent
                automation.
              </p>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 gap-4 pt-8">
                {[
                  {
                    icon: <FaShieldAlt />,
                    text: "AI-Powered Security Monitoring",
                  },
                  {
                    icon: <FaCheckCircle />,
                    text: "Real-time Threat Detection",
                  },
                  { icon: <FaStar />, text: "24/7 System Availability" },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <span className="text-lg text-slate-700 font-medium">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Security Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              {[
                { number: "99.9%", label: "Uptime" },
                { number: "24/7", label: "Monitoring" },
                { number: "500+", label: "Communities" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="glass backdrop-blur-xl p-4 rounded-2xl text-center border border-white/20 hover:scale-105 transition-transform duration-300"
                >
                  <div className="text-2xl font-bold text-brand-primary">
                    {stat.number}
                  </div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            className={`transform transition-all duration-1000 ${
              isVisible
                ? "animate-fade-in-right"
                : "opacity-0 translate-x-[50px]"
            }`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="glass backdrop-blur-xl p-12 rounded-4xl border border-white/20 shadow-2xl max-w-md mx-auto relative overflow-hidden">
              {/* Background Decorative Elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-primary opacity-10 rounded-full animate-float"></div>
              <div
                className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-secondary opacity-10 rounded-full animate-float"
                style={{ animationDelay: "1s" }}
              ></div>

              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FaUserShield className="text-2xl text-white" />
                  </div>
                  <h2 className="text-3xl font-bold font-display text-slate-800 mb-2">
                    Security Login
                  </h2>
                  <p className="text-slate-600">
                    Access your security management dashboard
                  </p>
                </div>

                {/* Error Message */}
                {errors.root && (
                  <motion.div
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-2">
                      <FaLock className="text-red-500" />
                      {errors.root.message}
                    </div>
                  </motion.div>
                )}

                {/* Login Form */}
                <form
                  onSubmit={handleSubmit(handleLogin)}
                  className="space-y-6"
                >
                  {/* Phone Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-slate-700 mb-2 text-sm font-semibold">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <FaPhone />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter your phone number"
                        {...register("phone")}
                        className={`input-field pl-12 ${
                          errors.phone ? "error" : ""
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-brand-danger text-xs mt-2 flex items-center gap-1">
                        <FaLock className="text-xs" />
                        {errors.phone.message}
                      </p>
                    )}
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-slate-700 mb-2 text-sm font-semibold">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <FaLock />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...register("password")}
                        className={`input-field pl-12 pr-12 ${
                          errors.password ? "error" : ""
                        }`}
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-brand-primary transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-brand-danger text-xs mt-2 flex items-center gap-1">
                        <FaLock className="text-xs" />
                        {errors.password.message}
                      </p>
                    )}
                  </motion.div>

                  {/* Login Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`btn-primary w-full text-lg group ${
                        isLoading
                          ? "disabled:opacity-50 disabled:cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Authenticating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          Access Dashboard
                          <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-2" />
                        </div>
                      )}
                    </button>
                  </motion.div>

                  {/* Footer Links */}
                  <motion.div
                    className="text-center pt-6 border-t border-white/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <p className="text-slate-600 mb-4">
                      Don't have an account?{" "}
                      <Link
                        to="/signup/security"
                        className="text-brand-primary font-semibold hover:underline transition-all"
                      >
                        Sign up here
                      </Link>
                    </p>

                    <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
                      <Link
                        to="/forgot-password"
                        className="hover:text-brand-primary transition-colors"
                      >
                        Forgot Password?
                      </Link>
                      <span>•</span>
                      <Link
                        to="/help"
                        className="hover:text-brand-primary transition-colors"
                      >
                        Need Help?
                      </Link>
                    </div>
                  </motion.div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GuardLogin;
