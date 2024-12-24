import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Login from "./pages/Login";
import User from "./pages/User";
import ActivityLogs from "./pages/ActivityLogs";
import SetPassword from "./pages/SetPassword";
import Navigation from './components/Navigation';
import SessionTimeout from './components/SessionTimeout';

function App() {
  return (
    <Router> {/* Router ครอบทั้งหมด */}
      {/* แสดง Navigation และ SessionTimeout ตลอดการใช้งานเว้นแต่หน้า setpassword */}
      <NavigationWrapper />
      <SessionWrapper />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/user" element={<User />} />
        <Route path="/activity-logs" element={<ActivityLogs />} />
        <Route path="/setpassword/:uuid" element={<SetPassword />} />
      </Routes>
    </Router>
  );
}

// Component ที่เช็ค path ปัจจุบันและแสดง Navigation
function NavigationWrapper() {
  const location = useLocation(); // ใช้ useLocation ภายใน component ที่อยู่ใน Router
  const navigate = useNavigate(); // Use navigate hook for redirection

  useEffect(() => {
    // Check if email exists in session storage
    const email = sessionStorage.getItem('userEmail');
    if (location.pathname === '/' && email) {
      // If user is already logged in, redirect to /user
      navigate('/user');
    }
  }, [location, navigate]);

  if (location.pathname === '/' || location.pathname.startsWith('/setpassword')) {
    return null; // ไม่แสดง Navigation เมื่ออยู่ที่หน้า Login หรือ SetPassword
  }

  return <Navigation />; // แสดง Navigation สำหรับหน้าอื่นๆ
}

function SessionWrapper() {
  const location = useLocation(); // ใช้ useLocation เพื่อตรวจสอบเส้นทาง

  if (location.pathname.startsWith('/setpassword')) {
    return null; // ไม่แสดง SessionTimeout เมื่ออยู่ที่หน้า SetPassword
  }

  return <SessionTimeout />; // แสดง SessionTimeout สำหรับหน้าอื่นๆ
}

export default App;
