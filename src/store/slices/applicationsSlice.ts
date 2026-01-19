import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getApiWithAuth, postAPIWithAuth } from "@/utils/api"; // Added postApiWithAuth
import { toast } from "react-toastify";
import { PAGINATION_CONFIG } from "@/config/pagination";

// Types
interface Application {
  id: number;
  name: string;
  email: string;
  phone: string;
  passport_number: string;
  special_tags: string[];
  price: string;
  priority: string;
  visa_type: string;
  visa_country: string;
  internal_notes: string;
  customer_id: number | null;
  customer_name: string;
  applicant_id: number | null;
  applicant_name: string;
  is_group: boolean;
  group: string;
  group_id: number | null;
  passport?: File | null;
  photo?: File | null;
}

interface ApplicantionsState {
  applications: Application[];
  applicationData: {},
  isLoading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
}

const initialState = {
  data: [], // ✅ Ensure 'data' is initialized as an array
  loading: false,
  error: null,
};

// Async Actions
export const fetchApplications = createAsyncThunk(
  "applications/fetchApplications",
  async (
    { skip = 0, search = "" }: { skip?: number; search?: string },
    { rejectWithValue }
  ) => {
    console.log("skip : ", skip, " PAGINATION_CONFIG.DEFAULT_PAGE_SIZE : ", PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);
    try {
      const response: any = await getApiWithAuth(
        `forms/?skip=${skip}&limit=${PAGINATION_CONFIG.DEFAULT_PAGE_SIZE}${search ? `&search=${search}` : ""
        }`
      );

      if (!response) {
        throw new Error("No response from server");
      }

      console.log("API Response:", response);

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch applications");
      }

      // if (!response || !Array.isArray(response.data)) {
      //   throw new Error("Invalid data structure received");
      // }

      console.log("RES__ POS", response)
      return {
        applications: response.data.data,
        total: response.data.results || response.data.length,
      };
    } catch (error: any) {
      console.error("API Error:", error);

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


export const fetchFormsList = createAsyncThunk(
  "applications/fetchFormsList",
  async (
    { skip = 0, limit = 10 }: { skip?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response: any = await getApiWithAuth(
        `forms?skip=${skip}&limit=${limit}`
      );

      if (!response) {
        throw new Error("No response from server");
      }

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch forms list");
      }

      return response.data; // Returning forms list data
    } catch (error: any) {
      console.error("Fetch Forms List API Error:", error);

      if (error.status === 500) {
        return rejectWithValue("Internal server error. Please try again later.");
      }

      if (error.status === 401) {
        return rejectWithValue("Unauthorized. Please login again.");
      }

      return rejectWithValue(
        error.message || "Failed to fetch forms list. Please try again."
      );
    }
  }
);

export const createApplication = createAsyncThunk(
  "applications/createApplication",
  async (applicationData: any, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Add form metadata
      formData.append("form_id", "1");
      
      // Add values as a nested object
      const values = {
        full_name: applicationData.full_name,
        email: applicationData.email,
        phone: applicationData.phone,
        passport_number: applicationData.passport_number,
        // Add any other form fields here
      };
      formData.append("values", JSON.stringify(values));

      // Handle file fields
      const fileFields = ["passport_scan", "photo", "financial_documents", "travel_insurance"];
      fileFields.forEach(field => {
        if (applicationData[field]) {
          formData.append(field, applicationData[field]);
        }
      });

      // Debug FormData
      console.log("🚀 Sending FormData:");
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1] instanceof File ? `File(${pair[1].name})` : pair[1]);
      }

      const response: any = await postAPIWithAuth("form-submissions", formData);

      if (!response?.success) {
        throw new Error(response?.data?.detail || "Failed to create application");
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create application");
    }
  }
);

// Slice
const applicationsSlice = createSlice({
  name: "applications",
  initialState: {
    applications: [],
    applicationData: {},
    fields: [],
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
    // Fetch Applications
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
        toast.error(action.payload as string); // Show error toast
      });

    // Fetch Forms List
    builder
      .addCase(fetchFormsList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFormsList.fulfilled, (state, action) => {
        state.isLoading = false;
        // Store forms list in applicationData for now (can be refactored later)
        state.applicationData = action.payload;
      })
      .addCase(fetchFormsList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });

    // Create Application
    builder
      .addCase(createApplication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applications = [action.payload, ...state.applications];
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

export const { setCurrentPage } = applicationsSlice.actions;
export default applicationsSlice.reducer;