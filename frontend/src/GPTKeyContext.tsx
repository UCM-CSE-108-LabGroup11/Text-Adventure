import { createContext, useContext, useState, ReactNode } from "react";

type GPTKeyContextType = {
  apiKey: string | null;
  setApiKey: (key: string) => void;
};

const GPTKeyContext = createContext<GPTKeyContextType | undefined>(undefined);

export function GPTKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);

  return (
    <GPTKeyContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </GPTKeyContext.Provider>
  );
}

export function useGPTKey() {
  const context = useContext(GPTKeyContext);
  if (!context) throw new Error("useGPTKey must be used within GPTKeyProvider");
  return context;
}
