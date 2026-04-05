import jwt from "jsonwebtoken";

const createToken = async (userId, user) => {
  const token = jwt.sign({ id: userId }, process.env.SECRET_KEY, {
    expiresIn: "7d",
  });
  return token;
};

const verifyToken = async (token) => {
  try {
    return jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export { createToken, verifyToken };
