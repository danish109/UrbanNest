import mongoose from 'mongoose';

const AllowedVehicleSchema = new mongoose.Schema(
  {
    licensePlate: {
      type: String,
      required: true,
      unique: true, // Ensures the same plate isn't added twice
      uppercase: true, // Store in a consistent format
    },
    flatNumber: {
      type: String,
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const AllowedVehicle = mongoose.model('AllowedVehicle', AllowedVehicleSchema);

export default AllowedVehicle;
