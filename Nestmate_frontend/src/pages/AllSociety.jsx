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
  FaSearch,
  FaFilter,
  FaTimes,
  FaBars,
  FaArrowRight,
  FaShieldAlt,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaStar,
  FaEye,
  FaCalendarAlt,
  FaTag,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import logo from "../assets/logo6.png"; // Adjust path as needed
import patternBg from "../assets/pattern-bg.jpg"; // Adjust path as needed

const FindSociety = () => {
  const [societies, setSocieties] = useState([]);
  const [filteredSocieties, setFilteredSocieties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique cities and states for filters
//   const cities = [...new Set(societies.map(s => s.city).filter(Boolean))];
//   const states = [...new Set(societies.map(s => s.state).filter(Boolean))];

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

  // Fetch societies on component mount
  useEffect(() => {
    fetchSocieties();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...societies];

    // Apply search
    if (searchTerm) {
      result = result.filter(society =>
        society.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        society.societyCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        society.address?.toLowerCase().includes(searchTerm.toLowerCase())
        // society.state?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply city filter
    // if (selectedCity) {
    //   result = result.filter(society => society.city === selectedCity);
    // }

    // // Apply state filter
    // if (selectedState) {
    //   result = result.filter(society => society.state === selectedState);
    // }

    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "totalFlats") {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else if (sortBy === "createdAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = aValue?.toString().toLowerCase() || "";
        bValue = bValue?.toString().toLowerCase() || "";
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredSocieties(result);
  }, [searchTerm, selectedCity, selectedState, sortBy, sortOrder, societies]);

  const fetchSocieties = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/society/all");
      if (response.data.success) {
        setSocieties(response.data.data);
        setFilteredSocieties(response.data.data);
      } else {
        toast.error("Failed to fetch societies");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching societies");
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCity("");
    setSelectedState("");
    setSortBy("name");
    setSortOrder("asc");
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Embedded styles matching the security login page
  const embeddedStyles = `
:root {
  --brand-primary: 59 130 246;
  --brand-secondary: 139 92 246;
  --brand-accent: 236 72 153;
  --brand-success: 34 197 94;
  --brand-warning: 251 191 36;
  --brand-danger: 239 68 68;

  /* 🔥 DARK GLASS (FIXED) */
  --glass-bg: rgba(15, 23, 42, 0.75);
  --glass-border: rgba(255, 255, 255, 0.08);
}

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(18px);
  border: 1px solid var(--glass-border);
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
}

/* 🔥 INPUT FIX */
.input-field {
  background: rgba(30, 41, 59, 0.95);
  color: #ffffff;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  width: 100%;
}

.input-field::placeholder {
  color: rgba(255,255,255,0.6);
}

/* 🔥 BUTTON FIX */
.btn-secondary {
  background: rgba(30, 41, 59, 0.9);
  color: white;
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(51, 65, 85, 1);
  transform: translateY(-2px);
}
`;

  return (
    <>
      <style>{embeddedStyles}</style>

      {/* Background Pattern */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${patternBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.1,
        }}
      />

      {/* Floating Gradient Orbs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: mousePosition.x * 30,
            y: mousePosition.y * 30,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 30 }}
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-primary rounded-full opacity-20 blur-3xl"
        />
        <motion.div
          animate={{
            x: mousePosition.x * -20,
            y: mousePosition.y * -20,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 30 }}
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-secondary rounded-full opacity-20 blur-3xl"
          style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }}
        />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-accent rounded-full opacity-20 blur-3xl animate-float" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="UrbanNest" className="h-10 w-auto" />
            <span className="text-xl font-bold text-white">UrbanNest</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {["About", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-white/90 hover:text-white transition-colors duration-300 underline-animated"
              >
                {item}
              </a>
            ))}
            <button className="btn-secondary text-sm py-2 px-4">
              <FaHome className="mr-2" /> Back to Home
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white text-2xl"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-full left-0 right-0 glass border-t border-white/10 p-4"
          >
            <div className="flex flex-col gap-4">
              <a href="#" className="text-white/90 hover:text-white py-2">
                Home
              </a>
              <a href="#" className="text-white/90 hover:text-white py-2">
                About
              </a>
              <a href="#" className="text-white/90 hover:text-white py-2">
                Contact
              </a>
              <button className="btn-secondary text-sm py-2 px-4 w-full">
                <FaHome className="mr-2" /> Back to Home
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen py-24 px-4 sm:px-6 lg:px-8">
        <ToastContainer position="top-right" theme="dark" />

        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Find Your
              <span className="bg-gradient-primary bg-clip-text text-transparent ml-2">
                Society
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Search through registered societies and find your community
            </p>
          </motion.div>

          {/* Search and Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-2xl p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  placeholder="Search by society name, code, city, or state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-12"
                />
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center justify-center gap-2 md:w-auto"
              >
                <FaFilter />
                Filters
                {(selectedCity || selectedState || sortBy !== "name") && (
                  <span className="w-2 h-2 bg-brand-accent rounded-full" />
                )}
              </button>

              {/* Clear Filters Button */}
              {(searchTerm || selectedCity || selectedState || sortBy !== "name" || sortOrder !== "asc") && (
                <button
                  onClick={clearFilters}
                  className="btn-secondary flex items-center justify-center gap-2 md:w-auto"
                >
                  <FaTimes />
                  Clear
                </button>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-white/10"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* City Filter */}
                  <div>
                    <label className="block text-white/80 text-sm mb-2">City</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="input-field"
                    >
                      <option value="">All Cities</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  {/* State Filter */}
                  <div>
                    <label className="block text-white/80 text-sm mb-2">State</label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="input-field"
                    >
                      <option value="">All States</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="input-field"
                    >
                      <option value="name">Society Name</option>
                      <option value="city">City</option>
                      <option value="state">State</option>
                      <option value="totalFlats">Total Flats</option>
                      <option value="createdAt">Registration Date</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Order</label>
                    <button
                      onClick={toggleSortOrder}
                      className="input-field flex items-center justify-between"
                    >
                      <span>{sortOrder === "asc" ? "Ascending" : "Descending"}</span>
                      {sortOrder === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-4 text-white/80"
          >
            Found <span className="font-bold text-white">{filteredSocieties.length}</span> societies
          </motion.div>

          {/* Societies Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : filteredSocieties.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 glass rounded-2xl"
            >
              <FaBuilding className="text-6xl text-white/30 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No Societies Found</h3>
              <p className="text-white/60">Try adjusting your search or filters</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredSocieties.map((society, index) => (
                <motion.div
                  key={society._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="glass rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Society Card Header */}
                  <div className="h-32 bg-gradient-primary relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white border border-white/30">
                        {society.societyCode || "SOC-001"}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-xl font-bold text-white truncate max-w-[200px]">
                        {society.name}
                      </h3>
                    </div>
                  </div>

                  {/* Society Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Location Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-white/80">
                        <FaMapMarkerAlt className="text-brand-accent" />
                        <span>{society.address || "Address not specified"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/80">
                        <FaCity className="text-brand-accent" />
                        <span>{society.city || "City not specified"}, {society.state || "State not specified"}</span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="text-center p-2 bg-white/5 rounded-xl">
                        <FaBuilding className="text-brand-primary mx-auto mb-1" />
                        <div className="text-lg font-bold text-white">
                          {society.totalFlats || 0}
                        </div>
                        <div className="text-xs text-white/60">Total Flats</div>
                      </div>
                      <div className="text-center p-2 bg-white/5 rounded-xl">
                        <FaUser className="text-brand-secondary mx-auto mb-1" />
                        <div className="text-lg font-bold text-white truncate" title={society.admin?.fullName}>
                          {society.admin?.fullName?.split(" ")[0] || "N/A"}
                        </div>
                        <div className="text-xs text-white/60">Admin</div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div className="flex items-center gap-1 text-white/60 text-sm">
                        <FaCalendarAlt />
                        {new Date(society.createdAt).toLocaleDateString()}
                      </div>
                      <button className="text-brand-accent hover:text-white transition-colors duration-300 flex items-center gap-1 text-sm group-hover:translate-x-1 transition-transform">
                        View Details <FaArrowRight />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default FindSociety;