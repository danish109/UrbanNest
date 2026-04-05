import { Vendors } from "../models/vendors.models.js";
import { Services } from "../models/services.models.js";
/////////////////////////////////////////////////////Handling Vendors CRUD//////////////////////////////////////////////////////////////////////
export const addVendor = async (req, res) => {
  try {
    const { name, phone, email, address, documents, adder } = req.body;
    //====================keep it in mind to upload files on cloudinary from frontend and send back url to backend====================//
    if (!name || !phone || !email || !address || !documents || !adder) {
      return res.status(400).json({
        success: false,
        message: "All these are required",
      });
    }
    const result = await Vendors.create({
      name,
      email,
      phone,
      address,
      documents,
      adder,
      registeredAt: Date.now(),
    });
    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Vendor creation failed",
        error: error,
      });
    }
    return res
      .status(200)
      .json({ success: true, message: "Vendor created successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Seems to be a server issue",
      error: error,
    });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Vendors.findByIdAndDelete(id);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: "No such person in the vendors database",
      });
    }
    return res
      .status(200)
      .json({ success: true, message: "Vendor Deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Seems to be a server issue",
      error: error,
    });
  }
};

export const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Vendors.findByIdAndDelete(id, req.body, { new: true });
    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Update failed! try again please",
      });
    }
    return res
      .status(200)
      .json({ success: true, message: "Vendor Updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Seems to be a server issue",
      error: error,
    });
  }
};

export const getVendors = async (req, res) => {
  try {
    const vendorsData = await Vendors.find({});
    if (!vendorsData) {
      return res.status(400).json({
        success: false,
        message: "No vendors found",
      });
    }
    return res.status(200).json({ success: true, vendors: vendorsData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Seems to be a server issue",
      error: error,
    });
  }
};

///////////////////////////////////////////////////Handling Services CRUD////////////////////////////////////////////////////////////////////
// export const addService = async (req, res) => {
//   try {
//     const {
//       serviceName,
//       serviceType,
//       description,
//       price,
//       unit,
//       turns,
//       vendorId,
//       contact,
//       available,
//     } = req.body;
//     if (
//       !serviceName ||
//       !serviceType ||
//       !description ||
//       !price ||
//       !unit ||
//       !turns ||
//       !vendorId ||
//       !contact
    
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
        
//       });
//     }

//     const result = await Services.create({
//       serviceName,
//       serviceType,
//       description,
//       price,
//       unit,
//       turns,
//       vendorId,
//       contact,
//       available,
//     });
//     if (!result) {
//       return res.status(400).json({
//         success: false,
//         message: "Service creation failed",
//       });
//     }
//     return res
//       .status(200)
//       .json({ success: true, message: "Service created successfully" });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: "Seems to be a server issue",
//       error: error,
//     });
//   }
// };


export const addService = async (req, res) => {
  try {
    const {
      serviceName,
      serviceType,
      description,
      price,
      unit,
      turns,
      vendorId,
    } = req.body;

    // 🔴 Validation
    if (
      !serviceName ||
      !serviceType ||
      !description ||
      !price ||
      !unit ||
      !turns ||
      !vendorId
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ✅ Check if vendor exists
    const vendor = await Vendors.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Selected vendor not found",
      });
    }

    // ✅ Create service (auto attach vendor info)
    const result = await Services.create({
      serviceName,
      serviceType,
      description,
      price,
      unit,
      turns,
      vendorId: vendor._id,
      contact: vendor.phone, // 🔥 auto from vendor
      available: true, // default
    });

    return res.status(200).json({
      success: true,
      message: "Service created successfully",
      data: result,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server issue",
      error: error.message,
    });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Services.findByIdAndDelete(id);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Nothing found or something went wrong",
      });
    }
    return res
      .status(200)
      .json({ success: true, message: "Vendor Deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Seems to be a server issue",
      error: error,
    });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Services.findByIdAndDelete(id, req.body, {
      new: true,
    });
    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Update failed! try again please",
      });
    }
    return res
      .status(200)
      .json({ success: true, message: "Service Updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Seems to be a server issue",
      error: error,
    });
  }
};

export const getService = async (req, res) => {
  try {
    const serviceData = await Services.aggregate([
      {
        $lookup: {
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendor",
        },
      },
      {
        $unwind: "$vendor",
      },
    ]);

    if (!serviceData) {
      return res.status(400).json({
        success: false,
        message: "No vendors found",
      });
    }
    return res.status(200).json({ success: true, services: serviceData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Seems to be a server issue",
      error: error,
    });
  }
};
