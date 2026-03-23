import jwt from "jsonwebtoken";

export const protect = (request, response, next) => {
  try {
    const header = request.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return response.status(401).json({ message: "Unauthorized" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    request.user = decoded;
    next();
  } catch (error) {
    return response.status(401).json({ message: "Invalid token" });
  }
};
