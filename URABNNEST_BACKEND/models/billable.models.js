// // import mongoose from "mongoose";

// // const billSchema = new mongoose.Schema({
// //   serviceName: {
// //     type: String,
// //     required: true,
// //   },
// //   vendorId: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: "vendors",
// //   },
// //   serviceId: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: "services",
// //   },
// //   residentId: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: "resident",
// //   },
// //   price: {
// //     type: Number,
// //     required: true,
// //   },
// //   units: {
// //     type: Number,
// //     required: true,
// //   },
// //   status: {
// //     type: String,
// //     enum: ["ACTIVE", "DEPRICATED"],
// //     default: "ACTIVE",
// //   },
// // });

// // const Billables = mongoose.model("billables", billSchema);
// // export { Billables };
// import mongoose from "mongoose";

// const billSchema = new mongoose.Schema({
//   serviceName: {
//     type: String,
//     required: true,
//   },
//   vendorId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "vendors",
//   },
//   serviceId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "services",
//   },
//   residentId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "resident",
//   },
//     paymentStatus: {
//     type: String,
//     enum: ["unpaid", "paid", "refunded"],
//     default: "unpaid",
//   },
//   status: {
//     type: String,
//     enum: ["pending", "processing", "completed", "cancelled"],
//     default: "pending",
//   },
//   dueDate: {
//     type: Date,
//     default: function() {
//       const date = new Date();
//       date.setDate(date.getDate() + 30);
//       return date;
//     }
//   },
//   price: {
//     type: Number,
//     required: true,
//   },
//   units: {
//     type: Number,
//     required: true,
//   },
//   status: {
//     type: String,
//     enum: ["ACTIVE", "DEPRICATED"],
//     default: "ACTIVE",
//   },
// });
import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resident",
    // required: true,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Services",
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  units: {
    type: Number,
    required: true,
    min: 1,
  },
  total: {
    type: Number,
    // required: true,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "cancelled"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "refunded"],
    default: "unpaid",
  },
  paymentMethod: {
    type: String,
    enum: ["credit_card", "debit_card", "upi", "cash", "bank_transfer", null],
    default: null,
  },
  paymentDate: {
    type: Date,
  },
  transactionId: {
    type: String,
  },
  dueDate: {
    type: Date,
    default: function() {
      // Set due date to 30 days from creation
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    }
  },
}, {
  timestamps: true,
});

// Calculate total before saving
billSchema.pre("save", function(next) {
  this.total = this.price * this.units;
  next();
});

const Billables = mongoose.model("billables", billSchema);
export { Billables };

