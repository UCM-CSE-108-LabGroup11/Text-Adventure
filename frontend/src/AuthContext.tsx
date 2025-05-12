import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const BASE_URL = "http://localhost:5000";

  const fetchUser = async () => {
    const token = localStorage.getItem("access_token");
    if (!token || token === "undefined") {
      setUser(null);
      return;
    }
  
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        console.warn("Token invalid or expired. Logging out.");
        localStorage.removeItem("access_token");
        setUser(null);
      }
    } catch (err) {
      console.error("[AuthContext] Error Fetching:", err);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
