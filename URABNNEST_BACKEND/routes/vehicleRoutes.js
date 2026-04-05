import express from "express";
import AllowedVehicle from "../models/AllowedVehicle.js";
import VehicleLog from "../models/VehicleLog.js";

const vehicleRoutes = express.Router();

vehicleRoutes.get("/allowed", async (req, res) => {
  try {
    const vehicles = await AllowedVehicle.find({ isActive: true });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

vehicleRoutes.post("/allowed", async (req, res) => {
  const { licensePlate, flatNumber, ownerName } = req.body;
  try {
    const newVehicle = new AllowedVehicle({
      licensePlate,
      flatNumber,
      ownerName,
    });
    await newVehicle.save();
    res.status(201).json(newVehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

vehicleRoutes.get("/logs", async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  try {
    const logs = await VehicleLog.find()
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    const total = await VehicleLog.countDocuments();

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

vehicleRoutes.get("/check", async (req, res) => {
  const { plate } = req.query; // Get plate from query params
  if (!plate) {
    return res.status(400).json({ message: "Plate parameter is required" });
  }

  try {
    const formattedPlate = plate.toUpperCase().replace(/\s/g, "");
    const vehicle = await AllowedVehicle.findOne({
      licensePlate: formattedPlate,
      isActive: true,
    });

    if (vehicle) {
      res.json({
        isAllowed: true,
        flatNumber: vehicle.flatNumber,
        ownerName: vehicle.ownerName,
      });
    } else {
      res.json({ isAllowed: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

vehicleRoutes.post("/logs", async (req, res) => {
  const { licensePlate, status, confidence } = req.body;
  try {
    const newLog = new VehicleLog({ licensePlate, status, confidence });
    await newLog.save();
    res.status(201).json(newLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

vehicleRoutes.get("/health", (req, res) => {
  res.json({
    status: "online",
    timestamp: new Date().toISOString(),
    service: "vehicle-management-api",
  });
});

vehicleRoutes.delete("/allowed/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await AllowedVehicle.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json({ message: "Vehicle removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default vehicleRoutes;
