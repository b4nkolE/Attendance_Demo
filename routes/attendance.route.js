import { Router } from "express";
import { markAttendance } from "../controllers/attendance.controller.js";


const attendanceRouter = Router();



attendanceRouter.post("/mark", markAttendance);


export default attendanceRouter;