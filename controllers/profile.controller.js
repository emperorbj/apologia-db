import mongoose from "mongoose";
import { User } from "../models/users.model.js";
import { DownloadedBook } from "../models/downloadedBook.model.js";
import { VideoWatch } from "../models/videoWatch.model.js";
import { Video } from "../models/video.model.js";

/** List all signed-up users (username + email only). Protected. */
export const getAllUsers = async (request, response) => {
  try {
    const users = await User.find()
      .select("username email createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return response.status(200).json({
      success: true,
      count: users.length,
      users: users.map((u) => ({
        id: u._id,
        username: u.username,
        email: u.email,
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
};

/** Current user profile: account + downloaded books + recently watched videos */
export const getMyProfile = async (request, response) => {
  try {
    const userId = request.user?.userId;
    if (!userId) {
      return response.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("-password").lean();
    if (!user) {
      return response.status(404).json({ message: "User not found" });
    }

    const downloadedBooks = await DownloadedBook.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    const recentWatches = await VideoWatch.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $sort: { watchedAt: -1 } },
      {
        $group: {
          _id: "$video",
          lastWatchedAt: { $first: "$watchedAt" }
        }
      },
      { $sort: { lastWatchedAt: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "videos",
          localField: "_id",
          foreignField: "_id",
          as: "video"
        }
      },
      { $unwind: { path: "$video", preserveNullAndEmptyArrays: true } }
    ]);

    const recentWatchedVideos = recentWatches.map((row) => ({
      lastWatchedAt: row.lastWatchedAt,
      video: row.video || null
    }));

    return response.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      },
      downloadedBooks: downloadedBooks.map((b) => ({
        id: b._id,
        archiveIdentifier: b.archiveIdentifier,
        title: b.title,
        workId: b.workId,
        author: b.author,
        downloadedAt: b.createdAt
      })),
      recentWatchedVideos
    });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
};

/** Record a book download (call when user completes / starts a download) */
export const recordDownloadedBook = async (request, response) => {
  try {
    const userId = request.user?.userId;
    const { archiveIdentifier, title, workId, author } = request.body;

    if (!archiveIdentifier || typeof archiveIdentifier !== "string") {
      return response.status(400).json({ message: "archiveIdentifier is required" });
    }

    const trimmedId = archiveIdentifier.trim();
    const $set = {};
    if (title != null && title !== "") $set.title = title;
    if (workId != null && workId !== "") $set.workId = workId;
    if (author != null && author !== "") $set.author = author;

    const doc = await DownloadedBook.findOneAndUpdate(
      { userId, archiveIdentifier: trimmedId },
      {
        ...($set && Object.keys($set).length ? { $set } : {}),
        $setOnInsert: { userId, archiveIdentifier: trimmedId }
      },
      { new: true, upsert: true, runValidators: true }
    );

    return response.status(200).json({
      success: true,
      book: {
        id: doc._id,
        archiveIdentifier: doc.archiveIdentifier,
        title: doc.title,
        workId: doc.workId,
        author: doc.author,
        downloadedAt: doc.createdAt
      }
    });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
};

/** Record that the user watched a video (call from client when playback starts or ends) */
export const recordVideoWatch = async (request, response) => {
  try {
    const userId = request.user?.userId;
    const { id: videoId } = request.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return response.status(400).json({ message: "Invalid video id" });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return response.status(404).json({ message: "Video not found" });
    }

    await VideoWatch.create({
      userId,
      video: videoId,
      watchedAt: new Date()
    });

    return response.status(201).json({ success: true, message: "Watch recorded" });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
};
