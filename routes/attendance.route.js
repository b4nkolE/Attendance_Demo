import { Router } from "express";
import { getOverallAttendance, markAttendance } from "../controllers/enroll.controller.js";


const attendanceRouter = Router();



attendanceRouter.post("/mark", markAttendance);
attendanceRouter.get("/get-all", getOverallAttendance);


export default attendanceRouter;