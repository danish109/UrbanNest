// In-memory store for OTPs
const otpStore = new Map();

export const storeOTP = (email, otp) => {
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
};

export const verifyOTP = (email, otp) => {
  const storedData = otpStore.get(email);

  if (!storedData) {
    return { isValid: false, message: "OTP not found or expired" };
  }

  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(email);
    return { isValid: false, message: "OTP has expired" };
  }

  if (storedData.otp !== otp) {
    return { isValid: false, message: "Invalid OTP" };
  }

  otpStore.delete(email);
  return { isValid: true, message: "OTP verified successfully" };
};

export const removeOTP = (email) => {
  otpStore.delete(email);
};
