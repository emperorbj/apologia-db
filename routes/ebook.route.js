import express from "express";
import {
  getApologeticsBySubject,
  searchEbooks,
  getWorkDetails,
  getEditionDetails,
  getCoverUrl,
  getDownloadLinks
} from "../controllers/ebook.controller.js";

const ebookRouter = express.Router();

ebookRouter.get("/subject/apologetics", getApologeticsBySubject);
ebookRouter.get("/search", searchEbooks);
ebookRouter.get("/work/:workId", getWorkDetails);
ebookRouter.get("/edition/:editionId", getEditionDetails);
ebookRouter.get("/cover/:coverId", getCoverUrl);
ebookRouter.get("/download/:identifier", getDownloadLinks);

export default ebookRouter;
