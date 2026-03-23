import express from 'express';
import { addVideos, getAllVideos, updateVideos } from '../controllers/video.controller.js';
import { recordVideoWatch } from '../controllers/profile.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/',getAllVideos);
router.post('/',addVideos);
router.post('/:id/watch', protect, recordVideoWatch);
router.put('/:id',updateVideos)

export default router;