import { Button, ButtonDesign } from "@ui5/webcomponents-react";
import { NavigateFunction } from "react-router-dom";
import "@ui5/webcomponents-icons/dist/navigation-left-arrow.js"; // Ensure the icon is imported

interface BackButtonProps {
  slot?: string;
  currentLocation: string;
  navigate: NavigateFunction;
}

const BackButton = ({ slot, currentLocation, navigate }: BackButtonProps) => {
  // Always navigate to the homepage when the back button is clicked
  const handleBackClick = () => {
    navigate("/");  // Navigate to homepage
  };

  return (
    <Button
      data-testid="back-button"
      slot={slot}
      icon="navigation-left-arrow" // Use the correct icon name
      design={ButtonDesign.Negative}
      onClick={handleBackClick}  // Always navigate to homepage
    />
  );
};

export default BackButton;