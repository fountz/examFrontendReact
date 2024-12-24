import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { insertLogs } from "../api/LogsApi";

const SessionTimeout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSessionTimeout = async () => {
      const loginTime = sessionStorage.getItem("loginTime");
      const userEmail = sessionStorage.getItem("userEmail");
      const userUuid = sessionStorage.getItem("userUuid");

      const getIPAddress = async () => {
        try {
          const response = await fetch("https://api.ipify.org?format=json");
          if (!response.ok) {
            throw new Error("Failed to fetch IP address");
          }
          const data = await response.json();
          return data.ip;
        } catch (error) {
          console.error("Error fetching IP address:", error);
          return "Unknown IP"; // หากล้มเหลวคืนค่า "Unknown IP"
        }
      };

      if (!userEmail || !userUuid) {
        navigate("/"); // หากไม่มีข้อมูลใน sessionStorage ไปหน้า Login
      } else {
        const currentTime = Date.now();
        const timeElapsed = currentTime - loginTime; // คำนวณเวลาในมิลลิวินาที

        if (timeElapsed > 15 * 60 * 1000) {
          // ถ้าเกินเวลา 15 นาที
          const ipAddress = await getIPAddress();
          const logData = {
            uuid: "", // กำหนด uuid หากจำเป็น หรือให้ back-end จัดการ
            email: userEmail,
            userUuid: userUuid, // ใช้ UUID จาก sessionStorage
            ipAddress: ipAddress,
            description: `Session expired for user ${userEmail}`,
          };
          try {
            await insertLogs(logData);
          } catch (error) {
            console.error("Error inserting logs:", error);
          }
          sessionStorage.clear(); // ลบข้อมูลทั้งหมดจาก sessionStorage
          navigate("/"); // ไปหน้า Login
        } else {
          sessionStorage.setItem("loginTime", currentTime); // ต่ออายุเซสชัน
        }
      }
    };

    checkSessionTimeout(); // เรียกฟังก์ชันภายใน useEffect
  }, [navigate]);

  return null; // Component นี้ไม่แสดงเนื้อหา
};

export default SessionTimeout;
