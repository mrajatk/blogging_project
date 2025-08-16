import express from "express";
import { requireAuth } from "../middleware/auth.js";
import * as ctrl from "../controllers/postController.js";

const router = express.Router();

router.get("/", ctrl.getPosts); // ?filter=all|my|liked & ?q=
router.get("/:id", ctrl.getPostById);
router.post("/", requireAuth, ctrl.createPost);
router.put("/:id", requireAuth, ctrl.updatePost);
router.delete("/:id", requireAuth, ctrl.deletePost);

router.post("/:id/like", requireAuth, ctrl.toggleLike);

// comments
router.get("/:id/comments", ctrl.getComments);
router.post("/:id/comments", requireAuth, ctrl.addComment);
router.put("/:id/comments/:commentId", requireAuth, ctrl.updateComment);
router.delete("/:id/comments/:commentId", requireAuth, ctrl.deleteComment);

export default router;
