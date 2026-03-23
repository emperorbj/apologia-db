import OpenAI from "openai";
import mongoose from "mongoose";
import { Chat } from '../models/chat.model.js';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const sendChat = async (request,response) => {
    
    try {
        const {question, conversationId, conversationTitle} = request.body;
        const userId = request.user?.userId;
        if(!userId || !question || typeof question !== 'string') {
            return response.status(400).json({error:"invalid input"})
        }
        const resolvedConversationId = conversationId || new mongoose.Types.ObjectId().toString();

        const prompt = `You are a professional Christian apologist with expertise in theology and apologetics.
      Answer the following question in a clear, respectful, and biblically grounded manner.
      Format your response in Markdown, using headings, lists, and emphasis where appropriate.
      Question: ${question}`;
    
        const completion = await client.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5
        });
        const aiResponse = completion.choices?.[0]?.message?.content || "No answer generated.";

        const chatResponse = new Chat({
            userId,
            conversationId: resolvedConversationId,
            conversationTitle: conversationTitle || "Untitled conversation",
            question,
            response: aiResponse,
            timestamp:new Date()
        })

        await chatResponse.save()

        return response.status(200).json({
            answer: aiResponse,
            conversationId: resolvedConversationId
        })


    } catch (error) {
        console.error('Error:', error);
    if (error.message.includes('Quota exceeded')) {
      return response.status(429).json({ error: 'API quota exceeded, please try again later' });
    }
    response.status(500).json({ error: 'Internal server error' });
    }
}

export const getChatHistory = async (request,response) => {
    try {
        const userId = request.user?.userId;
        const page = Math.max(Number(request.query.page || 1), 1);
        const limit = Math.min(Math.max(Number(request.query.limit || 20), 1), 100);
        const conversationId = request.query.conversationId;
        const skip = (page - 1) * limit;

        const filter = { userId };
        if (conversationId) {
            filter.conversationId = conversationId;
        }

        const [chats, total] = await Promise.all([
            Chat.find(filter)
        .sort({timestamp: -1})
        .skip(skip)
        .limit(limit)
        .select("conversationId conversationTitle question response timestamp"),
            Chat.countDocuments(filter)
        ]);

        return response.status(200).json({
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            chats
        })
    } catch (error) {
        console.error('Error fetching history:', error);
    response.status(500).json({ error: 'Internal server error' });
    }
}

export const deleteSingleChat = async (request, response) => {
    try {
        const userId = request.user?.userId;
        const { chatId } = request.params;

        const deleted = await Chat.findOneAndDelete({ _id: chatId, userId });
        if (!deleted) {
            return response.status(404).json({ message: "Chat not found" });
        }

        return response.status(200).json({ success: true, message: "Chat deleted successfully" });
    } catch (error) {
        return response.status(500).json({ error: "Internal server error" });
    }
};

export const clearChatHistory = async (request, response) => {
    try {
        const userId = request.user?.userId;
        await Chat.deleteMany({ userId });
        return response.status(200).json({ success: true, message: "Chat history cleared" });
    } catch (error) {
        return response.status(500).json({ error: "Internal server error" });
    }
};

export const getConversationSummaries = async (request, response) => {
    try {
        const userId = request.user?.userId;
        const summaries = await Chat.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: "$conversationId",
                    conversationTitle: { $first: "$conversationTitle" },
                    lastQuestion: { $first: "$question" },
                    lastResponse: { $first: "$response" },
                    lastTimestamp: { $first: "$timestamp" },
                    messageCount: { $sum: 1 }
                }
            },
            { $sort: { lastTimestamp: -1 } }
        ]);

        return response.status(200).json({ success: true, conversations: summaries });
    } catch (error) {
        return response.status(500).json({ error: "Internal server error" });
    }
};