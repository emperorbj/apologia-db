import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    conversationId: {
        type: String,
        required: true,
        index: true
    },
    conversationTitle: {
        type: String,
        default: "Untitled conversation"
    },
    question:{
        type:String,
        required:true
    },
    response:{
        type:String,
        required:true
    },
    timestamp:{
        type:Date,
        default:Date.now
    }
})

ChatSchema.index({ userId: 1, timestamp: -1 });

export const Chat = mongoose.model("Chat",ChatSchema)