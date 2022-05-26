import { Router } from "express";
import * as FollowController from "../controllers/follow.controller.js";

const router = Router();

router.get("/following", FollowController.getFolloweesByUserId);
router.get("/followers", FollowController.getFollowersByUserId);

router.post("/request", FollowController.create);
router.post("/response", FollowController.response);

export default router;
