import 'dotenv/config'; 

import express from 'express';
import cors from 'cors';

import { connectDB } from './config/db.js';
import appointmentRoute from './routes/appointmentsRouters.js';
import queryRoute from './routes/queryRouters.js';

const PORT = process.env.PORT || 5001

const app = express();

// middlewares
app.use(express.json());
app.use(cors({origin: "http://localhost:5173"}));

app.use("/api/appointments", appointmentRoute)
app.use("/api/query", queryRoute)

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`server starts running on port ${PORT}`);
    });
})