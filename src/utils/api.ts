import axios, { AxiosRequestHeaders } from "axios";
import { getAccessToken } from "./asyncStorage";

export const BASE_URL = "https://api.visa2.pro/api/v1/";
export const STATIC_URL = "";

axios.defaults.baseURL = BASE_URL;

// Define API response types
interface ApiResponse<T = any> {
  data: T;
  status?: number;
  success: boolean;
  headers?: any;
}

// POST without Auth
export const postAPIWithoutAuth = async <T>(
  url: string,
  body: Record<string, any> | string,
  headers?: AxiosRequestHeaders
): Promise<ApiResponse<T>> => {
  try {
    removeApiHeader();
    const defaultHeaders = {
      "Content-Type": "application/json",
      ...headers // Allow overriding default headers if needed
    };
    
    const res = await axios.post<T>(url, body, { headers: defaultHeaders });
    return {
      data: res.data,
      status: res.status,
      success: true,
      headers: res.headers,
    };
  } catch (err: any) {
    console.log("ERROR_--", err);
    return { data: err?.response?.data.detail, success: false };
  }
};

// POST with Auth
export const postAPIWithAuth = async <T>(
  url: string,
  body: Record<string, any>,
  headers?: AxiosRequestHeaders
): Promise<ApiResponse<T>> => {
  try {
    await setApiHeader();
    const res = headers
      ? await axios.post<T>(url, body, { headers })
      : await axios.post<T>(url, body);
    return { data: res.data, status: res.status, success: true };
  } catch (err: any) {
    return { data: err?.response?.data, success: false };
  }
};

// PUT with Auth
export const putAPIWithAuth = async <T>(
  url: string,
  body: Record<string, any>
): Promise<ApiResponse<T>> => {
  try {
    await setApiHeader();
    const res = await axios.put<T>(url, body);
    return { data: res.data, status: res.status, success: true };
  } catch (err: any) {
    return { data: err?.response?.data, success: false };
  }
};

// GET with Auth
export const getApiWithAuth = async <T>(
  url: string
): Promise<ApiResponse<T>> => {
  try {

    await setApiHeader();
    const res = await axios.get<T>(url);
    return { data: res?.data, status: res.status, success: true };
  } catch (err: any) {
    return { data: err?.response?.data, success: false };
  }
};

// GET without Auth
export const getApiWithoutAuth = async <T>(
  url: string
): Promise<ApiResponse<T>> => {
  try {
    removeApiHeader();
    const res = await axios.get<T>(url);
    return { data: res?.data, status: res.status, success: true };
  } catch (err: any) {
    return { data: err?.response?.data, success: false };
  }
};

// PATCH with Auth
export const patchApiWithAuth = async <T>(
  url: string,
  body: Record<string, any>
): Promise<ApiResponse<T>> => {
  try {
    await setApiHeader();
    const res = await axios.patch<T>(url, body);
    return { data: res.data, status: res.status, success: true };
  } catch (err: any) {
    return { data: err?.response?.data, success: false };
  }
};

// DELETE with Auth
export const deleteApi = async <T>(url: string): Promise<ApiResponse<T>> => {
  try {
    await setApiHeader();
    const res = await axios.delete<T>(url);
    return { data: res.data, status: res.status, success: true };
  } catch (err: any) {
    return { data: err?.response?.data, success: false };
  }
};

// Set Authorization Header
const setApiHeader = async (): Promise<void> => {
  const token = await getAccessToken();
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
};

// Remove Authorization Header
const removeApiHeader = (): void => {
  delete axios.defaults.headers.common.Authorization;
};
