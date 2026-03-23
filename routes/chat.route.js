import express from 'express'
import {
  clearChatHistory,
  deleteSingleChat,
  getChatHistory,
  getConversationSummaries,
  sendChat
} from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.js';


const chatRouter = express.Router()

chatRouter.post('/apologist', protect, sendChat)
chatRouter.get('/conversations', protect, getConversationSummaries)
chatRouter.get('/history', protect, getChatHistory)
chatRouter.delete('/history', protect, clearChatHistory)
chatRouter.delete('/history/:chatId', protect, deleteSingleChat)

export default chatRouter;