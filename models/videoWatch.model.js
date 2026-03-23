import mongoose from "mongoose";

const VideoWatchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true
    },
    watchedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

VideoWatchSchema.index({ userId: 1, watchedAt: -1 });

export const VideoWatch = mongoose.model("VideoWatch", VideoWatchSchema);
