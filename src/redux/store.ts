import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
//import detailReducer from "../pages/detailSlice";
import userprofileReducer from "../pages/userProfile";
import appReducer from "../pages/appSlice";

export const store = configureStore({
  reducer: {
    userprofile: userprofileReducer,
    app: appReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
export type AppStore = ReturnType<typeof configureStore>;