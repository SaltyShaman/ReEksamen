import "dotenv/config"; //get .env file
import express from "express";
import helmet from "helmet";
import cors from "cors";
import http from "http";


import sessionConfig from "./config/sessionConfig.js";
import { generalLimiter, authLimiter } from "./config/rateLimiters.js";
import userRouter from "./routes/userRouter.js";
import authRouter from "./routes/authRouter.js"
import { initSocket } from "./sockets/socketIOInstance.js";

const app = express();
const server = http.createServer(app);


// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));


app.use(express.json());
app.use(sessionConfig); 
app.use(generalLimiter);
app.use(helmet());


//ROUTES should have the suffix for what they do to maintain clarity
app.use("/auth", authRouter);
app.use("/users", userRouter);

// SOCKETS
const io = initSocket(server);

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));