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
export const fetchApplications = createAsyncThunk(
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
      console.log("RESPONSE___", response);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch applications");
      }

      return {
        applications: response.data,
        total: response.data.results || response.data.length,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch applications");
    }
  }
);

export const fetchApplication = createAsyncThunk(
  "applications/fetchApplication",
  async (_, { rejectWithValue }) => {
    try {
      console.log("API should be called");
      const response: any = await getApiWithAuth("forms/2");

      if (!response) {
        throw new Error("No response from server");
      }

      console.log("Fetch Application API Response:", response);

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch application data");
      }

      return response.data; // Returning application data
    } catch (error: any) {
      console.error("Fetch Application API Error:", error);

      if (error.status === 500) {
        return rejectWithValue(
          "Internal server error. Please try again later."
        );
      }

      if (error.status === 401) {
        return rejectWithValue("Unauthorized. Please login again.");
      }

      return rejectWithValue(
        error.message || "Failed to fetch application data. Please try again."
      );
    }
  }
);

export const createApplication = createAsyncThunk(
  "formSubmission/createApplication",
  async (applicationData: any, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("form_id", "1");

      const values = {
        full_name: applicationData.full_name,
        email: applicationData.email,
        phone: applicationData.phone,
        passport_number: applicationData.passport_number,
      };
      formData.append("values", JSON.stringify(values));

      // Handle file fields
      const fileFields = [
        "passport_scan",
        "photo",
        "financial_documents",
        "travel_insurance",
      ];
      fileFields.forEach((field) => {
        if (applicationData[field]) {
          formData.append(field, applicationData[field]);
        }
      });

      const response: any = await postAPIWithAuth("form-submissions", formData);

      if (!response?.success) {
        throw new Error(
          response?.data?.detail || "Failed to create application"
        );
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create application");
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
      .addCase(fetchApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload.applications;
        state.total = action.payload.total;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });

    // Fetch Single Form Submission
    builder
      .addCase(fetchFormSubmission.pending, (state) => {
        state.isLoading = true;
        ``;
        state.error = null;
      })
      .addCase(fetchFormSubmission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSubmission = action.payload;
      })
      .addCase(fetchFormSubmission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Application
    builder
      .addCase(createApplication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = [action.payload, ...state.data];
        state.total += 1;
        toast.success("Application created successfully!");
      })
      .addCase(createApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });
  },
});

export const { setCurrentPage, clearCurrentSubmission } =
  formSubmissionSlice.actions;
export default formSubmissionSlice.reducer;
