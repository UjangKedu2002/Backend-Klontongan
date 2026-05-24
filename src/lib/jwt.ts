import jwt from "jsonwebtoken";

export const generateToken = (payload: { id: number; role: string }) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET as string);
};
