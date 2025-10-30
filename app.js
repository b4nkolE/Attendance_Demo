import express from "express";
import { PORT } from "./config/env.js";
import { DBconnection } from "./database/mongoDB.js";



const app = express();






app.listen(PORT, () => {
    DBconnection();
    console.log("Server is running");
});