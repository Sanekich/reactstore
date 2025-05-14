import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './components/MainPage/Main.js';
import Services from './components/Services/service.js';
import ListingsPage from './components/ComponentsListings/MainL/MainListings.js';
import Register from './components/Register/Register.js';
import Login from './components/Login/Login.js';
import Profile from './components/ComponentsListings/Profile/Profile.js';
  
function App() {
  return (
    <Router basename="/reactstore">
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/services" element={<Services />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
