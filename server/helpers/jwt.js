import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const signToken = (data) => {
  return jwt.sign(data, JWT_SECRET);
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
