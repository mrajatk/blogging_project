import express from "express";
import { body, validationResult } from "express-validator";
import {
  registerController,
  loginController,
} from "../controllers/authController.js";

const router = express.Router();

router.post(
  "/register",
  body("name").isLength({ min: 2 }),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      await registerController(req, res);
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/login",
  body("email").isEmail(),
  body("password").exists(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      await loginController(req, res);
    } catch (e) {
      next(e);
    }
  }
);

export default router;
