import React, { useEffect } from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { insertLogs } from '../api/LogsApi';
import '../css/Navigation.css';

const Navigation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = sessionStorage.getItem('userEmail');
    const userUuid = sessionStorage.getItem('userUuid');
    const getIPAddress = async () => {
        try {
          const response = await fetch('https://api.ipify.org?format=json');
          if (!response.ok) {
            throw new Error("Failed to fetch IP address");
          }
          const data = await response.json();
          return data.ip;
        } catch (error) {
          console.error("Error fetching IP address:", error);
          return null;
        }
      };
    // ตรวจสอบว่ามีข้อมูลการล็อกอินใน sessionStorage หรือไม่
    if (!userEmail || !userUuid) {
      navigate('/'); // หากไม่มีข้อมูลการล็อกอินให้ไปหน้า Login
    }
  }, [navigate]);

  // ฟังก์ชันสำหรับการ Logout
  const handleLogout = async () => {
    const userEmail = sessionStorage.getItem('userEmail');
    const userUuid = sessionStorage.getItem('userUuid');
    const getIPAddress = async () => {
        try {
          const response = await fetch('https://api.ipify.org?format=json');
          if (!response.ok) {
            throw new Error("Failed to fetch IP address");
          }
          const data = await response.json();
          return data.ip;
        } catch (error) {
          console.error("Error fetching IP address:", error);
          return null;
        }
      };
    const ipAddress = await getIPAddress(); // ใช้ await กับฟังก์ชัน async
    const logData = {
      uuid: "",
      email: userEmail,
      userUuid: userUuid,
      ipAddress: ipAddress,
      description: "Logout",
    };
    await insertLogs(logData); // เรียกใช้ insertLogs โดยใช้ await

    sessionStorage.clear(); // ลบข้อมูลทั้งหมดจาก sessionStorage
    navigate('/'); // รีไดเรกต์ไปหน้า Login
  };

  return (
    <Navbar bg="light" variant="light" expand="lg" className="shadow-sm">
      <Navbar.Brand as={Link} to="/" className="font-weight-bold exam-app-brand">ExamApp</Navbar.Brand>
      <Nav className="ml-auto"> {/* ใช้ ml-auto หรือ ms-auto สำหรับ Bootstrap 5 */}
        <Nav.Link as={Link} to="/user" className="nav-link">User</Nav.Link>
        <Nav.Link as={Link} to="/activity-logs" className="nav-link">Activity Logs</Nav.Link>
      </Nav>
      {/* ปุ่ม Logout อยู่ขวาสุด */}
      <Button variant="outline-danger" onClick={handleLogout} className="ms-auto">Logout</Button> 
    </Navbar>
  );
};

export default Navigation;
