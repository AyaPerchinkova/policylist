import { FunctionComponent, ReactNode, useEffect, useRef } from "react";

interface ProviderProps {
  children: ReactNode;
  timeout: number;
  handleTimeout: Function;
}

export const TimeoutProvider: FunctionComponent<ProviderProps> = ({
  children,
  timeout,
  handleTimeout,
}: ProviderProps) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleWindowEvents = () => {
      clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        handleTimeout();
      }, timeout * 60000); //convert min to ms
    };

    window.addEventListener("fetch", handleWindowEvents);

    handleWindowEvents();

    //cleanup function
    return () => {
      window.removeEventListener("fetch", handleWindowEvents);
    };
  });

  return <>{children}</>;
};