import jwt from "jsonwebtoken";

type JwtPayload = {
  sub: string;
  email?: string;
  name?: string;
  [k: string]: any;
};

const JWT_SECRET = process.env.JWT_SECRET || "change_me_in_prod";

export function signToken(payload: JwtPayload, expiresIn: string = "1h") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
