import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const fetchBlogs = createAsyncThunk(
  "blogs/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API}/blogs`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: "Fetch failed" });
    }
  }
);

export const createBlog = createAsyncThunk(
  "blogs/create",
  async (blog, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(`${API}/blogs`, blog, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: "Create failed" });
    }
  }
);

const blogSlice = createSlice({
  name: "blogs",
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchBlogs.pending, (s) => {
      s.loading = true;
    })
      .addCase(fetchBlogs.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload;
      })
      .addCase(fetchBlogs.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(createBlog.fulfilled, (s, a) => {
        s.list.unshift(a.payload);
      });
  },
});

export default blogSlice.reducer;
