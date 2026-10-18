import jwt from "jsonwebtoken";

export function verifyEvToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ detail: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.evUser = payload; // { sub: email, role }
    next();
  } catch (err) {
    return res.status(401).json({ detail: "Invalid token" });
  }
}
