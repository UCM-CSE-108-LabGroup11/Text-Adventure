import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage';
import About from './About';
import Features from "./Features";
import WorldSelect from "./Play";
import ChatBox from "./chatbox";
import LoginPage from "./LoginPage";
import { AuthProvider } from './AuthContext';
import RegisterPage from "./RegisterPage"; 

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/About" element={<About />} />
          <Route path="/Features" element={<Features />} />
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
