import React, { useState } from "react";
import {  insertLogs  } from '../api/LogsApi';
import { loginUser } from "../api/UserApi";
import '../css/Login.css';
import Swal from 'sweetalert2';


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
      return null; // กรณีเกิดข้อผิดพลาด จะส่งค่า null กลับ
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();

    // ตรวจสอบข้อมูลว่าเป็นค่าที่ไม่ว่าง
    if (!email || !password) {
      setError("Email and Password are required");
      return;
    }

    try {
      // เรียกใช้ฟังก์ชัน loginUser เพื่อเข้าสู่ระบบ
      const data = await loginUser(email, password);
      // หาก login สำเร็จ, redirect ไปยังหน้าอื่น (เช่นหน้า Dashboard)
       // save logs
        const ipAddress = await getIPAddress(); 
        const logData = {
          uuid: "",
          email: sessionStorage.getItem('userEmail'),
          userUuid: sessionStorage.getItem('userUuid'), // ใช้ UUID จาก insertUser
          ipAddress: ipAddress,
          description: "Login" ,
        };
        await insertLogs(logData);
      await  Swal.fire({
                icon: 'success',
                title: "Login Success",
                showConfirmButton: false,
                timer: 1500,
              });
      window.location.href = "/user";
    } catch (error) {
       // save logs
       const ipAddress = await getIPAddress(); 
       const logData = {
         uuid: "",
         email: email,
         userUuid: "", // ใช้ UUID จาก insertUser
         ipAddress: ipAddress,
         description: "Login Error" +error,
       };
       await insertLogs(logData);
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>

      </form>
    </div>
  );
};

export default Login;
