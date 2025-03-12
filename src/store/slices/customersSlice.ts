import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  postAPIWithoutAuth,
  postAPIWithAuth,
  getApiWithAuth,
  putAPIWithAuth,
} from "@/utils/api";
import { toast } from "react-toastify";
import { PAGINATION_CONFIG } from "@/config/pagination";

// Types

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  creation_source: string;
  address: string;
  country: string;
  created_at: string;
}

interface CustomersState {
  customers: any[];
  isLoading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
}

// Async Actions

export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (customerData: any, { getState, dispatch }) => {
    try {
      const response: any = await postAPIWithAuth("customers/", customerData);

      if (!response.success) {
        throw new Error(response.message || "Failed to create customer");
      }

      // Get current state
      const state: any = getState();
      const currentPage = state.customers.currentPage;
      const total = state.customers.total + 1;
      const totalPages = Math.ceil(total / PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);

      // If we're not on the first page and it's a new page
      if (
        currentPage !== 1 &&
        total > PAGINATION_CONFIG.DEFAULT_PAGE_SIZE * (currentPage - 1)
      ) {
        // Fetch the current page data
        const skip = (currentPage - 1) * PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
        dispatch(fetchCustomers({ skip }));
      }

      toast.success("Customer created successfully");
      return {
        customer: response.data,
        shouldAddToList: currentPage === 1,
      };
    } catch (error: any) {
      toast.error(error.message || "Failed to create customer");
      throw error;
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response: any = await putAPIWithAuth(`customers/${id}`, data);

      if (!response.success) {
        throw new Error(response.message || "Failed to update customer");
      }

      toast.success("Customer updated successfully");
      return { id, ...data };
    } catch (error: any) {
      toast.error(error.message || "Failed to update customer");
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (
    { skip = 0, search = "" }: { skip?: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const response: any = await getApiWithAuth(
        // `customers/?skip=${skip}&limit=${PAGINATION_CONFIG.DEFAULT_PAGE_SIZE}`
        `customers/?skip=${skip}&limit=${PAGINATION_CONFIG.DEFAULT_PAGE_SIZE}${
          search ? `&search=${search}` : ""
        }`
      );

      if (!response.success) {
        throw new Error(response.data?.message || "Failed to fetch customers");
      }

      return {
        customers: response.data.data,
        total: response.data.meta.total,
      };
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch customers");
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const customersSlice = createSlice({
  name: "customers",
  initialState: {
    customers: [],
    isLoading: false,
    error: null,
    total: 0,
    currentPage: 1,
  } as CustomersState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = action.payload.customers;
        state.total = action.payload.total;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.shouldAddToList) {
          state.customers.unshift(action.payload.customer);
          if (state.customers.length > PAGINATION_CONFIG.DEFAULT_PAGE_SIZE) {
            state.customers.pop();
          }
        }
        state.total += 1;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.customers.findIndex(
          (customer) => customer.id === action.payload.id
        );
        if (index !== -1) {
          state.customers[index] = {
            ...state.customers[index],
            ...action.payload,
          };
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentPage } = customersSlice.actions;
export default customersSlice.reducer;
