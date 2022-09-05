import { Router } from "express";
import authController from "../controllers/auth"

const router = Router();

router.post("/register",authController.postRegister)

router.post("/login", authController.postLogin)

export default router;