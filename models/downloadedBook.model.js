import mongoose from "mongoose";

const DownloadedBookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    /** Internet Archive lending / download identifier */
    archiveIdentifier: {
      type: String,
      required: true,
      trim: true
    },
    title: { type: String, trim: true },
    workId: { type: String, trim: true },
    author: { type: String, trim: true }
  },
  { timestamps: true }
);

DownloadedBookSchema.index({ userId: 1, archiveIdentifier: 1 }, { unique: true });

export const DownloadedBook = mongoose.model("DownloadedBook", DownloadedBookSchema);
