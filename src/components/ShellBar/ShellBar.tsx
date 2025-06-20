import  { FunctionComponent, ReactElement, useEffect, useRef } from 'react';
import {
  Avatar,
  FlexBox,
  FlexBoxAlignItems,
  List,
  ListMode,
  ListSeparators,
  Popover,
  PopoverDomRef,
  PopoverHorizontalAlign,
  PopoverPlacementType,
  ShellBar as UI5shellBar,
  ShellBarDomRef,
  StandardListItem,
  Title,
  Ui5CustomEvent,
  AvatarSize,
  TitleLevel,
  ShellBarItem,
  ListDomRef,
  Button,
  ButtonDesign,
  MessageBox,
  MessageBoxTypes,
  MessageBoxActions,
  ShellBarItemDomRef,
} from "@ui5/webcomponents-react";
import { ListSelectionChangeEventDetail } from "@ui5/webcomponents/dist/List";
// Removed ShellBarItemClickEventDetail as it is not exported from "@ui5/webcomponents-react"
import { createRef, RefObject, useState } from "react";
import { UseTranslationResponse, useTranslation } from "react-i18next";
import "@ui5/webcomponents-icons/dist/palette";
import "@ui5/webcomponents-icons/dist/log";
import "@ui5/webcomponents-icons/dist/copy";
import { Location, NavigateFunction, useLocation, useNavigate } from "react-router-dom";
import { UserProfileState } from "../../pages/userProfile";
import { ROUTES } from "../../util/Routes";
import { useDispatch } from 'react-redux';
import { logout } from '../../pages/appSlice';
import BackButton from "../BackButton/BackButton";
import i18n from '../../util/i18n';
import "@ui5/webcomponents-icons/dist/globe"; // Import the globe icon
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

interface ShellBarProps {
  onNavigationClick: (to: string) => void;
  userProfile: UserProfileState;
  handleThemeChange: (event: Ui5CustomEvent<ListDomRef, ListSelectionChangeEventDetail>) => void;
  currentTheme: string;
}

// actions.ts

export const logoutAction = () => ({
  type: 'LOGOUT' as const, // TypeScript: define the type of action
});

export type AppActions = ReturnType<typeof logoutAction>; // This will infer the correct action type

