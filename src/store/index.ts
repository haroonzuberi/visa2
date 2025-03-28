import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import sidebarReducer from "./slices/sidebarSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import usersSlice from "./slices/usersSlice";
import customersSlice from "./slices/customersSlice";
import applicantsReducer from "./slices/applicantsSlice";
import applicationsSlice from "./slices/applicationsSlice";
import customerDetailsReducer from "./slices/customerDetailsSlice";
import groupsReducer from "./slices/groupsSlice";
import formSubmissionReducer from "./slices/formSubmissionSlice";
import kanbanReducer from "./slices/kanbanSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sidebar: sidebarReducer,
    users: usersSlice,
    customers: customersSlice,
    applicants: applicantsReducer,
    applicantions: applicationsSlice,
    customerDetails: customerDetailsReducer,
    groups: groupsReducer,
    formSubmissions: formSubmissionReducer,
    kanban: kanbanReducer,
  },
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
