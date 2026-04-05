import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import socket from "../../../services/socket";
import {
  FaEye,
  FaEyeSlash,
  FaHome,
  FaUserPlus,
  FaBars,
  FaTimes,
  FaArrowRight,
  FaUsers,
  FaBuilding,
  FaLock,
  FaPhone,
  FaEnvelope,
  FaKey,
  FaCheckCircle,
  FaStar,
  FaClock,
  FaUser,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaChartBar,
  FaShieldAlt,
  FaCalendarAlt,
  FaComments,
  FaExclamationTriangle,
  FaCheck,
  FaTimes as FaTimesIcon,
} from "react-icons/fa";
import logo from "../../assets/logo6.png";

const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name can't exceed 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),
    email: z.string().email("Please enter a valid email address"),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number can't exceed 15 digits")
      .regex(/^[0-9]+$/, "Phone number must contain only numbers"),
    emnum: z
      .string()
      .min(10, "Emergency number must be at least 10 digits")
      .max(15, "Emergency number can't exceed 15 digits")
      .regex(/^[0-9]+$/, "Emergency number must contain only numbers"),
    flatNo: z
      .string()
      .min(1, "Flat number is required")
      .max(10, "Flat number can't exceed 10 characters"),
    block: z
      .string()
      .min(1, "Block is required")
      .max(10, "Block can't exceed 10 characters"),
    passkey: z
      .string()
      .min(6, "Passkey must be at least 6 characters")
      .max(12, "Passkey can't exceed 12 characters"),
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
    confirmPassword: z.string(),
    otp: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const ResidentSignup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showOTPField, setShowOTPField] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
