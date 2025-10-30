import { Router } from "express";
import { enroll } from "../controllers/enroll.controller.js";


const enrollRouter = Router();

enrollRouter.post('/enroll', enroll);

export default enrollRouter;
