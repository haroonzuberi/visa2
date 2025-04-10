import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getApiWithAuth, postAPIWithAuth, putAPIWithAuth } from "@/utils/api";
import { toast } from "react-toastify";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Applicant {
  id: number;
  name: string;
  email: string;
  phone: string;
  passport_number: string;
}

interface Application {
  id: number;
  application_id: string;
  form_id: number | null;
  form_name: string | null;
  customer: Customer;
  applicant: Applicant;
  visa_country: string;
  visa_type_id: number | null;
  payment_status: string;
  priority: string;
  submitted_by: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}

interface KanbanState {
  status_counts: {
    new: number;
    ready_to_apply: number;
    need_gov_fee: number;
  };
  total_count: number;
  applications_by_status: {
    new: Application[];
    ready_to_apply: Application[];
    need_gov_fee: Application[];
  } | null;
  filter_options: {
    countries: string[];
    forms: { id: number; name: string }[];
  };
  isLoading: boolean;
  error: string | null;
}

interface FilterParams {
  priority?: string;
  payment_status?: string;
  start_date?: string;
  end_date?: string;
  applicant_id?: number;
}
const initialState: KanbanState = {
  status_counts: {
    new: 0,
    ready_to_apply: 0,
    need_gov_fee: 0,
  },
  total_count: 0,
  applications_by_status: null,
  filter_options: {
    countries: [],
    forms: [],
  },
  isLoading: true,
  error: null,
};

export const fetchKanbanData = createAsyncThunk(
  "kanban/fetchKanbanData",
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await postAPIWithAuth("applications-by-status", {});

      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch kanban data");
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch kanban data");
    }
  }
);

export const filterKanbanData = createAsyncThunk(
  "kanban/filterKanbanData",
  async (filters: FilterParams, { rejectWithValue }) => {
    try {
      const response: any = await postAPIWithAuth(
        `applications-by-status`,
        filters
      );
      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch kanban data");
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch kanban data");
    }
  }
);
interface UpdateStatusRequest {
  id: number;
  new_status: string;
  note?: string;
  priority?: string;
}

export const columnToStatusMap = {
  todo: "new",
  haveIssues: "ready_to_apply",
  done: "need_gov_fee",
  rejected: "rejected",
};
interface BulkUpdateStatusRequest {
  applications: {
    id: number;
    new_status: string;
    note?: string;
    priority?: string;
  }[];
}
export const updateApplicationStatus = createAsyncThunk(
  "kanban/updateStatus",
  async (params: UpdateStatusRequest, { rejectWithValue, dispatch }) => {
    try {
      console.log("{ARAMS___", params);
      const response: any = await putAPIWithAuth("update-application-status", {
        new_status: params.new_status,
        id: params.id,
      });

      if (!response?.success) {
        console.log("RESPONSE___", response);
        throw new Error(response?.data.message || "Failed to update status");
      }

      toast.success("Status Changed Sucessfully");
      // await dispatch(fetchKanbanData());

      return response.data;
    } catch (error: any) {
      console.log("ERROR", error);
      toast.error(error.message || "Failed to Update Status");
      return rejectWithValue(error.message || "Failed to update status");
    }
  }
);

export const updateBulkApplicationStatus = createAsyncThunk(
  "kanban/updateBulkStatus",
  async (params: BulkUpdateStatusRequest, { rejectWithValue, dispatch }) => {
    try {
      console.log("PARAMS___", params);

      // Constructing the request payload based on the new structure
      const payload = {
        applications: params.applications, // Sending the applications array directly
      };

      // Making the API call to the bulk update endpoint
      const response: any = await putAPIWithAuth(
        "bulk-update-application-status",
        payload
      );

      if (!response?.success) {
        console.log("RESPONSE___", response);
        throw new Error(
          response?.data.message || "Failed to update bulk status"
        );
      }

      toast.success("Statuses Changed Successfully");
      // Optionally re-fetch data after the bulk update
      // await dispatch(fetchKanbanData());

      return response.data;
    } catch (error: any) {
      console.log("ERROR", error);
      toast.error(error.message || "Failed to Update Status");
      return rejectWithValue(error.message || "Failed to update status");
    }
  }
);

const kanbanSlice = createSlice({
  name: "kanban",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchKanbanData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchKanbanData.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.status_counts = action.payload.status_counts;
        state.total_count = action.payload.total_count;
        state.applications_by_status = action.payload.applications_by_status;
        state.filter_options = action.payload.filter_options;
      })
      .addCase(fetchKanbanData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(filterKanbanData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(filterKanbanData.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.status_counts = action.payload.status_counts;
        state.total_count = action.payload.total_count;
        state.applications_by_status = action.payload.applications_by_status;
        state.filter_options = action.payload.filter_options;
      })
      .addCase(filterKanbanData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        // Optional: Update local state if needed
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        // Handle error if needed
      });
  },
});

export default kanbanSlice.reducer;
