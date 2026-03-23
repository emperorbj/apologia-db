import express from "express";
import { sendChat } from "../controllers/chat.controller.js";
import { protect } from "../middleware/auth.js";

const chatRouter = express.Router();

chatRouter.post("/apologist", protect, sendChat);

export default chatRouter;
