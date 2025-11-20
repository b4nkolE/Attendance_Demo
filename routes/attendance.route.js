import { Router } from "express";
import { getOverallAttendance, getTotalAttendance, getTotalTracks, markAttendance, getStudentById, getAttendanceByDateRange } from "../controllers/enroll.controller.js";
import { authMiddleware } from "../middlewares/admin.auth.js";


const attendanceRouter = Router();



attendanceRouter.get("/student/:id", authMiddleware, getStudentById);
attendanceRouter.post("/mark", markAttendance);
attendanceRouter.get("/get-all", authMiddleware, getOverallAttendance);
attendanceRouter.get("/all-tracks",authMiddleware, getTotalTracks);
attendanceRouter.get("/total-percentage", authMiddleware, getTotalAttendance);
attendanceRouter.get("/byDate", authMiddleware, getAttendanceByDateRange);


export default attendanceRouter;
