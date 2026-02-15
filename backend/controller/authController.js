import bcrypt from "bcryptjs";
import User from "../model/user.js";
import ErrorResponse from "../exceptions/errorResponse.js";
import { generateToken } from "../utils/jwt.js";

class AuthController {
  register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new ErrorResponse("Name, email and password are required", 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ErrorResponse("Email already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = generateToken({ id: user._id, email: user.email });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  };

  login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ErrorResponse("Email and password are required", 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ErrorResponse("Invalid credentials", 401);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new ErrorResponse("Invalid credentials", 401);
    }

    const token = generateToken({ id: user._id, email: user.email });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  };

  me = async (req, res) => {
    const user = await User.findById(req.user.id).select("name email createdAt updatedAt");
    if (!user) {
      throw new ErrorResponse("User not found", 404);
    }

    res.status(200).json({ success: true, user });
  };
}

export default new AuthController();
