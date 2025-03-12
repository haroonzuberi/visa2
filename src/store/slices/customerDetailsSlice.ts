import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getApiWithAuth } from "@/utils/api";
import { toast } from "react-toastify";

export const fetchCustomerDetails = createAsyncThunk(
  "customerDetails/fetchDetails",
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response: any = await getApiWithAuth(
        `applicants/customer/${customerId}/with-applications`
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch customer details");
      }
      console.log("RESPONSE", response.data.data);
      return response.data.data;
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch customer details");
      return rejectWithValue(error.message);
    }
  }
);

const customerDetailsSlice = createSlice({
  name: "customerDetails",
  initialState: {
    customerData: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customerData = action.payload;
      })
      .addCase(fetchCustomerDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default customerDetailsSlice.reducer; 