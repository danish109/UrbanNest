// Models/VehicleLog.js
import mongoose from 'mongoose';

const VehicleLogSchema = new mongoose.Schema(
  {
    licensePlate: {
      type: String,
      required: true,
      uppercase: true,
    },
    detectedImageUrl: {
      // Store the image of the car for proof
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['ALLOWED', 'NOT_ALLOWED', 'UNKNOWN'], // 'UNKNOWN' for low-confidence detections
      required: true,
    },
    confidence: {
      type: Number, // How confident the AI was (0.0 to 1.0)
      default: null,
    },
    processedBy: {
      type: String,
      enum: ['AI', 'MANUAL'], // Useful if you manually override a log
      default: 'AI',
    },
  },
  { timestamps: true } // createdAt = entry timestamp
);

const VehicleLog = mongoose.model('VehicleLog', VehicleLogSchema);

export default VehicleLog;
