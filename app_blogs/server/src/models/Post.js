import mongoose from "mongoose";
const { Schema, model } = mongoose;

const commentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, index: true, unique: true },
    content: { type: String, default: "" }, // HTML from Quill
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

postSchema.virtual("commentsCount").get(function () {
  return this.comments?.length || 0;
});

export default model("Post", postSchema);
