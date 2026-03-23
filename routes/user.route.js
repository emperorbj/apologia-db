import express from 'express';
import { login, signup } from '../controllers/users.controller.js';
import {
  getAllUsers,
  getMyProfile,
  recordDownloadedBook
} from '../controllers/profile.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

/** All signed-up users (username + email). Requires Bearer token. */
router.get('/users', protect, getAllUsers);

/** Current user profile: downloads + recent watched videos */
router.get('/profile', protect, getMyProfile);

/** Save a downloaded book for the current user */
router.post('/profile/downloads', protect, recordDownloadedBook);

export default router;