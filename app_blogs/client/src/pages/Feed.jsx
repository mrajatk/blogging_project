import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogs } from "../store/slices/blogSlice";

export default function Feed() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.blogs);

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {list.map((blog) => (
        <div key={blog._id} className="bg-white shadow p-4 mb-4 rounded-xl">
          <h3 className="text-xl font-bold">{blog.title}</h3>
          <p className="text-sm text-gray-600">by {blog.author?.name}</p>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      ))}
    </div>
  );
}
