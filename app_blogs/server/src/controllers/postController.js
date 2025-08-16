import slugify from "slugify";
import Post from "../models/Post.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// GET /api/posts
export async function getPosts(req, res) {
  const { filter = "all", q = "" } = req.query;
  const query = { status: "published" };

  if (filter === "my" && req.user) query.author = req.user._id;
  // 'liked' will be handled below if user is provided
  if (q)
    query.$or = [
      { title: new RegExp(q, "i") },
      { content: new RegExp(q, "i") },
      { tags: new RegExp(q, "i") },
    ];

  let posts;
  if (filter === "liked" && req.user) {
    posts = await Post.find({ likedBy: req.user._id })
      .populate("author", "name avatarUrl")
      .sort({ createdAt: -1 });
  } else {
    posts = await Post.find(query)
      .populate("author", "name avatarUrl")
      .sort({ createdAt: -1 });
  }

  // map to shape expected by frontend
  const mapped = posts.map((p) => ({
    id: p._id,
    title: p.title,
    slug: p.slug,
    content: p.content,
    author: p.author,
    tags: p.tags,
    status: p.status,
    createdAt: p.createdAt,
    likedBy: p.likedBy || [],
    commentsCount: p.comments?.length || 0,
  }));
  res.json(mapped);
}

// GET /api/posts/:id
export async function getPostById(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ error: "Invalid id" });
  const p = await Post.findById(id)
    .populate("author", "name avatarUrl")
    .populate("comments.author", "name avatarUrl");
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json({
    id: p._id,
    title: p.title,
    slug: p.slug,
    content: p.content,
    author: p.author,
    tags: p.tags,
    status: p.status,
    createdAt: p.createdAt,
    likedBy: p.likedBy || [],
    comments: p.comments.map((c) => ({
      id: c._id,
      author: c.author,
      text: c.text,
      createdAt: c.createdAt,
    })),
  });
}

// POST /api/posts
export async function createPost(req, res) {
  const { title, content, tags = [], status = "published" } = req.body;
  if (!title) return res.status(400).json({ error: "Title required" });
  const slug =
    slugify(title, { lower: true, strict: true }) +
    "-" +
    Date.now().toString().slice(-5);
  const post = await Post.create({
    title,
    slug,
    content,
    author: req.user._id,
    tags,
    status,
  });
  await post.populate("author", "name avatarUrl");
  res.json({
    id: post._id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    author: post.author,
    tags: post.tags,
    status: post.status,
    createdAt: post.createdAt,
    likedBy: post.likedBy,
    commentsCount: post.comments.length,
  });
}

// PUT /api/posts/:id
export async function updatePost(req, res) {
  const { id } = req.params;
  const { title, content, tags = [], status = "published" } = req.body;
  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ error: "Not found" });
  if (!post.author.equals(req.user._id))
    return res.status(403).json({ error: "Forbidden" });

  post.title = title ?? post.title;
  post.content = content ?? post.content;
  post.tags = tags ?? post.tags;
  post.status = status ?? post.status;
  await post.save();
  await post.populate("author", "name avatarUrl");
  res.json(post);
}

// DELETE /api/posts/:id
export async function deletePost(req, res) {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ error: "Not found" });
  if (!post.author.equals(req.user._id) && req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });
  await post.remove();
  res.json({ success: true });
}

// POST /api/posts/:id/like
export async function toggleLike(req, res) {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ error: "Not found" });
  const uid = req.user._id;
  const idx = post.likedBy.findIndex((x) => x.equals(uid));
  if (idx >= 0) post.likedBy.splice(idx, 1);
  else post.likedBy.push(uid);
  await post.save();
  res.json({ likes: post.likedBy.length });
}

// COMMENTS
export async function getComments(req, res) {
  const { id } = req.params;
  const post = await Post.findById(id).populate(
    "comments.author",
    "name avatarUrl"
  );
  if (!post) return res.status(404).json({ error: "Not found" });
  res.json(
    post.comments.map((c) => ({
      id: c._id,
      author: c.author,
      text: c.text,
      createdAt: c.createdAt,
    }))
  );
}

export async function addComment(req, res) {
  const { id } = req.params;
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text required" });
  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ error: "Not found" });
  const comment = { author: req.user._id, text };
  post.comments.push(comment);
  await post.save();
  const c = post.comments[post.comments.length - 1];
  await c.populate("author", "name avatarUrl");
  res.json({
    id: c._id,
    author: c.author,
    text: c.text,
    createdAt: c.createdAt,
  });
}

export async function updateComment(req, res) {
  const { id, commentId } = req.params;
  const { text } = req.body;
  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ error: "Not found" });
  const c = post.comments.id(commentId);
  if (!c) return res.status(404).json({ error: "Comment not found" });
  if (!c.author.equals(req.user._id) && req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });
  c.text = text ?? c.text;
  await post.save();
  await c.populate("author", "name avatarUrl");
  res.json({
    id: c._id,
    author: c.author,
    text: c.text,
    createdAt: c.createdAt,
  });
}

export async function deleteComment(req, res) {
  const { id, commentId } = req.params;
  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ error: "Not found" });
  const c = post.comments.id(commentId);
  if (!c) return res.status(404).json({ error: "Comment not found" });
  if (!c.author.equals(req.user._id) && req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });
  c.remove();
  await post.save();
  res.json({ success: true });
}
