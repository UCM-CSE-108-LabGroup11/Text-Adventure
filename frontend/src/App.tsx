import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import About from '@/pages/About';
import Features from "@/pages/Features";
import WorldSelect from "@/pages/Play";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Layout from "./components/Layout";
import { AuthProvider } from "./AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import ChatBox from "@/components/chatbox";
import { GPTKeyProvider } from "./GPTKeyContext";

function App() {
  return (
    <GPTKeyProvider>
    <AuthProvider>
      <Router>
        <Routes>

          <Route element={<Layout />}>
            <Route path="/About" element={<About />} />
            <Route path="/Features" element={<Features />} />
            <Route path="/" element={<LandingPage />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="*" element={<Navigate to="/register" replace />} />

          {/* Wrap Play routes with Layout + PrivateRoute */}
          <Route
            path="/Play"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<WorldSelect />} />
            <Route path=":chatId" element={<ChatBox />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
    </GPTKeyProvider>
  );
}

export default App;
