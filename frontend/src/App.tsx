import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// pages
import LandingPage from '@/pages/LandingPage';
import About from '@/pages/About';
import Features from "@/pages/Features";
import WorldSelect from "@/pages/Play";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup"

// auth
import PrivateRoute from "@/components/PrivateRoute";

// ...
import ChatBox from "@/components/chatbox";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/About" element={<About />} />
                <Route path="/Features" element={<Features />} />

                <Route path="/Login" element={<Login />} />
                <Route path="/Signup" element={<Signup />} />
                <Route path="*" element={<Navigate to="/Signup" replace />} />

                <Route path="/Play" element={
                    <PrivateRoute>
                        <WorldSelect/>
                    </PrivateRoute>
                }/>
                <Route path="/Play/:chatId" element={
                    <PrivateRoute>
                        <ChatBox />
                    </PrivateRoute>
                } />
            </Routes>
        </Router>
    );
}

export default App;