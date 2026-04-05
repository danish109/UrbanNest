import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profilePhoto: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
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
    role: {
      type: String,
      enum: ["ADMIN", "RESIDENT", "GUARD"],
      default: "ADMIN",
      required: true,
    },
    // adminlevel:{
    //     type:String,
    //     enum:['SECRATARY','SUPER ADMIN','MANAGER'],
    //     required:true,
    // },
    // passkey:{
    //     type:String,
    //     unique:true,
    //     required:true,
    // },
    emnum: {
      type: String,
      //required:true
    },
    otp: String,
    otpExpiry: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
    },
  },
  { timestamps: true },
);

const Admin = mongoose.model("admin", adminSchema);
export { Admin };
