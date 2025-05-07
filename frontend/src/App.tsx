import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage';
import About from './About';
import Features from "./Features";
import WorldSelect from "./Play";
import ChatBox from "./chatbox";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/About" element={<About />} />
                <Route path="/Features" element={<Features />} />
                <Route path="/Play" element={<WorldSelect/>}/>
                <Route path="/Play/:chatId" element={<ChatBox />} />
            </Routes>
        </Router>
    );
}

export default App;