import mongoose from "mongoose";

const guardSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    // profilePhoto:{
    //     public_id:{
    //         type: String
    //     },
    //     url: {
    //         type: String
    //     }
    // },
    role: {
      type: String,
      enum: ["ADMIN", "RESIDENT", "GUARD"],
      default: "GUARD",
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    token: {
      type: String,
    },
    // guardKey:{
    //     type:String,
    //     unique:true,
    //     required:true,
    // },
  },
  { timestamps: true }
);

const Guard = mongoose.model("guard", guardSchema);
export { Guard };
