import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { setUser } from "../../features/auth/authSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import {
  FaEye,
  FaEyeSlash,
  FaHome,
  FaBars,
  FaTimes,
  FaArrowRight,
  FaShieldAlt,
  FaLock,
  FaPhone,
  FaCheckCircle,
  FaStar,
  FaUsers,
  FaBuilding,
  FaClock,
  FaCog,
  FaChartBar,
  FaUserShield,
} from "react-icons/fa";
import logo from "../../assets/logo6.png";
import patternBg from "../../assets/pattern-bg.jpg";

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

const AdminLogin = () => {
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

  const dispatch = useDispatch();

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
        `${import.meta.env.VITE_API_URL}/user/admin/login`,
        {
          phone: data.phone,
          password: data.password,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        dispatch(setUser(response.data.user))
        navigate("/admin/dashboard");
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

    * { box-sizing: border-box; }

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
      padding: 0.75rem 1.5rem;
      border-radius: 1rem;
      font-weight: 600;
      border: 1px solid rgba(255, 255, 255, 0.3);
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(8px);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
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
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; }
    .animate-fade-in-left { animation: fadeInLeft 0.8s ease-out forwards; opacity: 0; }
    .animate-fade-in-right { animation: fadeInRight 0.8s ease-out forwards; opacity: 0; }
    .animate-fade-in-down { animation: fadeInDown 0.8s ease-out forwards; opacity: 0; }
    .animate-zoom-in { animation: zoomIn 0.3s ease-out; }
    .animate-slide-up { animation: slideUp 0.8s ease-out forwards; opacity: 0; }
    .animate-spin { animation: spin 1s linear infinite; }
    
    .animate-stagger-1 { animation-delay: 0.1s; }
    .animate-stagger-2 { animation-delay: 0.2s; }
    .animate-stagger-3 { animation-delay: 0.3s; }
    .animate-stagger-4 { animation-delay: 0.4s; }
    .animate-stagger-5 { animation-delay: 0.5s; }
    .animate-stagger-6 { animation-delay: 0.6s; }
    
    .bg-gradient-primary {
      background: linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)));
    }
    
    .text-brand-primary { color: rgb(var(--brand-primary)); }
    .text-brand-danger { color: rgb(var(--brand-danger)); }
    
    .rounded-4xl { border-radius: 2rem; }
    
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
    .text-5xl { font-size: 3rem; line-height: 1.1; }
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
    .hidden { display: none; }
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
    .mt-2 { margin-top: 0.5rem; }
    .mt-3 { margin-top: 0.75rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-12 { margin-top: 3rem; }
    .ml-1 { margin-left: 0.25rem; }
    .ml-2 { margin-left: 0.5rem; }
    .w-5 { width: 1.25rem; }
    .w-8 { width: 2rem; }
    .w-10 { width: 2.5rem; }
    .w-12 { width: 3rem; }
    .w-16 { width: 4rem; }
    .w-24 { width: 6rem; }
    .w-full { width: 100%; }
    .h-5 { height: 1.25rem; }
    .h-6 { height: 1.5rem; }
    .h-8 { height: 2rem; }
    .h-10 { height: 2.5rem; }
    .h-12 { height: 3rem; }
    .h-16 { height: 4rem; }
    .h-24 { height: 6rem; }
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
    .border-t { border-top-width: 1px; }
    .border-white { border-color: #ffffff; }
    .backdrop-blur-sm { backdrop-filter: blur(4px); }
    .backdrop-blur-xl { backdrop-filter: blur(24px); }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
    .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
    .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
    .cursor-pointer { cursor: pointer; }
    .transition-all { transition-property: all; }
    .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; }
    .transition-transform { transition-property: transform; }
    .duration-300 { transition-duration: 300ms; }
    .duration-500 { transition-duration: 500ms; }
    .ease-out { transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }
    .hover\\:scale-105:hover { transform: scale(1.05); }
    .hover\\:scale-110:hover { transform: scale(1.1); }
    .hover\\:rotate-12:hover { transform: rotate(12deg); }
    .hover\\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
    .hover\\:shadow-2xl:hover { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
    .hover\\:text-brand-primary:hover { color: rgb(var(--brand-primary)); }
    .hover\\:text-white:hover { color: #ffffff; }
    .group:hover .group-hover\\:translate-x-2 { transform: translateX(0.5rem); }
    .opacity-0 { opacity: 0; }
    .opacity-20 { opacity: 0.2; }
    .opacity-30 { opacity: 0.3; }
    .opacity-100 { opacity: 1; }
    .bg-clip-text { background-clip: text; -webkit-background-clip: text; }
    .text-transparent { color: transparent; }
    .text-center { text-align: center; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem; }
    .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
    .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
    .space-y-8 > :not([hidden]) ~ :not([hidden]) { margin-top: 2rem; }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .flex-col { flex-direction: column; }
    .block { display: block; }
    .blur-3xl { filter: blur(64px); }
    .top-20 { top: 5rem; }
    .left-20 { left: 5rem; }
    .right-20 { right: 5rem; }
    .bottom-20 { bottom: 5rem; }
    .left-1\\/3 { left: 33.333333%; }
    .-top-4 { top: -1rem; }
    .-right-4 { right: -1rem; }
    .-bottom-4 { bottom: -1rem; }
    .-left-4 { left: -1rem; }
    .w-32 { width: 8rem; }
    .h-32 { height: 8rem; }
    .w-96 { width: 24rem; }
    .h-96 { height: 24rem; }
    .w-80 { width: 20rem; }
    .h-80 { height: 20rem; }
    .w-72 { width: 18rem; }
    .h-72 { height: 18rem; }
    
    @media (min-width: 768px) {
      .md\\:flex { display: flex; }
      .md\\:hidden { display: none; }
      .md\\:block { display: block; }
      .md\\:text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
      .md\\:w-1\\/2 { width: 50%; }
      .md\\:flex-row { flex-direction: row; }
    }
    
    @media (min-width: 1024px) {
      .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .lg\\:text-5xl { font-size: 3rem; line-height: 1.1; }
      .lg\\:block { display: block; }
    }

    .disabled\\:opacity-50:disabled { opacity: 0.5; }
    .disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }
  `;

  return (
    <div className="min-h-screen relative overflow-hidden font-sans" style={{ background: 'linear-gradient(to bottom right, #f8fafc, #eff6ff, #faf5ff)' }}>
      <style dangerouslySetInnerHTML={{ __html: embeddedStyles }} />

      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `url(${patternBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

      <div className="absolute inset-0 pointer-events-none" style={{ transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)` }}>
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl animate-float" style={{ background: 'rgba(59, 130, 246, 0.15)' }} />
        <div className="absolute top-20 right-20 w-80 h-80 rounded-full blur-3xl animate-float" style={{ background: 'rgba(139, 92, 246, 0.12)', animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 rounded-full blur-3xl animate-float" style={{ background: 'rgba(236, 72, 153, 0.1)', animationDelay: '4s' }} />
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

      <div className="relative z-10 min-h-screen flex items-center py-16 px-6">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-8 items-center">

          <div className={`hidden lg:block transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ transform: isVisible ? 'translateX(0)' : 'translateX(-40px)' }}>
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm animate-fade-in-left" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))', color: 'rgb(59 130 246)' }}>
                <FaShieldAlt />
                <span>Admin Portal</span>
              </div>

              <div className="font-display leading-tight">
                <h1 className="text-5xl font-bold text-slate-800 mb-2">
                  Welcome to the
                </h1>
                <h1 className="text-5xl font-bold text-slate-800 mb-2">
                  Admin
                </h1>
                <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Control Center
                </h1>
              </div>

              <p className="text-lg text-slate-600 leading-relaxed">
                Access powerful administrative tools to manage your community efficiently.
                Monitor residents, handle service requests, track system activity, and
                ensure smooth and secure society operations.
              </p>

              <div className="space-y-4">
                {[
                  { icon: <FaUsers />, text: "Resident Management" },
                  { icon: <FaBuilding />, text: "Society Operations Control" },
                  { icon: <FaClock />, text: "24/7 Administrative Access" },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 animate-fade-in-left"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-primary text-white">
                      {feature.icon}
                    </div>
                    <span className="font-semibold text-lg text-slate-700">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                {[
                  { number: "1000+", label: "Residents Managed" },
                  { number: "50+", label: "Buildings Supervised" },
                  { number: "24/7", label: "Admin Support" },
                ].map((stat, index) => (
                  <div key={index} className="glass rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-lg">
                    <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <p className="text-sm font-medium text-slate-600 mt-2">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <div className={`w-full max-w-md transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ transform: isVisible ? 'translateX(0)' : 'translateX(40px)' }}>
              <div className="relative">
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-3xl" style={{ background: 'rgba(59, 130, 246, 0.2)' }} />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full blur-3xl" style={{ background: 'rgba(139, 92, 246, 0.15)' }} />

                <div className="relative rounded-4xl p-8 shadow-2xl" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                  <div className="text-center mb-8 animate-fade-in-up">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-primary">
                      <FaUserShield size={28} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold font-display text-slate-800">
                      Admin Login
                    </h2>
                    <p className="text-sm mt-2 text-slate-600">
                      Access your management dashboard
                    </p>
                  </div>

                  {errors.root && (
                    <div className="mb-6 p-4 rounded-xl animate-zoom-in" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <div className="flex items-center gap-2 text-sm font-medium text-brand-danger">
                        <FaCheckCircle />
                        {errors.root.message}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
                    <div className="animate-fade-in-up animate-stagger-2">
                      <label className="text-sm font-semibold mb-2 block text-slate-700">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 text-brand-primary" style={{ transform: 'translateY(-50%)' }}>
                          <FaPhone size={16} />
                        </div>
                        <input
                          {...register("phone")}
                          type="tel"
                          placeholder="Enter your phone number"
                          className={`input-field ${errors.phone ? 'error' : ''} text-black`}
                          style={{ paddingLeft: '3rem' }}
                        />
                      </div>
                      {errors.phone && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-brand-danger">
                          <FaCheckCircle size={12}  className=" text-gray-950"/>
                          {errors.phone.message}
                        </div>
                      )}
                    </div>

                    <div className="animate-fade-in-up animate-stagger-3">
                      <label className="text-sm font-semibold mb-2 block text-slate-700">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 text-brand-primary" style={{ transform: 'translateY(-50%)' }}>
                          <FaLock size={16} className=" text-gray-950" />
                        </div>
                        <input
                          {...register("password")}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className={`input-field ${errors.password ? 'error' : ''} text-black`}
                          style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 cursor-pointer transition-colors"
                          style={{ transform: 'translateY(-50%)', color: '#94a3b8' }}
                        >
                          {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                      </div>
                      {errors.password && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-brand-danger">
                          <FaCheckCircle size={12} />
                          {errors.password.message}
                        </div>
                      )}
                    </div>

                    <div className="animate-fade-in-up animate-stagger-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                            Authenticating...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Access Dashboard
                            <FaArrowRight />
                          </div>
                        )}
                      </button>
                    </div>

                    <div className="text-center space-y-3 animate-fade-in-up animate-stagger-5">
                      <p className="text-sm text-slate-600">
                        Need help accessing your account?{" "}
                        <span
                          onClick={() => navigate("/admin/support")}
                          className="font-semibold cursor-pointer underline-animated text-brand-primary"
                        >
                          Contact support
                        </span>
                      </p>

                      <div className="flex items-center justify-center gap-3 text-sm text-slate-600">
                        <span className="cursor-pointer underline-animated transition-colors">
                          Forgot Password?
                        </span>
                        <span>•</span>
                        <span className="cursor-pointer underline-animated transition-colors">
                          Need Help?
                        </span>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
