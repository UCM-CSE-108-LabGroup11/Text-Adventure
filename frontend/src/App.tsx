import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import WorldSelect from "./pages/Play";
import ChatBox from "./components/chatbox";
import LoginPage from "./LoginPage";
import { AuthProvider } from './AuthContext';
import RegisterPage from "./RegisterPage"; 

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/Play" element={<WorldSelect />} />
          <Route path="/Play/:chatId" element={<ChatBox />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
