import { Route, Routes, BrowserRouter as Router, useNavigate, Navigate ,useLocation} from 'react-router-dom';
import ShellBar from './components/ShellBar/ShellBar';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme";
import { ListDomRef, Ui5CustomEvent } from "@ui5/webcomponents-react";
import { ListSelectionChangeEventDetail } from "@ui5/webcomponents/dist/List";
import { TimeoutProvider } from './components/TimeoutProvider/TimeoutProvider';
import SessionTimeoutDialog from "./components/SessionTimeoutDialog/SessionTimeoutDialog";
import { openSessionDialog, selectSessionDialogOpen } from "./pages/appSlice";
import { wrapFetch } from "./util/helpers";
import { BACKEND, ROUTES, getAbsoluteRoute } from "./util/Routes";
import { loadUserProfile, ProfileStatus, selectUserProfile } from "./pages/userProfile";
import MapComponent from './components/Map/MapComponent';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { useEffect, useState } from "react";

const theme = "cpms.theme";
const defaultTheme = "sap_horizon";
const totalTimeout = 4;
const timeoutDialogTime = 2;
let currentTheme: string | null = localStorage.getItem(theme);
if (currentTheme) {
  setTheme(currentTheme);
} else {
  setTheme(defaultTheme);
  currentTheme = defaultTheme;
}

function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation hook to get the current route
  const userProfile = useAppSelector(selectUserProfile);
  const sessionTimeout = useAppSelector(selectSessionDialogOpen);

  if (!userProfile.projectId && userProfile?.status === ProfileStatus.initial) {
    dispatch(loadUserProfile());
  }

  const handleThemeChange = (event: Ui5CustomEvent<ListDomRef, ListSelectionChangeEventDetail>) => {
    const selectedTheme = event.detail.selectedItems[0].getAttribute("data-theme");
    if (selectedTheme) {
      setTheme(selectedTheme);
      localStorage.setItem(theme, selectedTheme);
    }
  };
  
  const handleClose = () => {
    dispatch(openSessionDialog(false));
  };

  const handleContinue = () => {
    wrapFetch(getAbsoluteRoute(BACKEND.USER_PROFILE));
    dispatch(openSessionDialog(false));
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if the user is authenticated (e.g., based on localStorage or other logic)
    return !!localStorage.getItem("username"); // Example: Check if a username exists in localStorage
  });
  
  useEffect(() => {
    // If you need to perform any additional setup for authentication, do it here
  }, []);

  if (!userProfile.projectId && userProfile?.status === ProfileStatus.initial) {
    dispatch(loadUserProfile());
  }

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  return (
    <TimeoutProvider timeout={totalTimeout - timeoutDialogTime} handleTimeout={() => dispatch(openSessionDialog(true))}>
      {sessionTimeout && (
        <SessionTimeoutDialog
          isOpen={sessionTimeout}
          handleClose={handleClose}
          handleContinue={handleContinue}
          handleRefresh={handleRefresh}
          sessionTimeout={timeoutDialogTime}
        />
      )}
      {/* Conditionally render the ShellBar */}
      {!isAuthPage && (
        <ShellBar
          userProfile={userProfile}
          onNavigationClick={() => {}}
          handleThemeChange={handleThemeChange}
          currentTheme={currentTheme!}
        />
      )}
      <Routes>
  <Route
    path="/"
    element={
      localStorage.getItem("username") ? (
        <HomePage />
      ) : (
        <Navigate to="/login" replace />
      )
    }
  />
  <Route
    path="/details/:id"
    element={localStorage.getItem("token") ? <DetailPage /> : <Navigate to="/login" replace />}
  />
  <Route
    path="/map"
    element={localStorage.getItem("token") ? <MapComponent /> : <Navigate to="/login" replace />}
  />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
</Routes>
      {/* <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/details/:id"
          element={isAuthenticated ? <DetailPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/map"
          element={isAuthenticated ? <MapComponent /> : <Navigate to="/login" replace />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes> */}
      {/* <Routes>
  <Route
    path="/"
    element={
      isAuthenticated ? (
        <Navigate to={`/?username=${encodeURIComponent(localStorage.getItem("username") || "")}`} replace />
      ) : (
        <Navigate to="/login" replace />
      )
    }
  />
  <Route
    path="/details/:id"
    element={isAuthenticated ? <DetailPage /> : <Navigate to="/login" replace />}
  />
  <Route
    path="/map"
    element={isAuthenticated ? <MapComponent /> : <Navigate to="/login" replace />}
  />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
</Routes> */}
    </TimeoutProvider>
  );
}

export default App;