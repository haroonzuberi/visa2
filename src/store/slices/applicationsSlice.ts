import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getApiWithAuth } from "@/utils/api";
import { toast } from "react-toastify";
import { PAGINATION_CONFIG } from "@/config/pagination";

// Types

interface ApplicantionsState {
  applications: any[];
  isLoading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
}

// Async Actions
export const fetchApplications = createAsyncThunk(
  "applications/fetchApplications",
  async (
    { skip = 0, search = "" }: { skip?: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const response: any = await getApiWithAuth(
        `applications/?skip=${skip}&limit=${PAGINATION_CONFIG.DEFAULT_PAGE_SIZE}${
          search ? `&search=${search}` : ""
        }`
      );

      // Check if response exists
      if (!response) {
        throw new Error("No response from server");
      }

      // Log response for debugging
      console.log("API Response:", response);

      // Check for success status
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch applications");
      }

      // Ensure data structure exists
      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error("Invalid data structure received");
      }

      return {
        applications: response.data.data,
        total: response.data.results || response.data.data.length,
      };
    } catch (error: any) {
      // Log the full error for debugging
      console.error("API Error:", error);

      // Handle different types of errors
      if (error.status === 500) {
        return rejectWithValue("Internal server error. Please try again later.");
      }

      if (error.status === 401) {
        return rejectWithValue("Unauthorized. Please login again.");
      }

      return rejectWithValue(
        error.message || "Failed to fetch applications. Please try again."
      );
    }
  }
);

// Slice
const applicationsSlice = createSlice({
  name: "applications",
  initialState: {
    applications: [],
    isLoading: false,
    error: null,
    total: 0,
    currentPage: 1,
  } as ApplicantionsState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applications = action.payload.applications;
        state.total = action.payload.total;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentPage } = applicationsSlice.actions;
export default applicationsSlice.reducer;
