import { verifyToken } from "../utils/jwt.js";
import ErrorResponse from "../exceptions/errorResponse.js";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ErrorResponse("Authentication required", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, email: payload.email };
    return next();
  } catch (error) {
    return next(new ErrorResponse("Invalid or expired token", 401));
  }
};

export default authMiddleware;
