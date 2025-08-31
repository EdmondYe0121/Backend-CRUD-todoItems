import { Router } from "express";
import { loginController, registerController } from "@/controllers/auth_controller";

const router = Router();

// Public routes
router.post("/login", loginController);
router.post("/register", registerController);

export default router;