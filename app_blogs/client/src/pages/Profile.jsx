import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";

export default function Profile() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  if (!user) return <p className="text-center mt-10">No profile loaded.</p>;
  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-xl mt-10">
      <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
      <p>{user.email}</p>
      <button
        onClick={() => dispatch(logout())}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
