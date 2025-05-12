import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/AuthContext";
import { useState } from "react";
import SettingsModal from "../components/Settings"; // adjust path if needed

export default function Header() {
  const { user, logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header className="w-full py-4 px-6 mb-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-2xl hover:underline underline-offset-4 font-bold text-gray-600 hover:text-gray-900"
            >
              AI Adventure
            </Link>
            <nav className="flex space-x-4 text-sm font-medium text-gray-600">
              <Button asChild size="sm" variant="link">
                <Link to="/About">About</Link>
              </Button>
              <Button asChild size="sm" variant="link">
                <Link to="/Features">Features</Link>
              </Button>
              <Button asChild size="sm" variant="link">
                <Link to="/Play">Play</Link>
              </Button>
              {user && (
                <Button
                  size="sm"
                  variant="link"
                  onClick={() => setShowSettings(true)}
                  className="font-bold"
                >
                  Your API Key
                </Button>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-700">
                  Welcome, <strong>{user.username}</strong>
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="default" size="sm">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
