import { Houses } from "../models/houses.models.js";
import { Admin } from "../models/admin.models.js";
import { Resident } from "../models/residents.models.js";
import { sendAllotmentEmail } from "../services/emailService.js";

function generatePasskey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
  let key = "";
  for (let i = 0; i < 10; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export const handleAddHouse = async (req, res) => {
  try {
    const { flatNo, block, email } = req.body;

    // ✅ Validation
    if (!flatNo || !block) {
      return res.status(400).json({
        success: false,
        message: "FlatNo, Block and Email are required",
      });
    }

    // ✅ Email validation
    // if (!/^\S+@\S+\.\S+$/.test(email)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid email format",
    //   });
    // }

    // ✅ Check if house already exists
    const result = await Resident.findOne({ flatNo, block });
    if (result) {
      return res.status(400).json({
        success: false,
        message: "House already exists in database",
      });
    }

    // ✅ Generate UNIQUE passkey
    let passkey;
    let isUnique = false;

    while (!isUnique) {
      passkey = generatePasskey();
      const existing = await Resident.findOne({ passkey });
      if (!existing) isUnique = true;
    }

    // ✅ Create house
    const house = await Resident.create({
      flatNo,
      block,
      passkey,
      email, // optional, depends on your schema
      ownerStatus: "VACANT",
    });

    // ✅ SEND EMAIL (without status)
    try {
      await sendAllotmentEmail({
        email,
        fullName: "Resident", // since name not available yet
        flatNo,
        block,

        passkey,
      });
    } catch (err) {
      console.log("Email failed:", err);
    }

    // ✅ Response
    return res.status(200).json({
      success: true,
      message: "House added successfully",
      data: {
        flatNo,
        block,
        passkey,
        email,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Seems to be a server issue",
      error: error.message,
    });
  }
};

export const handleAllotHouse = async (req, res) => {
  try {
    const {
      flatNo,
      block,
      ownerStatus,
      fullName,
      registry,
      phone,
      email,
      nominee,
      tenure,
    } = req.body;

    // ✅ Validation
    if (
      !flatNo ||
      !block ||
      !ownerStatus ||
      !fullName ||
      !registry ||
      !phone ||
      !email ||
      !nominee
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ✅ Find house
    const house = await Resident.findOne({ flatNo, block });

    if (!house) {
      return res.status(400).json({
        success: false,
        message: "No house found",
      });
    }

    // ✅ Phone validation
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    // ✅ Email validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    // ✅ Tenure validation
    if (ownerStatus === "RENTED" && !tenure) {
      return res.status(400).json({
        success: false,
        message: "Tenure required for rented house",
      });
    }

    // ✅ Generate passkey
    const pass = generatePasskey();

    // ✅ Update DB
    await house.updateOne({
      $set: {
        ownerStatus: "OCCUPIED",
        fullName,
        registry,
        phone,
        email,
        nominee,
        tenure: ownerStatus === "RENTED" ? tenure : undefined,
        passkey: pass,
      },
    });

    // ✅ SEND EMAIL
    await sendAllotmentEmail({
      email,
      fullName,
      flatNo,
      block,
      ownerStatus,
      passkey: pass,
    });

    // ✅ Response
    return res.status(200).json({
      success: true,
      message: "House allotted successfully",
      data: {
        flatNo,
        block,
        fullName,
        email,
        passkey: pass,
      },
    });
  } catch (error) {
    console.log("Allot error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const handleUpdateHouse = async (req, res) => {
  try {
    const { flatNo, block } = req.body;
    const pass = generateRandom();
    const updated = await Resident.findOneAndUpdate(
      { flatNo, block },
      req.body,
      pass,
      { new: true },
    );
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "Update failed, try again",
      });
    }
    return res
      .status(200)
      .json({ success: true, message: "update successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Seems to be a server issue",
      error: error,
    });
  }
};

export const handleDeleteOwner = async (req, res) => {
  try {
    const { block, flatNo } = req.body;

    if (!block || !flatNo) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const result = await Resident.findOne({ flatNo, block });

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Nothing found in records",
      });
    }

    await result.updateOne({
      ownerStatus: "VACANT", // also fixed spelling
      $unset: {
        passkey: "",
        fullName: "",
        registry: "",
        phone: "",
        email: "",
        tenure: "",
        nominee: "",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Owner deleted",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Seems to be a server issue",
      error: error,
    });
  }
};
export const handleGetAllHouses = async (req, res) => {
  try {
    const houses = await Resident.find()
      .select("fullName block flatNo passkey email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: houses.length,
      data: houses,
    });
  } catch (error) {
    console.error("Get Houses Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
