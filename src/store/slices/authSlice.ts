import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  postAPIWithoutAuth,
  postAPIWithAuth,
  getApiWithAuth,
} from "@/utils/api";
import { toast } from "react-toastify";

// Types

interface AuthState {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Async Actions
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    credentials: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response: any = await postAPIWithoutAuth("login", {
        username: credentials.username,
        password: credentials.password,
        grant_type: "",
        scope: "",
        client_id: "",
        client_secret: "",
      });

      if (!response.success) {
        toast.error(response.data?.message || "Login failed");
        return rejectWithValue(response.data?.message || "Login failed");
      }

      // Store token in localStorage
      if (response.data?.access_token) {
        localStorage.setItem("token", response.data.access_token);
      }

      toast.success("Login successful!");
      return {
        token: response.data.access_token,
        user: response.data.user,
      };
    } catch (error: any) {
      toast.error(error.message || "An error occurred during login");
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await postAPIWithAuth("/auth/logout", {});
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      const response: any = await postAPIWithoutAuth(
        "forgot-password",
        JSON.stringify({ email })
      );

      if (!response.success) {
        toast.error(response.data?.message || "Password reset request failed");
        return rejectWithValue(
          response.data?.message || "Password reset request failed"
        );
      }
      toast.success(
        response.data?.message ||
          "Password reset instructions sent to your email"
      );
      return response.data;
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset instructions");
      return rejectWithValue(error.message);
    }
  }
);

export const verifyResetPin = createAsyncThunk(
  "auth/verifyResetPin",
  async (data: { email: string; pin: string }, { rejectWithValue }) => {
    try {
      const response: any = await postAPIWithoutAuth(
        "verify-reset-pin",
        JSON.stringify({
          email: data.email,
          pin: data.pin,
        })
      );
      console.log("RESPONSE____", response);

      if (!response.success) {
        console.log("RESPONSE", response.data.message);
        toast.error(response.data.message || "PIN verification failed");
        return rejectWithValue(response.data || "PIN verification failed");
      }

      toast.success("PIN verified successfully");
      return response.data;
    } catch (error: any) {
      console.log("ERROR___", error);
      toast.error(error.message || "Failed to verify PIN");
      return rejectWithValue(error.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    data: {
      email: string;
      new_password: string;
      pin: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response: any = await postAPIWithoutAuth(
        "reset-password",
        JSON.stringify({
          email: data.email,
          pin: data.pin,
          new_password: data.new_password,
        })
      );

      if (!response.success) {
        toast.error(response.data || "Password reset failed");
        return rejectWithValue(response.data || "Password reset failed");
      }

      toast.success("Password reset successfully");
      return response.data;
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
      return rejectWithValue(error.message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response:any = await getApiWithAuth("users/me");
      console.log("RESPONSE", response);
      if (!response.success) {
        throw new Error(response.data?.message || "Failed to fetch user data");
      }

      return response.data.data;
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch user data");
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
    isLoading: false,
    error: null,
  } as AuthState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    });

    // Forgot Password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify Reset PIN
    builder
      .addCase(verifyResetPin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyResetPin.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyResetPin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // RESET NEW PASSWORD
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, logout } = authSlice.actions;
export default authSlice.reducer;