const [resendDisabled, setResendDisabled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const email = watch("email");
  useEffect(() => {
  let interval;
  if (otpTimer > 0) {
    interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
  } else {
    setResendDisabled(false);
  }

  return () => clearInterval(interval);
}, [otpTimer]);

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

    // Listen for WebSocket events
    socket.on("otp_sent", (data) => {
      console.log("OTP sent:", data);
      alert("OTP sent to your email!");
      setShowOTPField(true);
      setOtpLoading(false);
    });

    socket.on("otp_verified", (data) => {
      console.log("OTP verified:", data);
      setOtpVerified(true);
      alert("OTP verified successfully!");
    });

    socket.on("signup_success", (data) => {
      console.log("Signup success:", data);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/resident/dashboard");
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      socket.off("otp_sent");
      socket.off("otp_verified");
      socket.off("signup_success");
    };
  }, [navigate]);

 const handleSendOTP = async () => {
  if (!email) {
    alert("Please enter your email first");
    return;
  }

  if (resendDisabled) return;

  setOtpLoading(true);

  try {
    const res = await axios.post(
    `${import.meta.env.VITE_API_URL}/user/send-otp`,
      { email },
      { withCredentials: true }
    );

    if (res.data.success) {
      alert("OTP sent successfully!");
      setShowOTPField(true);
      setOtpTimer(30); // ⏱ 30 sec cooldown
      setResendDisabled(true);
    } else {
      alert(res.data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Error sending OTP");
  } finally {
    setOtpLoading(false);
  }
};
const handleVerifyOTP = async (otp) => {
  if (!otp) {
    alert("Enter OTP first");
    return;
  }

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/user/verify-otp`,
      { email, otp },
      { withCredentials: true }
    );

    if (res.data.success) {
      setOtpVerified(true);
      alert("OTP verified successfully!");
    } else {
      alert(res.data.message);
    }
  } catch (error) {
    console.error(error);
    alert("OTP verification failed");
  }
};

  const handleSignup = async (data) => {
    if (!otpVerified) {
      alert("Please verify your OTP first");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/resident/signup`,
        {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          password: data.password,
          emnum: data.emnum,
          flatNo: data.flatNo,
          block: data.block,
          passkey: data.passkey,
          otp: data.otp,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        alert("Signup successful!");
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/resident/dashboard");
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      setError("root", {
        type: "manual",
        message:
          err.response?.data?.message || "Signup failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 font-sans overflow-hidden">
      <style>{`
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
        
        .btn-otp {
          background: linear-gradient(135deg, rgb(var(--brand-success)), rgb(var(--brand-primary)));
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
        }
        
        .btn-otp:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px -4px rgba(var(--brand-success), 0.4);
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
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-fade-in-left { animation: fadeInLeft 0.8s ease-out; }
        .animate-fade-in-right { animation: fadeInRight 0.8s ease-out; }
        .animate-fade-in-down { animation: fadeInDown 0.8s ease-out; }
        
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
        .text-brand-danger { color: rgb(var(--brand-danger)); }
        .text-brand-success { color: rgb(var(--brand-success)); }
        
        .rounded-4xl { border-radius: 2rem; }
        
        /* Additional styles for better spacing and layout */
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
        .p-4 { padding: 1rem; }
        .p-6 { padding: 1.5rem; }
        .p-8 { padding: 2rem; }
        .p-12 { padding: 3rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-4 { margin-top: 1rem; }
        .w-2 { width: 0.5rem; }
        .w-5 { width: 1.25rem; }
        .w-12 { width: 3rem; }
        .w-16 { width: 4rem; }
        .w-32 { width: 8rem; }
        .w-40 { width: 10rem; }
        .w-72 { width: 18rem; }
        .w-80 { width: 20rem; }
        .w-96 { width: 24rem; }
        .w-full { width: 100%; }
        .h-2 { height: 0.5rem; }
        .h-5 { height: 1.25rem; }
        .h-6 { height: 1.5rem; }
        .h-12 { height: 3rem; }
        .h-16 { height: 4rem; }
        .h-32 { height: 8rem; }
        .h-40 { height: 10rem; }
        .h-72 { height: 18rem; }
        .h-80 { height: 20rem; }
        .h-96 { height: 24rem; }
        .max-w-2xl { max-width: 42rem; }
        .max-w-7xl { max-width: 80rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .rounded-full { border-radius: 9999px; }
        .rounded-2xl { border-radius: 1rem; }
        .rounded-3xl { border-radius: 1.5rem; }
        .border { border-width: 1px; }
        .border-red-200 { border-color: #fecaca; }
        .border-green-200 { border-color: #bbf7d0; }
        .border-white\\/20 { border-color: rgba(255, 255, 255, 0.2); }
        .border-white\\/40 { border-color: rgba(255, 255, 255, 0.4); }
        .backdrop-blur-sm { backdrop-filter: blur(4px); }
        .backdrop-blur-xl { backdrop-filter: blur(24px); }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .cursor-pointer { cursor: pointer; }
        .transition-all { transition-property: all; }
        .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; }
        .transition-transform { transition-property: transform; }
        .duration-300 { transition-duration: 300ms; }
        .duration-500 { transition-duration: 500ms; }
        .duration-1000 { transition-duration: 1000ms; }
        .ease-out { transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }
        .hover\\:scale-105:hover { transform: scale(1.05); }
        .hover\\:scale-110:hover { transform: scale(1.1); }
        .hover\\:rotate-12:hover { transform: rotate(12deg); }
        .hover\\:shadow-2xl:hover { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .hover\\:text-brand-primary:hover { color: rgb(var(--brand-primary)); }
        .group:hover .group-hover\\:translate-x-2 { transform: translateX(0.5rem); }
        .opacity-0 { opacity: 0; }
        .opacity-20 { opacity: 0.2; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-spin { animation: spin 1s linear infinite; }
        .bg-clip-text { background-clip: text; }
        .text-transparent { color: transparent; }
        .text-center { text-align: center; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem; }
        .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
        .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
        .space-y-8 > :not([hidden]) ~ :not([hidden]) { margin-top: 2rem; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .flex-col { flex-direction: column; }
        .blur-3xl { filter: blur(64px); }
        .top-20 { top: 5rem; }
        .left-20 { left: 5rem; }
        .right-20 { right: 5rem; }
        .bottom-20 { bottom: 5rem; }
        .left-1\\/3 { left: 33.333333%; }
        .left-4 { left: 1rem; }
        .right-4 { right: 1rem; }
        .top-1\\/2 { top: 50%; }
        .top-1\\/3 { top: 33.333333%; }
        .transform { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
        .-translate-y-1\\/2 { transform: translateY(-50%); }
        .translate-x-\\[-50px\\] { transform: translateX(-50px); }
        .translate-x-\\[50px\\] { transform: translateX(50px); }
        .pt-4 { padding-top: 1rem; }
        .pt-6 { padding-top: 1.5rem; }
        .pt-8 { padding-top: 2rem; }
        .pl-12 { padding-left: 3rem; }
        .pr-12 { padding-right: 3rem; }
        .max-h-screen { max-height: 100vh; }
        .overflow-y-auto { overflow-y: auto; }
        .bg-red-50 { background-color: #fef2f2; }
        .bg-green-50 { background-color: #f0fdf4; }
        .border-2 { border-width: 2px; }
        .border-t { border-top-width: 1px; }
        .border-white\\/30 { border-color: rgba(255, 255, 255, 0.3); }
        .border-t-white { border-top-color: #ffffff; }
        .disabled\\:opacity-50:disabled { opacity: 0.5; }
        .disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }
        .-top-20 { top: -5rem; }
        .-right-20 { right: -5rem; }
        .-bottom-10 { bottom: -2.5rem; }
        .-left-10 { left: -2.5rem; }
        .block { display: block; }
        
        @media (min-width: 768px) {
          .md\\:flex { display: flex; }
          .md\\:hidden { display: none; }
          .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        
        @media (min-width: 1024px) {
          .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .lg\\:text-5xl { font-size: 3rem; line-height: 1; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

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
      <nav className="relative z-50 glass backdrop-blur-xl animate-fade-in-down" style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl cursor-pointer transition-all duration-500 hover:scale-110 hover:rotate-12 shadow-lg hover:shadow-2xl">
                <img src={logo} alt="UrbanNest" className="w-full h-full" />
              </div>
            </div>
            <span className="text-xl md:text-3xl lg:text-4xl font-bold font-display bg-gradient-primary bg-clip-text text-transparent tracking-wide">
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

      {/* Main Signup Section */}
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
                  Join Our Community
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold font-display leading-tight">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Welcome to
                </span>
                <br />
                <span className="text-slate-800">Your New</span>
                <br />
                <span className="bg-gradient-secondary bg-clip-text text-transparent">
                  Smart Community
                </span>
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
                Join thousands of residents enjoying modern community living
                with digital convenience, enhanced security, and seamless
                communication.
              </p>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 gap-4 pt-8">
                {[
                  {
                    icon: <FaHome />,
                    text: "Smart Home Integration",
                  },
                  {
                    icon: <FaUsers />,
                    text: "Community Network",
                  },
                  { icon: <FaBuilding />, text: "Modern Amenities" },
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

            {/* Floating Community Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              {[
                { number: "5000+", label: "Residents" },
                { number: "150+", label: "Buildings" },
                { number: "24/7", label: "Security" },
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

          {/* Right Side - Signup Form */}
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
            <div className="glass backdrop-blur-xl p-8 rounded-4xl border border-white/20 shadow-2xl max-w-2xl mx-auto relative overflow-hidden max-h-screen overflow-y-auto">
              {/* Background Decorative Elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-primary opacity-20 rounded-full animate-float"></div>
              <div
                className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-secondary opacity-20 rounded-full animate-float"
                style={{ animationDelay: "1s" }}
              ></div>

              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FaUserPlus className="text-2xl text-white" />
                  </div>
                  <h2 className="text-3xl font-bold font-display text-slate-800 mb-2">
                    Resident Signup
                  </h2>
                  <p className="text-slate-600">
                    Create your community account
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
                      <FaExclamationTriangle className="text-red-500" />
                      {errors.root.message}
                    </div>
                  </motion.div>
                )}

                {/* OTP Verification Status */}
                {otpVerified && (
                  <motion.div
                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-600 text-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-2">
                      <FaCheck className="text-green-500" />
                      OTP verified successfully! You can now complete your
                      registration.
                    </div>
                  </motion.div>
                )}

                {/* Signup Form */}
                <form
                  onSubmit={handleSubmit(handleSignup)}
                  className="space-y-4"
                >
                  {/* Form Fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label className="block text-slate-700 mb-2 text-sm font-semibold">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        {...register("fullName")}
                        className={`input-field ${
                          errors.fullName ? "error" : ""
                        }`}
                      />
                      {errors.fullName && (
                        <p className="text-brand-danger text-xs mt-2">
                          {errors.fullName.message}
                        </p>
                      )}
                    </motion.div>

                    {/* Email Field with OTP */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label className="block text-slate-700 mb-2 text-sm font-semibold">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                          <FaEnvelope />
                        </div>
                        <input
                          type="email"
                          placeholder="Enter your email"
                          {...register("email")}
                          className={`input-field pl-12 ${
                            errors.email ? "error" : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={otpLoading || !email || otpVerified}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-otp disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {otpLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Sending...
                            </div>
                          ) : otpVerified ? (
                            <div className="flex items-center gap-2">
                              <FaCheck className="text-white" />
                              Verified
                            </div>
                          ) : (
                            "Send OTP"
                          )}
                        </button>
                      </div>
                      {errors.email && (
                        <p className="text-brand-danger text-xs mt-2">
                          {errors.email.message}
                        </p>
                      )}
                    </motion.div>

                    {/* OTP Field */}
                    {showOTPField && !otpVerified && (
  <motion.div className="md:col-span-2">
    <label className="block text-slate-700 mb-2 text-sm font-semibold">
      OTP Verification
    </label>

    <div className="flex gap-3">
      <input
        type="text"
        placeholder="Enter OTP"
        {...register("otp")}
        className="input-field flex-1"
      />

      <button
        type="button"
        onClick={() => handleVerifyOTP(watch("otp"))}
        className="btn-otp"
      >
        Verify
      </button>
    </div>

    {/* 🔥 RESEND BUTTON */}
    <div className="flex justify-between items-center mt-2 text-sm">
      <span className="text-slate-500">
        {otpTimer > 0
          ? `Resend in ${otpTimer}s`
          : "Didn't receive OTP?"}
      </span>

      <button
        type="button"
        onClick={handleSendOTP}
        disabled={resendDisabled}
        className="text-brand-primary font-semibold disabled:opacity-50"
      >
        Resend OTP
      </button>
    </div>
  </motion.div>
)}

                    {/* Phone Number Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
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
                          placeholder="Enter your phone"
                          {...register("phone")}
                          className={`input-field pl-12 ${
                            errors.phone ? "error" : ""
                          }`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-brand-danger text-xs mt-2">
                          {errors.phone.message}
                        </p>
                      )}
                    </motion.div>

                    {/* Emergency Number Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <label className="block text-slate-700 mb-2 text-sm font-semibold">
                        Emergency Contact
                      </label>
                      <input
                        type="text"
                        placeholder="Emergency number"
                        {...register("emnum")}
                        className={`input-field ${errors.emnum ? "error" : ""}`}
                      />
                      {errors.emnum && (
                        <p className="text-brand-danger text-xs mt-2">
                          {errors.emnum.message}
                        </p>
                      )}
                    </motion.div>

                    {/* Flat Number Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <label className="block text-slate-700 mb-2 text-sm font-semibold">
                        Flat Number
                      </label>
                      <input
                        type="text"
                        placeholder="Enter flat number"
                        {...register("flatNo")}
                        className={`input-field ${
                          errors.flatNo ? "error" : ""
                        }`}
                      />
                      {errors.flatNo && (
                        <p className="text-brand-danger text-xs mt-2">
                          {errors.flatNo.message}
                        </p>
                      )}
                    </motion.div>

                    {/* Block Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                    >
                      <label className="block text-slate-700 mb-2 text-sm font-semibold">
                        Block
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                          <FaBuilding />
                        </div>
                        <input
                          type="text"
                          placeholder="Enter block"
                          {...register("block")}
                          className={`input-field pl-12 ${
                            errors.block ? "error" : ""
                          }`}
                        />
                      </div>
                      {errors.block && (
                        <p className="text-brand-danger text-xs mt-2">
                          {errors.block.message}
                        </p>
                      )}
                    </motion.div>
                  </div>

                  {/* Passkey Field - Full Width */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <label className="block text-slate-700 mb-2 text-sm font-semibold">
                      Passkey
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <FaKey />
                      </div>
                      <input
                        type={showPasskey ? "text" : "password"}
                        placeholder="Enter your passkey"
                        {...register("passkey")}
                        className={`input-field pl-12 pr-12 ${
                          errors.passkey ? "error" : ""
                        }`}
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-brand-primary transition-colors"
                        onClick={() => setShowPasskey(!showPasskey)}
                      >
                        {showPasskey ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.passkey && (
                      <p className="text-brand-danger text-xs mt-2">
                        {errors.passkey.message}
                      </p>
                    )}
                  </motion.div>

                  {/* Password Fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Password Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1 }}
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
                          placeholder="Create password"
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
                        <p className="text-brand-danger text-xs mt-2">
                          {errors.password.message}
                        </p>
                      )}
                    </motion.div>

                    {/* Confirm Password Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                    >
                      <label className="block text-slate-700 mb-2 text-sm font-semibold">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                          <FaLock />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          {...register("confirmPassword")}
                          className={`input-field pl-12 pr-12 ${
                            errors.confirmPassword ? "error" : ""
                          }`}
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-brand-primary transition-colors"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-brand-danger text-xs mt-2">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </motion.div>
                  </div>

                  {/* Signup Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 }}
                    className="pt-4"
                  >
                    <button
                      type="submit"
                      disabled={isLoading || !otpVerified}
                      className={`btn-primary w-full text-lg group ${
                        isLoading || !otpVerified
                          ? "disabled:opacity-50 disabled:cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Creating Account...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          {otpVerified ? "Join Community" : "Verify OTP First"}
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
                    transition={{ delay: 1.4 }}
                  >
                    <p className="text-slate-600 mb-4">
                      Already have an account?{" "}
                      <Link
                        to="/login/resident"
                        className="text-brand-primary font-semibold hover:underline transition-all"
                      >
                        Sign in here
                      </Link>
                    </p>

                    <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
                      <Link
                        to="/terms"
                        className="hover:text-brand-primary transition-colors"
                      >
                        Terms of Service
                      </Link>
                      <span>•</span>
                      <Link
                        to="/privacy"
                        className="hover:text-brand-primary transition-colors"
                      >
                        Privacy Policy
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

export default ResidentSignup;
