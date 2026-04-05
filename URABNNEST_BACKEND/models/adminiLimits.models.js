//////////////////////////////////////////////////////////////Managed by superAdmin///////////////////////////////////////////////////////////////

import mongoose from "mongoose";

const limitSchema = new mongoose.Schema({
  superAdmin: {
    max: Number,
    required: true,
  },
  managerialAdmin: {
    max: Number,
    required: true,
  },
  Secretary: {
    max: Number,
    required: true,
  },
});

const Limits = mongoose.model("limits", limitSchema);
export { Limits };
