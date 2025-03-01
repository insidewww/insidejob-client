import { ReactNode, useState, useEffect } from "react";
import LoadingPage from "../../pages/Loading";
import { GeneralContext, Preferences } from "../GeneralContext";
import handleFetchError from "../../utils/handleFetchError";

interface GeneralProviderProps {
  children: ReactNode;
}

export const GeneralProvider: React.FC<GeneralProviderProps> = ({
  children,
}) => {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<number | null>(null);

  useEffect(() => {
    let firstRun = true;

    const init = async () => {
      try {
        setLoading(true);

        if (!import.meta.env.VITE_SERVER_API_URL) {
          return console.error("VITE_SERVER_API_URL not found");
        }

        const input = import.meta.env.VITE_SERVER_API_URL + "/preferences";
        const response = await fetch(input);

        if (response.ok) {
          const data = await response.json();
          setPreferences(data);
          setLoading(false);
        } else {
          setStatus(response.status);
        }
      } catch {
        triggerCheck();
      }
    };

    const triggerCheck = async () => {
      if (!import.meta.env.VITE_API_GITHUB_TOKEN) {
        return console.error("VITE_API_GITHUB_TOKEN not found");
      }

      const owner = import.meta.env.VITE_API_GITHUB_OWNER;
      const repo = import.meta.env.VITE_API_GITHUB_REPO;
      const workflowFileName = import.meta.env.VITE_API_GITHUB_WORKFLOW_FILE;
      const token = import.meta.env.VITE_API_GITHUB_TOKEN;

      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFileName}/dispatches`;

      const data = {
        ref: "main", // The branch name where the workflow file is located
      };

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const delay = firstRun ? 15000 : 300000; // 15 seconds for the first run, 5 minutes for subsequent runs
          firstRun = false;
          setTimeout(() => init(), delay);
        }
      } catch (error) {
        console.error("Error triggering workflow:", error);
      }
    };

    // call
    init();
  }, []);

  const Child = () => {
    if (loading) {
      return <LoadingPage />;
    } else if (status) {
      return <p>{"Error: " + handleFetchError(status)}</p>;
    } else {
      return children;
    }
  };

  return (
    <GeneralContext.Provider
      value={{ preferences, setPreferences, loading, setLoading }}
    >
      <Child />
    </GeneralContext.Provider>
  );
};
