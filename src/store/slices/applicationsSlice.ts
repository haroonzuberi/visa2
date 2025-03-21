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

      if (!response || !Array.isArray(response.data)) {
        throw new Error("Invalid data structure received");
      }

      return {
        applications: response.data,
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

export const createApplication = createAsyncThunk(
  "applications/createApplication",
  async (applicationData: any, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      for (const key in applicationData) {
        if (applicationData[key] !== null && applicationData[key] !== undefined) {
          if (key === "special_tags") {
            formData.append(key, JSON.stringify(applicationData[key]));
          } else if (key === "passport" || key === "photo") {
            if (applicationData[key]) {
              formData.append(key, applicationData[key]);
            }
          } else {
            formData.append(key, applicationData[key]);
          }
        }
      }

      const response: any = await postAPIWithAuth("forms/", formData);

      if (!response) {
        throw new Error("No response from server");
      }

      console.log("Create Application API Response:", response);

      if (!response.success) {
        throw new Error(response.message || "Failed to create application");
      }

      return response.data; // Return the newly created application
    } catch (error: any) {
      console.error("Create Application API Error:", error);

      if (error.status === 500) {
        return rejectWithValue("Internal server error. Please try again later.");
      }

      if (error.status === 401) {
        return rejectWithValue("Unauthorized. Please login again.");
      }

      return rejectWithValue(
        error.message || "Failed to create application. Please try again."
      );
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
        return rejectWithValue("Internal server error. Please try again later.");
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

    // Create Application
    builder
      .addCase(createApplication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applications = [action.payload, ...state.applications]; // Add new application to the list
        state.total += 1; // Increment total count
        toast.success("Application created successfully!"); // Show success toast
      })
      .addCase(createApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string); // Show error toast
      });

    // get form data

    builder
      .addCase(fetchApplication.pending, (state) => {
        console.log("PENDING IN API");
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplication.fulfilled, (state, action) => {
        console.log("SUCCESS IN API",action.payload);
        state.isLoading = false;
        state.applicationData = action.payload; // Add new application to the list
        toast.success("Application created successfully!"); // Show success toast
      })
      .addCase(fetchApplication.rejected, (state, action) => {
        console.log("ERROR IN API");
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string); // Show error toast
      });

  },
});

export const { setCurrentPage } = applicationsSlice.actions;
export default applicationsSlice.reducer;