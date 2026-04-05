import { Payment } from "../models/payment.models.js";
import { Billables } from "../models/billable.models.js";
import { Maintenance } from "../models/maintenance.models.js";
import crypto from "crypto";

// Create payment order (DUMMY - No Razorpay API)
export const createPaymentOrder = async (req, res) => {
  try {
    const { billId, amount } = req.body;
    const residentId = req.user._id;

    // Verify bill exists
    const bill = await Billables.findById(billId);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    // Check if already paid
    if (bill.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "This bill has already been paid",
      });
    }

    // Generate dummy order ID and payment ID
    const dummyOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const dummyPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record in database
    const payment = new Payment({
      billId,
      residentId,
      amount,
      razorpayOrderId: dummyOrderId,
      razorpayPaymentId: dummyPaymentId,
      status: "pending",
    });

    await payment.save();

    // Return dummy response (same format as Razorpay)
    res.json({
      success: true,
      data: {
        orderId: dummyOrderId,
        paymentId: payment._id,
        amount,
        currency: "INR",
        key: "dummy_key_for_testing", // Dummy key
        isDummy: true, // Mark as dummy payment
      },
      message: "Order created successfully (DUMMY - For Testing Only)",
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

// Verify payment (DUMMY - No Signature Verification)
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId, amount } = req.body;

    // Find payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // DUMMY: Simulate payment success (In real scenario, you'd verify with Razorpay)
    // For testing, we'll just mark it as successful

    // Update payment record
    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: "completed",
        paymentDate: new Date(),
        transactionId: `dummy_txn_${Date.now()}`,
        razorpaySignature: "dummy_signature_for_testing",
      },
      { new: true }
    );

    // Update bill status to paid
    await Billables.findByIdAndUpdate(payment.billId, {
      paymentStatus: "paid",
      paymentDate: new Date(),
      transactionId: `dummy_txn_${Date.now()}`,
    });

    res.json({
      success: true,
      message: "Payment verified successfully (DUMMY)",
      data: updatedPayment,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

// Get payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const residentId = req.user._id;
    const { status, limit = 10, page = 1 } = req.query;

    let query = { residentId };
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate("billId", "serviceName price units total")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: payments,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
      },
      message: "Payment history retrieved successfully",
    });
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
      error: error.message,
    });
  }
};

// Get payment details
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const residentId = req.user._id;

    const payment = await Payment.findById(paymentId).populate(
      "billId residentId"
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Verify ownership
    if (payment.residentId._id.toString() !== residentId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - This is not your payment",
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Get payment details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment details",
      error: error.message,
    });
  }
};

// Initiate Refund (DUMMY)
export const initiateRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const residentId = req.user._id;
    const { amount: refundAmount, reason } = req.body;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Verify ownership
    if (payment.residentId.toString() !== residentId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (payment.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Only completed payments can be refunded",
      });
    }

    // DUMMY: Simulate refund
    const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update payment record
    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: "refunded",
        transactionId: refundId,
      },
      { new: true }
    );

    // Update bill status
    await Billables.findByIdAndUpdate(payment.billId, {
      paymentStatus: "refunded",
    });

    res.json({
      success: true,
      message: "Refund initiated successfully (DUMMY)",
      data: {
        refundId,
        originalPaymentId: payment.razorpayPaymentId,
        amount: refundAmount || payment.amount,
        status: "refunded",
        reason,
      },
    });
  } catch (error) {
    console.error("Initiate refund error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate refund",
      error: error.message,
    });
  }
};

// Download Receipt (DUMMY)
export const downloadReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const residentId = req.user._id;

    const payment = await Payment.findById(paymentId).populate(
      "billId residentId"
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Verify ownership
    if (payment.residentId._id.toString() !== residentId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Create a dummy receipt object
    const receipt = {
      receiptNumber: `RCPT-${payment._id}`,
      transactionId: payment.transactionId || "DUMMY_TXN",
      orderId: payment.razorpayOrderId,
      paymentId: payment.razorpayPaymentId,
      date: payment.paymentDate || new Date(),
      amount: payment.amount,
      currency: "INR",
      billDetails: {
        billId: payment.billId._id,
        serviceName: payment.billId.serviceName,
        billAmount: payment.billId.total,
      },
      residentDetails: {
        name: payment.residentId.fullName,
        email: payment.residentId.email,
        phone: payment.residentId.phone,
      },
      status: payment.status,
      paymentMethod: "DUMMY_PAYMENT",
      isDummy: true,
      note: "This is a dummy receipt for testing purposes only",
    };

    res.json({
      success: true,
      data: receipt,
      message: "Receipt generated successfully (DUMMY)",
    });
  } catch (error) {
    console.error("Download receipt error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download receipt",
      error: error.message,
    });
  }
};