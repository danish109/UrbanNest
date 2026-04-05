import { Billables }from "../models/billable.models.js";

// Process payment for a billable
export const processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, transactionId } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Billable ID is required",
      });
    }
    
    const billable = await Billables.findById(id);
    
    if (!billable) {
      return res.status(404).json({
        success: false,
        message: "Billable not found",
      });
    }
    
    // Check if already paid
    if (billable.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "This billable has already been paid",
      });
    }
    
    // Update payment details
    const updatedBillable = await Billables.findByIdAndUpdate(
      id,
      {
        paymentStatus: "paid",
        paymentMethod: paymentMethod,
        transactionId: transactionId,
        paymentDate: new Date(),
        status: "processing" // Change status to processing after payment
      },
      { new: true }
    );
    
    return res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      billable: updatedBillable
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error processing payment",
      error: error.message,
    });
  }
};

// Update service status (for vendors/admin)
export const updateServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Billable ID is required",
      });
    }
    
    const validStatuses = ["pending", "processing", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }
    
    const billable = await Billables.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!billable) {
      return res.status(404).json({
        success: false,
        message: "Billable not found",
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Service status updated successfully",
      billable: billable
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error updating service status",
      error: error.message,
    });
  }
};

// Get billable by ID
export const getBillableById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const billable = await Billables.findById(id)
      .populate("vendorId", "companyName contactEmail phone")
      .populate("serviceId", "serviceName description");
    
    if (!billable) {
      return res.status(404).json({
        success: false,
        message: "Billable not found",
      });
    }
    
    return res.status(200).json({
      success: true,
      billable: billable
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching billable",
      error: error.message,
    });
  }
};