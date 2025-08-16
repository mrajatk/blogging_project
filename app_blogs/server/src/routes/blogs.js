import express from "express";
import { requireAuth } from "../middleware/auth.js";
import * as ctrl from "../controllers/blogController.js";

const router = express.Router();

router.get("/", ctrl.listBlogs);
router.get("/:id", ctrl.getBlog);
router.post("/", requireAuth, ctrl.createBlog);
router.put("/:id", requireAuth, ctrl.updateBlog);
router.delete("/:id", requireAuth, ctrl.deleteBlog);

router.post("/:id/like", requireAuth, ctrl.toggleLike);

router.get("/:id/comments", ctrl.listComments);
router.post("/:id/comments", requireAuth, ctrl.addComment);
router.put("/:id/comments/:commentId", requireAuth, ctrl.updateComment);
router.delete("/:id/comments/:commentId", requireAuth, ctrl.deleteComment);

export default router;
