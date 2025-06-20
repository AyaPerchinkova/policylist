import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";

// Define the shape of the user profile in the state
interface UserProfile {
  username: string | null;
  email: string | null;
  projectId: string | null;
  initials: string | null;
}

export interface AppState {
  sessionDialogOpen: boolean;
  userProfile: UserProfile | null; // Add the user profile to the state
}

const initialState: AppState = {
  sessionDialogOpen: false,
  userProfile: null, // Initially, no user profile
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    openSessionDialog: (state: AppState, action: PayloadAction<boolean>) => {
      state.sessionDialogOpen = action.payload;
    },
    setUserProfile: (state: AppState, action: PayloadAction<UserProfile>) => {
      state.userProfile = action.payload; // Set the user profile
    },
    logout: (state: AppState) => {
      state.userProfile = null; // Clear the user profile when logging out
    },
  },
});

export const selectSessionDialogOpen = (state: RootState): boolean => state.app.sessionDialogOpen;
export const selectUserProfile = (state: RootState): UserProfile | null => state.app.userProfile; // Selector to access the user profile

export const { openSessionDialog, setUserProfile, logout } = appSlice.actions;

export default appSlice.reducer;
