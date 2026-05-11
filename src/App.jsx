import React from "react";
import { useTheme } from "@hooks/useTheme";
import AppRouter from "@router/AppRouter";

/**
 * Root application component
 * Initializes theme class on HTML element
 * @returns {JSX.Element} Application with theme support
 */
function App() {
  const { theme } = useTheme();

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return <AppRouter />;
}

export default App;
