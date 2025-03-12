import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  postAPIWithoutAuth,
  postAPIWithAuth,
  getApiWithAuth,
  deleteApi,
  putAPIWithAuth,
} from "@/utils/api";
import { toast } from "react-toastify";
import { PAGINATION_CONFIG } from "@/config/pagination";

// Types

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  role_id: number;
  // ... other user properties
}

interface UsersState {
  users: any[];
  isLoading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
}

// Async Actions

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (
    { skip = 0, search = "" }: { skip?: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const response: any = await getApiWithAuth(
        `users/?skip=${skip}&limit=${PAGINATION_CONFIG.DEFAULT_PAGE_SIZE}${
          search ? `&search=${search}` : ""
        }`
      );

      if (!response.success) {
        throw new Error(response.data?.message || "Failed to fetch users");
      }
      console.log("response.data.meta.total", response.data.meta.results);
      return {
        users: response.data.data,
        total: response.data.meta.total,
      };
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch users");
      return rejectWithValue(error.message);
    }
  }
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData: any, { rejectWithValue, dispatch, getState }) => {
    try {
      const response: any = await postAPIWithAuth("users/", userData);
      console.log("RES__", response.data);
      if (!response.success) {
        throw new Error(
          response.data.detail.message || "Failed to create user"
        );
      }
      const state: any = getState();
      const currentPage = state.users.currentPage;
      await dispatch(fetchUsers({ skip: currentPage }));

      toast.success("User created successfully");

      return response.data;
    } catch (error: any) {
      console.log("rES===----", error);

      toast.error(error.message || "Failed to create users");

      return rejectWithValue(error.message || "Failed to create user");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId: number, { getState, dispatch, rejectWithValue }) => {
    try {
      const response: any = await deleteApi(`users/${userId}`);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete user");
      }
      const state: any = getState();
      const currentPage = state.users.currentPage;
      const total = state.users.total - 1;
      const itemsOnCurrentPage = state.users.users.length - 1; // After deletion
      await dispatch(fetchUsers({ skip: 0 }));
      dispatch(setCurrentPage(1));

      toast.success("User deleted successfully");

      return {
        userId,
        currentPage,
        total,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete user");
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response: any = await putAPIWithAuth(`users/${id}`, data);

      if (!response.success) {
        throw new Error(response.message || "Failed to update user");
      }

      toast.success("User updated successfully");
      return { id, ...data };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update user");
    }
  }
);

// Slice
const usersSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    isLoading: false,
    error: null,
    total: 0,
    currentPage: 1,
  } as UsersState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.users = [];
      localStorage.removeItem("token");
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.total = action.payload.total;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log("ACTION PAYLOAD", action.payload);
        // state.users.unshift(action.payload.data);
        // state.total += 1;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // state.users = state.users.filter((user) => user.id !== action.payload);
        // state.total -= 1;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...action.payload };
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, logout, setCurrentPage } = usersSlice.actions;
export default usersSlice.reducer;
