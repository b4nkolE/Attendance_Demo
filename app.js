import express from "express";
import { PORT } from "./config/env.js";
import { DBconnection } from "./database/mongoDB.js";
import authRouter from "./routes/auth.route.js"
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import enrollRouter from "./routes/enroll.route.js";
import attendanceRouter from "./routes/attendance.route.js";
import cron from "node-cron";
import { autoMarkAbsence } from "./controllers/enroll.controller.js";


dotenv.config();
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/v1/auth', authRouter);

app.use('/api/v1', enrollRouter);

app.use('/api/v1/attendance', attendanceRouter);

cron.schedule('59 13 * * *', async () => {
    console.log("Testing auto marking")
    await autoMarkAbsence(null, null);
})






app.listen(PORT, () => {
    DBconnection();
    console.log("Server is running");
});

export default app;