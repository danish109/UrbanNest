import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaCity,
  FaFlag,
  FaHome,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaPlus,
  FaTrash,
  FaArrowRight,
  FaShieldAlt,
  FaUsers,
  FaClock,
  FaArrowLeft,
} from "react-icons/fa";
import logo from "../assets/logo6.png";
import patternBg from "../assets/pattern-bg.jpg";

const RegisterSociety = () => {
  const [formData, setFormData] = useState({
    societyName: "",
    address: "",
    city: "",
    state: "",
    totalFlats: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [towers, setTowers] = useState([{ name: "", totalFloors: "" }]);
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [timer, setTimer] = useState(30);
const [canResend, setCanResend] = useState(false);

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

  useEffect(() => {
  let interval;

  if (isOtpSent && timer > 0) {
    interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
  } else if (timer === 0) {
    setCanResend(true);
  }

  return () => clearInterval(interval);
}, [isOtpSent, timer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTowerChange = (index, e) => {
    const values = [...towers];
    values[index] = { ...values[index], [e.target.name]: e.target.value };
    setTowers(values);
  };

  const addTower = () => setTowers([...towers, { name: "", totalFloors: "" }]);

  const removeTower = (index) => {
    setTowers(towers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!isOtpSent) {
        await axios.post(`${import.meta.env.VITE_API_URL}/society/register`, {
          ...formData,
          towers,
        });

        toast.success("OTP sent to your email");
        setIsOtpSent(true);
        setIsLoading(false);
        return;
      }
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/society/register`, {
        ...formData,
        towers,
        otp,
      });

      toast.success("Society Registered Successfully");

      setFormData({
        societyName: "",
        address: "",
        city: "",
        state: "",
        totalFlats: "",
        adminName: "",
        adminEmail: "",
        adminPhone: "",
        password: "",
      });
      setOtp("");
      setIsOtpSent(false);
      setTowers([{ name: "", totalFloors: "" }]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  const handleResendOtp = async () => {
  try {
    setIsLoading(true);

    await axios.post(`${import.meta.env.VITE_API_URL}/society/register`, {
      ...formData,
      towers,
    });

    toast.success("OTP resent successfully 🔁");

    setTimer(60);
    setCanResend(false);

  } catch (error) {
    toast.error("Failed to resend OTP");
  } finally {
    setIsLoading(false);
  }
};

  const features = [
    { icon: <FaShieldAlt />, text: "Secure admin dashboard" },
    { icon: <FaUsers />, text: "Resident management tools" },
    { icon: <FaClock />, text: "24/7 support & maintenance" },
  ];

  const stats = [
    { number: "500+", label: "Societies" },
    { number: "50K+", label: "Residents" },
    { number: "4.8★", label: "Rating" },
  ];

  const inputWithIcon = (icon, name, placeholder, type = "text") => (
    <div style={{ position: "relative" }}>
      <span
        style={{
          position: "absolute",
          left: "16px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#94a3b8",
          fontSize: "14px",
        }}
      >
        {icon}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={formData[name]}
        onChange={handleChange}
        required
        style={{
          width: "100%",
          padding: "12px 16px 12px 44px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          backgroundColor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(8px)",
          fontSize: "14px",
          transition: "all 0.3s ease",
          outline: "none",
          color: "#1e293b",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#3b82f6";
          e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
          e.target.style.backgroundColor = "#fff";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#e2e8f0";
          e.target.style.boxShadow = "none";
          e.target.style.backgroundColor = "rgba(255,255,255,0.9)";
        }}
      />
    </div>
  );

  return (
    <>
      <ToastContainer position="top-right" theme="colored" />

      <div
        style={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #f8fafc, #eff6ff, #faf5ff)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <img
            src={patternBg}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.15,
            }}
          />
        </div>

        {/* Floating gradient orbs */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              width: "384px",
              height: "384px",
              borderRadius: "50%",
              opacity: 0.2,
              filter: "blur(64px)",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              top: "10%",
              left: "10%",
              x: mousePosition.x * 30,
              y: mousePosition.y * 30,
            }}
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            style={{
              position: "absolute",
              width: "320px",
              height: "320px",
              borderRadius: "50%",
              opacity: 0.15,
              filter: "blur(64px)",
              background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
              bottom: "10%",
              right: "10%",
              x: mousePosition.x * -20,
              y: mousePosition.y * -20,
            }}
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Main content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Navbar */}
          <motion.nav
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{
              width: "100%",
              padding: "12px 16px",
            }}
          >
            <div
              style={{
                maxWidth: "1280px",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap", // ✅ important for small screens
                gap: "10px",
              }}
            >
              {/* LEFT SIDE */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  minWidth: "0", // prevents overflow
                }}
              >
                <img
                  src={logo}
                  alt="UrbanNest"
                  style={{
                    height: "50px", // ✅ reduced for mobile
                    width: "50px",
                    objectFit: "contain",
                  }}
                />

                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "clamp(18px, 4vw, 28px)", // ✅ responsive text
                    fontWeight: 900,
                    backgroundImage:
                      "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    whiteSpace: "nowrap",
                  }}
                >
                  UrbanNest
                </span>
              </div>

              {/* RIGHT SIDE */}
              <a
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  color: "#334155",
                  fontWeight: 600,
                  fontSize: "clamp(12px, 2.5vw, 14px)", // ✅ responsive text
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  backdropFilter: "blur(8px)",
                  whiteSpace: "nowrap",
                }}
              >
                <FaArrowLeft style={{ fontSize: "12px" }} />
                Back
              </a>
            </div>
          </motion.nav>

          {/* Content */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px 16px",
            }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{
                width: "100%",
                maxWidth: "1100px",
                backgroundColor: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(24px)",
                border: "1px solid #e2e8f0",
                borderRadius: "24px",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              {/* Left side — Feature showcase */}
              <div
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  minWidth: "300px",
                  flex: "1 1 38%",
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  padding: "48px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  color: "#fff",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative circles */}
                <div
                  style={{
                    position: "absolute",
                    top: "-80px",
                    right: "-80px",
                    width: "240px",
                    height: "240px",
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "-64px",
                    left: "-64px",
                    width: "192px",
                    height: "192px",
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />

                <div style={{ position: "relative", zIndex: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    <FaBuilding />
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "1.5px",
                        opacity: 0.9,
                      }}
                    >
                      Society Registration
                    </span>
                  </div>

                  <h1
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "clamp(24px, 4vw, 36px)",
                      fontWeight: 700,
                      lineHeight: 1.25,
                      marginBottom: "16px",
                    }}
                  >
                    Register Your{" "}
                    <span
                      style={{
                        textDecoration: "underline",
                        textDecorationColor: "rgba(255,255,255,0.3)",
                        textUnderlineOffset: "6px",
                      }}
                    >
                      Community
                    </span>
                  </h1>

                  <p
                    style={{
                      opacity: 0.8,
                      lineHeight: 1.6,
                      marginBottom: "32px",
                      fontSize: "14px",
                    }}
                  >
                    Set up your society on UrbanNest and provide your residents
                    with a seamless digital experience for community management.
                  </p>

                  {/* Features */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      marginBottom: "32px",
                    }}
                  >
                    {features.map((f, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 + i * 0.15 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            backgroundColor: "rgba(255,255,255,0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {f.icon}
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: 500 }}>
                          {f.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "12px",
                    }}
                  >
                    {stats.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                        style={{
                          backgroundColor: "rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          padding: "12px",
                          textAlign: "center",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: 700,
                            fontSize: "18px",
                          }}
                        >
                          {s.number}
                        </div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>
                          {s.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right side — Form */}
              <div
                style={{ flex: "1 1 55%", padding: "40px", minWidth: "320px" }}
              >
                <div style={{ marginBottom: "24px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <FaBuilding style={{ color: "#fff", fontSize: "18px" }} />
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    Society Details
                  </h2>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "14px",
                      marginTop: "4px",
                    }}
                  >
                    Fill in the information to register your society
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Society Information */}
                  <div style={{ marginBottom: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "12px",
                      }}
                    >
                      <FaHome style={{ color: "#3b82f6", fontSize: "14px" }} />
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#1e293b",
                        }}
                      >
                        Society Information
                      </span>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "12px",
                      }}
                    >
                      {inputWithIcon(
                        <FaBuilding />,
                        "societyName",
                        "Society Name",
                      )}
                      {inputWithIcon(<FaMapMarkerAlt />, "address", "Address")}
                      {inputWithIcon(<FaCity />, "city", "City")}
                      {inputWithIcon(<FaFlag />, "state", "State")}
                      {inputWithIcon(
                        <FaHome />,
                        "totalFlats",
                        "Total Flats",
                        "number",
                      )}
                    </div>
                  </div>

                  {/* Towers */}
                  <div style={{ marginBottom: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "12px",
                      }}
                    >
                      <FaBuilding
                        style={{ color: "#3b82f6", fontSize: "14px" }}
                      />
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#1e293b",
                        }}
                      >
                        Towers / Buildings
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {towers.map((tower, index) => (
                        <div
                          key={index}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr auto",
                            gap: "12px",
                            alignItems: "center",
                          }}
                        >
                          <input
                            type="text"
                            name="name"
                            placeholder="Tower Name"
                            value={tower.name}
                            onChange={(e) => handleTowerChange(index, e)}
                            required
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              borderRadius: "12px",
                              border: "1px solid #e2e8f0",
                              backgroundColor: "rgba(255,255,255,0.9)",
                              fontSize: "14px",
                              outline: "none",
                              color: "#1e293b",
                            }}
                          />
                          <input
                            type="number"
                            name="totalFloors"
                            placeholder="Total Floors"
                            value={tower.totalFloors}
                            onChange={(e) => handleTowerChange(index, e)}
                            required
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              borderRadius: "12px",
                              border: "1px solid #e2e8f0",
                              backgroundColor: "rgba(255,255,255,0.9)",
                              fontSize: "14px",
                              outline: "none",
                              color: "#1e293b",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeTower(index)}
                            disabled={towers.length === 1}
                            style={{
                              padding: "12px",
                              borderRadius: "12px",
                              border: "1px solid #e2e8f0",
                              backgroundColor: "rgba(255,255,255,0.9)",
                              color:
                                towers.length === 1 ? "#cbd5e1" : "#ef4444",
                              cursor:
                                towers.length === 1 ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <FaTrash style={{ fontSize: "14px" }} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addTower}
                      style={{
                        marginTop: "12px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 20px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "rgba(255,255,255,0.9)",
                        color: "#334155",
                        fontWeight: 600,
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      <FaPlus style={{ fontSize: "12px" }} /> Add Tower
                    </button>
                  </div>

                  {/* Admin Details */}
                  <div style={{ marginBottom: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "12px",
                      }}
                    >
                      <FaUser style={{ color: "#3b82f6", fontSize: "14px" }} />
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#1e293b",
                        }}
                      >
                        Admin Details
                      </span>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "12px",
                      }}
                    >
                      {inputWithIcon(<FaUser />, "adminName", "Admin Name")}
                      {inputWithIcon(
                        <FaEnvelope />,
                        "adminEmail",
                        "Admin Email",
                        "email",
                      )}
                      {inputWithIcon(
                        <FaPhone />,
                        "adminPhone",
                        "Phone Number",
                        "tel",
                      )}
                      {inputWithIcon(
                        <FaLock />,
                        "password",
                        "Password",
                        "password",
                      )}
                    </div>
                    {/* OTP FIELD (NEW) */}
                   {isOtpSent && (
  <div style={{ marginTop: "12px" }}>
    
    {/* OTP INPUT */}
    <input
      type="text"
      placeholder="Enter OTP"
      value={otp}
      onChange={(e) => setOtp(e.target.value)}
      required
      style={{
        width: "100%",
        padding: "14px 16px",
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(6px)",
        fontSize: "16px",
        fontWeight: "500",
        letterSpacing: "6px",
        textAlign: "center",
        outline: "none",
        color: "#1e293b",
        transition: "all 0.25s ease",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "#3b82f6";
        e.currentTarget.style.boxShadow =
          "0 0 0 3px rgba(59,130,246,0.15)";
        e.currentTarget.style.background = "#ffffff";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.boxShadow =
          "0 4px 12px rgba(0,0,0,0.05)";
        e.currentTarget.style.background =
          "rgba(255,255,255,0.9)";
      }}
    />

    {/* TIMER + RESEND */}
    <div
      style={{
        marginTop: "8px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* TIMER */}
      <span
        style={{
          fontSize: "13px",
          color: timer === 0 ? "#ef4444" : "#64748b",
          fontWeight: 500,
        }}
      >
        {timer > 0 ? `Resend in ${timer}s` : "You can resend OTP"}
      </span>

      {/* RESEND BUTTON */}
      <button
        type="button"
        onClick={handleResendOtp}
        disabled={!canResend}
        style={{
          border: "none",
          background: "none",
          color: canResend ? "#3b82f6" : "#94a3b8",
          fontWeight: 600,
          cursor: canResend ? "pointer" : "not-allowed",
          fontSize: "13px",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          if (canResend) e.currentTarget.style.textDecoration = "underline";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.textDecoration = "none";
        }}
      >
        Resend OTP
      </button>
    </div>

  </div>
)}
 
                    <button
                      type="submit"
                      disabled={isLoading}
                      style={{
                        width: "100%",
                        padding: "14px 20px",
                        borderRadius: "14px",
                        border: "1px solid rgba(255,255,255,0.2)",
                        background: isLoading
                          ? "linear-gradient(135deg, #94a3b8, #64748b)"
                          : "linear-gradient(135deg, #3b82f6, #6366f1)",
                        color: "#fff",
                        fontWeight: "600",
                        fontSize: "15px",
                        letterSpacing: "0.3px",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        opacity: isLoading ? 0.75 : 1,
                        boxShadow: isLoading
                          ? "none"
                          : "0 10px 25px -10px rgba(59,130,246,0.6)",
                        transition: "all 0.25s ease",
                        backdropFilter: "blur(6px)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 15px 35px -10px rgba(59,130,246,0.8)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.transform = "translateY(0px)";
                          e.currentTarget.style.boxShadow =
                            "0 10px 25px -10px rgba(59,130,246,0.6)";
                        }
                      }}
                      onMouseDown={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.transform = "scale(0.96)";
                        }
                      }}
                      onMouseUp={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.transform = "scale(1)";
                        }
                      }}
                    >
                      {isLoading
                        ? "Processing..."
                        : isOtpSent
                          ? "Verify OTP & Register"
                          : "Send OTP"}
                    </button>
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: "100%",
                      padding: "14px 32px",
                      borderRadius: "12px",
                      border: "none",
                      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "16px",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      opacity: isLoading ? 0.5 : 1,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 8px 25px -8px rgba(59,130,246,0.5)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin"
                          style={{ height: "20px", width: "20px" }}
                          viewBox="0 0 24 24"
                        >
                          <circle
                            style={{ opacity: 0.25 }}
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            style={{ opacity: 0.75 }}
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Registering...
                      </>
                    ) : (
                      <>
                        Register Society <FaArrowRight />
                      </>
                    )}
                  </motion.button>

                  <p
                    style={{
                      textAlign: "center",
                      fontSize: "14px",
                      color: "#64748b",
                      marginTop: "16px",
                    }}
                  >
                    Already have a society?{" "}
                    <a
                      href="login/admin"
                      style={{
                        fontWeight: 600,
                        color: "#3b82f6",
                        textDecoration: "none",
                      }}
                    >
                      Login
                    </a>
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterSociety;
