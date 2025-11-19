import { Router } from "express";
import { getOverallAttendance, getTotalAttendance, getTotalTracks, markAttendance } from "../controllers/enroll.controller.js";
import { authMiddleware } from "../middlewares/admin.auth.js";


const attendanceRouter = Router();



attendanceRouter.post("/mark", markAttendance);
attendanceRouter.get("/get-all", authMiddleware, getOverallAttendance);
attendanceRouter.get("/all-tracks",authMiddleware, getTotalTracks);
attendanceRouter.get("/total-percentage", authMiddleware, getTotalAttendance);


export default attendanceRouter;