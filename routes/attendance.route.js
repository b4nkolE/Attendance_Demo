import { Router } from "express";
import { markAttendance } from "../controllers/enroll.controller.js";


const attendanceRouter = Router();



attendanceRouter.post("/mark", markAttendance);


export default attendanceRouter;