import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getApiWithAuth, postAPIWithAuth } from "@/utils/api"; // Added postApiWithAuth
import { toast } from "react-toastify";
import { PAGINATION_CONFIG } from "@/config/pagination";

// Define interfaces
interface FormValue {
  label: string;
  value:
    | string
    | number
    | {
        document_id: number;
        filename: string;
        path: string;
        content_type: string;
        size: number;
      };
}

interface FormSubmission {
  id: number;
  application_id: string;
  form_id: number | null;
  form_name: string | null;
  customer_id: number;
  applicant_id: number;
  visa_status: string;
  payment_status: string;
  priority: string;
  submitted_by: string;
  source: string;
  created_at: string;
  updated_at: string;
  values: {
    full_name?: FormValue;
    birth_date?: FormValue;
    gender?: FormValue;
    nationality?: FormValue;
    passport_number?: FormValue;
    passport_expiry?: FormValue;
    email?: FormValue;
    phone?: FormValue;
    arrival_date?: FormValue;
    departure_date?: FormValue;
    purpose_of_visit?: FormValue;
    accommodation_details?: FormValue;
    travel_history?: FormValue;
    additional_info?: FormValue;
    passport_scan?: FormValue;
    photo?: FormValue;
    travel_insurance?: FormValue;
    financial_documents?: FormValue;
  };
}

interface FormSubmissionState {
  data: FormSubmission[];
  currentSubmission: FormSubmission | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
}

const initialState: FormSubmissionState = {
  data: [],
  currentSubmission: null,
  isLoading: false,
  error: null,
  total: 0,
  currentPage: 1,
};

// Async Actions
export const fetchSubmissions = createAsyncThunk(
  "formSubmissions/fetchFormSubmissions",
  async (
    { skip = 0, search = "" }: { skip?: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const response: any = await getApiWithAuth(
        `form-submissions/?skip=${skip}&limit=${
          PAGINATION_CONFIG.DEFAULT_PAGE_SIZE
        }${search ? `&search=${search}` : ""}`
      );
      
      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch applications");
      }

      // Handle new API response structure: { total, skip, limit, data: [...] }
      // response.data from getApiWithAuth contains the API response body
      const responseData = response.data;
      const applicationsData = responseData?.data || (Array.isArray(responseData) ? responseData : []);
      const totalCount = responseData?.total || responseData?.results || (Array.isArray(responseData) ? responseData.length : 0);

      return {
        applications: applicationsData,
        total: totalCount,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch applications");
    }
  }
);

// Fetch single form submission
export const fetchFormSubmission = createAsyncThunk(
  "formSubmission/fetchFormSubmission",
  async (id: string, { rejectWithValue }) => {
    try {
      const response: any = await getApiWithAuth(`form-submissions/${id}`);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch form submission");
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch form submission"
      );
    }
  }
);

// Slice
const formSubmissionSlice = createSlice({
  name: "formSubmission",
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearCurrentSubmission: (state) => {
      state.currentSubmission = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Applications List
    builder
      .addCase(fetchSubmissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload.applications;
        state.total = action.payload.total;
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });
  },
});

export const { setCurrentPage, clearCurrentSubmission } =
  formSubmissionSlice.actions;
export default formSubmissionSlice.reducer;
