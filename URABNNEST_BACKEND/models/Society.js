import mongoose from "mongoose";

const societySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    societyCode: {
      type: String,
      unique: true
    },

    address: {
      type: String,
      required: true
    },

    city: {
      type: String,
      required: true
    },

    state: {
      type: String,
      required: true
    },

    totalFlats: {
      type: Number,
      required: true
    },

    towers: [
      {
        name: String,
        totalFloors: Number
      }
    ],

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    }

  },
  { timestamps: true }
);

export default mongoose.model("Society", societySchema);