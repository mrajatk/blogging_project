import slugify from "slugify";
import Blog from "../models/Blog.js";
import mongoose from "mongoose";

export async function listBlogs(req, res) {
  const { q = "" } = req.query;
  const query = { status: "published" };
  if (q)
    query.$or = [
      { title: new RegExp(q, "i") },
      { content: new RegExp(q, "i") },
      { tags: new RegExp(q, "i") },
    ];
  const blogs = await Blog.find(query)
    .populate("author", "name avatarUrl")
    .sort({ createdAt: -1 });
  res.json(
    blogs.map((b) => ({
      _id: b._id,
      title: b.title,
      content: b.content,
      author: b.author,
      createdAt: b.createdAt,
      commentsCount: b.comments?.length || 0,
    }))
  );
}

export async function getBlog(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ error: "Invalid id" });
  const b = await Blog.findById(id)
    .populate("author", "name avatarUrl")
    .populate("comments.author", "name avatarUrl");
  if (!b) return res.status(404).json({ error: "Not found" });
  res.json(b);
}

export async function createBlog(req, res) {
  const { title, content, tags = [], status = "published" } = req.body;
  if (!title) return res.status(400).json({ error: "Title required" });
  const slug =
    slugify(title, { lower: true, strict: true }) +
    "-" +
    Date.now().toString().slice(-5);
  const blog = await Blog.create({
    title,
    slug,
    content,
    author: req.user._id,
    tags,
    status,
  });
  await blog.populate("author", "name avatarUrl");
  res.json(blog);
}

export async function updateBlog(req, res) {
  const { id } = req.params;
  const { title, content, tags, status } = req.body;
  const blog = await Blog.findById(id);
  if (!blog) return res.status(404).json({ error: "Not found" });
  if (!blog.author.equals(req.user._id) && req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });
  blog.title = title ?? blog.title;
  blog.content = content ?? blog.content;
  blog.tags = tags ?? blog.tags;
  blog.status = status ?? blog.status;
  await blog.save();
  await blog.populate("author", "name avatarUrl");
  res.json(blog);
}

export async function deleteBlog(req, res) {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  if (!blog) return res.status(404).json({ error: "Not found" });
  if (!blog.author.equals(req.user._id) && req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });
  await blog.deleteOne();
  res.json({ success: true });
}

export async function toggleLike(req, res) {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  if (!blog) return res.status(404).json({ error: "Not found" });
  const uid = req.user._id;
  const idx = blog.likedBy.findIndex((x) => x.equals(uid));
  if (idx >= 0) blog.likedBy.splice(idx, 1);
  else blog.likedBy.push(uid);
  await blog.save();
  res.json({ likes: blog.likedBy.length });
}

export async function listComments(req, res) {
  const { id } = req.params;
  const blog = await Blog.findById(id).populate(
    "comments.author",
    "name avatarUrl"
  );
  if (!blog) return res.status(404).json({ error: "Not found" });
  res.json(blog.comments);
}

export async function addComment(req, res) {
  const { id } = req.params;
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text required" });
  const blog = await Blog.findById(id);
  if (!blog) return res.status(404).json({ error: "Not found" });
  blog.comments.push({ author: req.user._id, text });
  await blog.save();
  const c = blog.comments[blog.comments.length - 1];
  await c.populate("author", "name avatarUrl");
  res.json(c);
}

export async function updateComment(req, res) {
  const { id, commentId } = req.params;
  const { text } = req.body;
  const blog = await Blog.findById(id);
  if (!blog) return res.status(404).json({ error: "Not found" });
  const c = blog.comments.id(commentId);
  if (!c) return res.status(404).json({ error: "Comment not found" });
  if (!c.author.equals(req.user._id) && req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });
  c.text = text ?? c.text;
  await blog.save();
  await c.populate("author", "name avatarUrl");
  res.json(c);
}

export async function deleteComment(req, res) {
  const { id, commentId } = req.params;
  const blog = await Blog.findById(id);
  if (!blog) return res.status(404).json({ error: "Not found" });
  const c = blog.comments.id(commentId);
  if (!c) return res.status(404).json({ error: "Comment not found" });
  if (!c.author.equals(req.user._id) && req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });
  c.deleteOne();
  await blog.save();
  res.json({ success: true });
}
