import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createBlog } from "../store/slices/blogSlice";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function BlogEditor() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createBlog({ title, content }));
    setTitle("");
    setContent("");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-xl mt-10">
      <h2 className="text-2xl font-bold mb-4">Write a Blog</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border p-2 rounded"
        />
        <ReactQuill value={content} onChange={setContent} />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Publish
        </button>
      </form>
    </div>
  );
}
