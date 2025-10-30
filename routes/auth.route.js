import { signUp, signIn } from "../controllers/auth.controller.js";
import { Router } from "express";


const authRouter = Router();


authRouter.post("/sign-up", signUp);

authRouter.post("/sign-in", signIn);


export default authRouter;