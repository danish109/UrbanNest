import { GuardData } from "../models/guards.models.js";
import { Admin } from "../models/admin.models.js";

function generateRandom() {
  const arr = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789!@?_-";
  const len = arr.length;
  let res = "";
  for (let i = 0; i < 10; i++) {
    res += arr.charAt(Math.floor(Math.random() * len));
  }
  return res;
}

export const handleAddGuards = async (req, res) => {
  try {
    //verifying ADMINLEVEL
    const { id } = req.user;
    const user = await Admin.findById(id);
    const { fullName, phone, shift, status } = req.body;
    if (!fullName || !phone || !shift) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //check if input guard is new entry
    const guard = await GuardData.findOne({ phone, fullName });
    if (guard) {
      return res.status(400).json({
        success: false,
        message: "Guard already exists",
      });
    }

    const pass = generateRandom();

    //adding
    const here = await GuardData.create({
      fullName,
      guardKey: pass,
      phone,
      shift: shift,
      status: status,
    });
    return res.status(200).json({
      success: true,
      message: "Guard employed successfully",
      guard: {
        fullName,
        pass,
        phone,
        shift,
        status,
      },
    });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate entry for guardKey",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Seems to be a server issue",
      error: error,
    });
  }
};

export const handleUpdateGuards = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await Admin.findById(id);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Not authorized" });
    }

    const { guardId } = req.params;
    const result = await GuardData.findByIdAndUpdate(guardId, req.body, {
      new: true,
    });

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Guard not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Guard updated successfully",
      guard: result,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const handleDeleteGuards = async (req, res) => {
  try {
    // const { id } = req.user;
    // const user = await Admin.findById(id);

    // if (user.adminlevel !== "SUPER ADMIN") {
    //   return res.status(400).json({
    //     success: false,
    //     message: "You are not authorized to do this function",
    //   });
    // }

    const { guardId } = req.params; // ✅ get guardId from URL
    const result = await GuardData.findById(guardId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Guard not found",
      });
    }

    await result.deleteOne();
    // await GuardData.findByIdAndDelete(guardId);

    return res.status(200).json({
      success: true,
      message: "Guard deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const handleGetAllGuards = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await Admin.findById(id);

    // Optional: restrict access
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const guards = await GuardData.find().sort({ createdAt: -1 }); // latest first

    return res.status(200).json({
      success: true,
      count: guards.length,
      guards,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