const ShellBar: FunctionComponent<ShellBarProps> = ({ 
  onNavigationClick, 
  userProfile, 
  handleThemeChange,
  currentTheme, 
}:ShellBarProps):ReactElement => {
  const { t } = useTranslation();
  const [isChartDialogOpen, setIsChartDialogOpen] = useState(false); // State for chart dialog
  const languagePopoverRef: RefObject<PopoverDomRef> = createRef<PopoverDomRef>(); 
  const themingPopoverRef: RefObject<PopoverDomRef> = createRef<PopoverDomRef>();
  const popoverRef: RefObject<PopoverDomRef> = createRef<PopoverDomRef>();
  const navigate: NavigateFunction = useNavigate();
  const location: Location = useLocation();
  const [confirmSignOut, setConfirmSignOut] = useState<boolean>(false);
  const dispatch = useDispatch();
  const [localUserProfile, setLocalUserProfile] = useState({
    username: "",
    email: "",
    initials: "",
  });
  useEffect(() => {
    // Retrieve user data from localStorage
    const username = localStorage.getItem("username") || "Guest";
    const email = localStorage.getItem("email") || "Not provided";

    // Generate initials from username
    const initials = username
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase();

    setLocalUserProfile({ username, email, initials });
  }, []);
  const exportPopoverRef: RefObject<PopoverDomRef> = createRef<PopoverDomRef>();

  const handleExportClick = (event: Ui5CustomEvent<ShellBarItemDomRef, any>) => {
    exportPopoverRef.current?.showAt(event.target as HTMLElement); // Show the export dropdown
  };

  const handleExportCSV = () => {
    exportPopoverRef.current?.close(); // Close the dropdown
    console.log("Exporting as CSV...");
    // Add your CSV export logic here
  };

  const handleExportPDF = () => {
    exportPopoverRef.current?.close(); // Close the dropdown
    console.log("Exporting as PDF...");
    // Add your PDF export logic here
  };
  const onLogoClick = () => {
    onNavigationClick('/');
  };
  const handleProfileClick = (event: Ui5CustomEvent<ShellBarDomRef, { targetRef: HTMLElement }>): void => {
    popoverRef.current?.showAt(event.detail.targetRef);
  };

  const handleThemingClick = (event: any): void => {
    themingPopoverRef.current?.showAt(event.detail.targetRef);
  };
  
  const handleSignOutConfirm = (event: CustomEvent<{ action: string }>) => {
    if (event.detail.action === MessageBoxActions.OK) {
      // Perform logout actions
      dispatch(logout()); // Dispatch logout action if needed
      navigate("/login"); // Navigate to the login page
    }
    if (event.detail.action === MessageBoxActions.Cancel) {
      setConfirmSignOut(false); // Close the confirmation dialog
    }
  };
  
  return (
   <>  
    <UI5shellBar data-testid="shell-header"  primaryTitle={t("shell.title")}  
        logo={
          <img
            alt="Logo"
            src="/policy.jpg"
          />
        }
        onClick={onLogoClick}
        onProfileClick={handleProfileClick}
        profile={<Avatar initials={localUserProfile.initials} data-testid="avatar-id" />}
        startButton={<BackButton currentLocation={location.pathname} navigate={navigate} />}
      >
      <ShellBarItem
        icon="download-from-cloud" // Export button
        text={t("shell.export")}
        onClick={(event: Ui5CustomEvent<ShellBarItemDomRef, any>) => handleExportClick(event)} // Open export dropdown
      />  
      <ShellBarItem
        icon="palette"
        text={t("shell.theme")}
        onClick={handleThemingClick}
        data-testid="themingButton"
      />
      <ShellBarItem
        icon="log"
        text={t("shell.logOut")}
        onClick={() => setConfirmSignOut(true)}
      />
    </UI5shellBar>
    
      <Popover
          ref={exportPopoverRef}
          placement-type="Bottom"
          horizontal-align="Right"
          header-text="Export Options"
        >
          <List>
            <StandardListItem icon="excel-attachment" onClick={handleExportCSV}>
              Export to CSV
            </StandardListItem>
            <StandardListItem icon="pdf-attachment" onClick={handleExportPDF}>
              Export to PDF
            </StandardListItem>
          </List>
        </Popover>
      <Popover ref={themingPopoverRef} placement-x="Bottom" horizontal-align="Right" header-text={t("shell.theme")}>
        <List mode={ListMode.SingleSelect} onSelectionChange={handleThemeChange} data-testid="themeList">
          <StandardListItem icon="palette" data-theme="sap_horizon" selected={currentTheme === "sap_horizon"}>
          {t("shell.horizonMorning")}
          </StandardListItem>
          <StandardListItem icon="palette" data-theme="sap_horizon_dark" selected={currentTheme === "sap_horizon_dark"}>
          {t("shell.horizonEvening")}
          </StandardListItem>
          <StandardListItem icon="palette" data-theme="sap_horizon_hcb" selected={currentTheme === "sap_horizon_hcb"}>
          {t("shell.horizonHCB")}
          </StandardListItem>
          <StandardListItem icon="palette" data-theme="sap_fiori_3" selected={currentTheme === "sap_fiori_3"}>
          {t("shell.quartzLight")}
          </StandardListItem>
          <StandardListItem icon="palette" data-theme="sap_fiori_3_dark" selected={currentTheme === "sap_fiori_3_dark"}>
          {t("shell.quartzDark")}
          </StandardListItem>
        </List>
      </Popover>
      <Popover
  ref={popoverRef}
  placementType={PopoverPlacementType.Bottom}
  horizontalAlign={PopoverHorizontalAlign.Right}
  data-testid="popover-id"
>
  <FlexBox style={{ marginBottom: 10 }}>
    <Avatar size={AvatarSize.M} initials={localUserProfile.initials} />
    <FlexBox style={{ marginLeft: 10 }} alignItems={FlexBoxAlignItems.Center}>
      <Title level={TitleLevel.H3}>{localUserProfile.username}</Title>
    </FlexBox>
  </FlexBox>
  <List separators={ListSeparators.None}>
    <StandardListItem>
      <strong>Username:</strong> {localUserProfile.username}
    </StandardListItem>
    <StandardListItem>
      <strong>Email:</strong> {localUserProfile.email}
    </StandardListItem>
  </List>        
      </Popover>
      <MessageBox
        titleText={t("shell.logOut")}
        type={MessageBoxTypes.Confirm}
        open={confirmSignOut}
        actions={[MessageBoxActions.OK, MessageBoxActions.Cancel]}
        onClose={handleSignOutConfirm}
      >
        {t("signOutConfirmation")}
      </MessageBox>
   </>
  );
};

export default ShellBar;