import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const loginUser = createAsyncThunk(
  "auth/login",
  async (form, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API}/auth/login`, form);
      localStorage.setItem("token", data.token);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: "Login failed" });
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (form, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API}/auth/register`, form);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: "Register failed" }
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, loading: false, error: null },
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (b) => {
    b.addCase(loginUser.pending, (s) => {
      s.loading = true;
      s.error = null;
    })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
      })
      .addCase(loginUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.user = a.payload.user;
      })
      .addCase(registerUser.rejected, (s, a) => {
        s.error = a.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
