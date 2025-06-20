import { FunctionComponent, useEffect, useState } from "react";
import {
  Dialog,
  Button,
  Bar,
  ButtonDesign,
  IllustratedMessage,
  IllustrationMessageType,
} from "@ui5/webcomponents-react";
import "@ui5/webcomponents-icons/dist/information.js";
import { useTranslation } from "react-i18next";
import "@ui5/webcomponents-fiori/dist/illustrations/tnt/SessionExpiring.js";
import "@ui5/webcomponents-fiori/dist/illustrations/tnt/SessionExpired.js";
import "@ui5/webcomponents-fiori/dist/illustrations/AllIllustrations.js";
import { useNavigate } from "react-router-dom";
interface DialogProps {
  isOpen: boolean;
  handleClose: () => void;
  handleContinue: () => void;
  handleRefresh: () => void;
  sessionTimeout: number;
}

const SessionTimeoutDialog: FunctionComponent<DialogProps> = ({
  isOpen,
  handleClose,
  handleContinue,
  handleRefresh,
  sessionTimeout,
}: DialogProps) => {
  /*
    Hooks
  */
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [counter, setCounter] = useState(sessionTimeout * 60);

  useEffect(() => {
    counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);
  }, [counter]);

  const isTimedOut = counter < 1;
  useEffect(() => {
    if (isTimedOut) {
      // Redirect to the login page when the session times out
      navigate("/login");
    }
  }, [isTimedOut, navigate]);
  
  /*
    Handler Functions
  */
  const handleCloseClick = () => handleClose();
  const handleContinueClick = () => handleContinue();
  const handleRefreshClick = () => handleRefresh();
  const secondsToTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedSeconds = remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;
    return `${minutes}:${formattedSeconds}`;
  };

  /*
    JSX
  */
  return (
    <Dialog
      footer={
        <Bar
          endContent={
            <>
              {!isTimedOut && (
                <Button design={ButtonDesign.Emphasized} onClick={handleContinueClick} data-testid="continue">
                  {t("continue")}
                </Button>
              )}
              {isTimedOut && (
                <Button design={ButtonDesign.Emphasized} onClick={handleRefreshClick} data-testid="refresh">
                  {t("refresh")}
                </Button>
              )}
              {isTimedOut && (
                <Button onClick={handleCloseClick} data-testid="close-session">
                  {t("close")}
                </Button>
              )}{" "}
            </>
          }
        />
      }
      headerText={t("sessionInfo")!}
      open={isOpen}
      data-testid="session-dialog"
      style={{ width: "35%" }}
    >
      {!isTimedOut && (
        <IllustratedMessage
          name={IllustrationMessageType.TntSessionExpiring}
          data-testid="session-expiring"
          titleText={t("sessionExpiring.titleText")!}
          subtitleText={t("sessionExpiring.subtitleText")! + secondsToTime(counter)}
        />
      )}
     {isTimedOut && (
        <IllustratedMessage
          name={IllustrationMessageType.TntSessionExpired}
          data-testid="session-expired"
          titleText={t("sessionExpired.titleText")!}
          subtitleText={t("sessionExpired.subtitleText")!}
        />
      )}
    </Dialog>
  );
};

export default SessionTimeoutDialog;