import { Router } from 'express';
import * as PostController from '../controllers/post.controller.js';
import * as UserActionController from '../controllers/userAction.controller.js';

const router = Router();

router.get('/liked-by', UserActionController.getLikedPosts);
router.get('/saved-by', UserActionController.getSavedPosts);
router.get('/timeline', PostController.getTimeLine);
router.get('/', PostController.get);

router.post('/like', UserActionController.like);
router.post('/comment', UserActionController.comment);
router.post('/save', UserActionController.save);

router.post('/', PostController.create);

export default router;
