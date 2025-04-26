import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage';
import About from './About';
import Features from "./Features";
import Play from "./Play";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/About" element={<About />} />
                <Route path="/Features" element={<Features />} />
                <Route path="/Play" element={<Play />}/>
            </Routes>
        </Router>
    );
}

export default App;