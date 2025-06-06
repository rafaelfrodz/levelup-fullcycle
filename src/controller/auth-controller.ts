import { Router } from "express";
import { AuthServices } from "../services/auth-services";

export const authRoutes = Router();

authRoutes.post("/login", async (req, res) => {
    const {email, password} = req.body;
    const authService = new AuthServices();
    const token = await authService.login(email, password);
    res.json({token});
  });
