import { signUp, signIn, adminValidation } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/admin.auth.js";
import { Router } from "express";


const authRouter = Router();


authRouter.post("/sign-up", signUp);

authRouter.post("/sign-in", signIn);

authRouter.get("/dashboard", authMiddleware, adminValidation);


export default authRouter;