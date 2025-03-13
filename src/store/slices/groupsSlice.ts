import {
  deleteApi,
  getApiWithAuth,
  postAPIWithAuth,
  putAPIWithAuth,
} from "@/utils/api";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

interface GroupsState {
  groups: any[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
}

const initialState: GroupsState = {
  groups: [],
  loading: false,
  error: null,
  total: 0,
  currentPage: 1,
};

// Async thunks
export const fetchGroups = createAsyncThunk(
  "groups/fetchGroups",
  async (
    { skip, search = "" }: { skip?: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const skipParam = !search && skip ? `skip=${skip}&` : "";
      const response: any = await getApiWithAuth(
        `groups/?${skipParam}limit=10${search ? `&search=${search}` : ""}`
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch groups");
      }

      return {
        groups: response.data.data,
        total: response.data.meta.total,
      };
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch groups");
      return rejectWithValue(error.message);
    }
  }
);

export const createGroup = createAsyncThunk(
  "groups/createGroup",
  async (groupData: Partial<any>, { rejectWithValue }) => {
    try {
      const response: any = await postAPIWithAuth("groups", groupData);

      if (!response.success) {
        throw new Error(response.message || "Failed to create group");
      }

      toast.success("Group created successfully");
      return response.data.data;
    } catch (error: any) {
      toast.error(error.message || "Failed to create group");
      return rejectWithValue(error.message);
    }
  }
);

export const updateGroup = createAsyncThunk(
  "groups/updateGroup",
  async (
    { id, data }: { id: number; data: Partial<any> },
    { rejectWithValue }
  ) => {
    try {
      const response: any = await putAPIWithAuth(`groups/${id}`, data);

      if (!response.success) {
        throw new Error(response.message || "Failed to update group");
      }

      toast.success("Group updated successfully");
      return response.data.data;
    } catch (error: any) {
      toast.error(error.message || "Failed to update group");
      return rejectWithValue(error.message);
    }
  }
);

export const deleteGroup = createAsyncThunk(
  "groups/deleteGroup",
  async (id: number, { rejectWithValue }) => {
    try {
      const response: any = await deleteApi(`groups/${id}`);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete group");
      }

      toast.success("Group deleted successfully");
      return id;
    } catch (error: any) {
      toast.error(error.message || "Failed to delete group");
      return rejectWithValue(error.message);
    }
  }
);

const groupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearGroups: (state) => {
      state.groups = [];
      state.total = 0;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Groups
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload.groups;
        state.total = action.payload.total;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Group
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Group
      .addCase(updateGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.groups.findIndex(
          (group) => group.id === action.payload.id
        );
        if (index !== -1) {
          state.groups[index] = action.payload;
        }
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Group
      .addCase(deleteGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = state.groups.filter(
          (group) => group.id !== action.payload
        );
        state.total -= 1;
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentPage, clearGroups } = groupsSlice.actions;
export default groupsSlice.reducer;
