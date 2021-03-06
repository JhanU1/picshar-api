import { Router } from 'express';
import * as UsersController from '../controllers/user.controller.js';

const router = Router();

router.get('/', UsersController.get);

router.post('/login', UsersController.login);
router.post('/', UsersController.create);

export default router;
