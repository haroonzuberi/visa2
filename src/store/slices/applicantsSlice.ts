import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  postAPIWithAuth,
  getApiWithAuth,
  putAPIWithAuth,
  deleteApi,
} from "@/utils/api";
import { toast } from "react-toastify";
import { PAGINATION_CONFIG } from "@/config/pagination";

interface ApplicantsState {
  applicants: any[];
  isLoading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
}

// Async Actions
export const fetchApplicants = createAsyncThunk(
  "applicants/fetchApplicants",
  async (
    { skip = 0, search = "" }: { skip?: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const response: any = await getApiWithAuth(
        `applicants/?skip=${skip}&limit=${PAGINATION_CONFIG.DEFAULT_PAGE_SIZE}${
          search ? `&search=${search}` : ""
        }`
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch applicants");
      }

      console.log(response.data.meta.total);

      return {
        applicants: response.data,
        total:response.data.meta.total,
      };
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch applicants");
      return rejectWithValue(error.message);
    }
  }
);

export const createApplicant = createAsyncThunk(
  "applicants/createApplicant",
  async (applicantData: any, { getState, dispatch }) => {
    try {
      const response: any = await postAPIWithAuth("applicants/", applicantData);

      if (!response.success) {
        throw new Error(response.data.detail.message || "Failed to create applicant");
      }

      const state: any = getState();
      const currentPage = state.applicants.currentPage;
      const total = state.applicants.total + 1;

      if (
        currentPage !== 1 &&
        total > PAGINATION_CONFIG.DEFAULT_PAGE_SIZE * (currentPage - 1)
      ) {
        const skip = (currentPage - 1) * PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
        dispatch(fetchApplicants({ skip }));
      }

      toast.success("Applicant created successfully");
      return {
        applicant: response.data,
        shouldAddToList: currentPage === 1,
      };
    } catch (error: any) {
      toast.error(error.message || "Failed to create applicant");
      throw error;
    }
  }
);

export const updateApplicant = createAsyncThunk(
  "applicants/updateApplicant",
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response: any = await putAPIWithAuth(`applicants/${id}`, data);

      if (!response.success) {
        throw new Error(response.message || "Failed to update applicant");
      }

      toast.success("Applicant updated successfully");
      return { id, ...data };
    } catch (error: any) {
      toast.error(error.message || "Failed to update applicant");
      return rejectWithValue(error.message);
    }
  }
);

export const deleteApplicant = createAsyncThunk(
  "applicants/deleteApplicant",
  async (id: number, { rejectWithValue }) => {
    try {
      const response: any = await deleteApi(`applicants/${id}`);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete applicant");
      }

      toast.success("Applicant deleted successfully");
      return id;
    } catch (error: any) {
      toast.error(error.message || "Failed to delete applicant");
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const applicantsSlice = createSlice({
  name: "applicants",
  initialState: {
    applicants: [],
    isLoading: false,
    error: null,
    total: 0,
    currentPage: 1,
  } as ApplicantsState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Applicants
      .addCase(fetchApplicants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplicants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applicants = action.payload.applicants.data;
        state.total = action.payload.total;
      })
      .addCase(fetchApplicants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Applicant
      .addCase(createApplicant.fulfilled, (state, action) => {
        if (action.payload.shouldAddToList) {
          state.applicants.unshift(action.payload.applicant);
          if (state.applicants.length > PAGINATION_CONFIG.DEFAULT_PAGE_SIZE) {
            state.applicants.pop();
          }
        }
        state.total += 1;
      })
      // Update Applicant
      .addCase(updateApplicant.fulfilled, (state, action) => {
        const index = state.applicants.findIndex(
          (applicant) => applicant.id === action.payload.id
        );
        if (index !== -1) {
          state.applicants[index] = {
            ...state.applicants[index],
            ...action.payload,
          };
        }
      })
      // Delete Applicant
      .addCase(deleteApplicant.fulfilled, (state, action) => {
        state.applicants = state.applicants.filter(
          (applicant) => applicant.id !== action.payload
        );
        state.total -= 1;
      });
  },
});

export const { setCurrentPage } = applicantsSlice.actions;
export default applicantsSlice.reducer;
