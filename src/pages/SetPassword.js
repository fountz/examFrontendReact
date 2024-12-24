import React, { useState, useEffect } from 'react';
import { useParams,useNavigate  } from 'react-router-dom';
import { setPassword, getData } from '../api/UserApi'; // นำเข้าฟังก์ชัน getData
import { insertLogs } from '../api/LogsApi';
import '../css/SetPassword.css';
import Swal from 'sweetalert2';

const SetPassword = () => {
  const { uuid } = useParams(); // ดึง uuid จาก URL
  const [password, setPasswordState] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null); // สถานะสำหรับเก็บข้อมูลผู้ใช้
  const navigate = useNavigate();
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
  // ดึงข้อมูลผู้ใช้จาก API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getData(uuid); // ดึงข้อมูลจาก API โดยใช้ uuid
        setUserData(data); // เก็บข้อมูลผู้ใช้ใน state
      } catch (error) {
        const ipAddress = await getIPAddress(); 
        const logData = {
          uuid: "",
          email: "",
          userUuid: uuid, // ใช้ UUID จาก insertUser
          ipAddress: ipAddress,
          description: "User Not Found "+uuid ,
        };
        await insertLogs(logData);
         // แสดงข้อความสำเร็จ
      await Swal.fire({
        icon: 'error',
        title: 'User Not Found.',
        showConfirmButton: false,
        timer: 1500,
      });
  
      // รอให้ Swal แสดงผลแล้วค่อย redirect ไปยังหน้า Login
      navigate(`/`);
      }
    };

    fetchUserData(); // เรียกใช้ฟังก์ชันนี้เมื่อ component โหลด
  }, [uuid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // ตรวจสอบว่า password และ confirmPassword ตรงกันหรือไม่
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
  
    try {
      // เรียกใช้ฟังก์ชัน setPassword เพื่ออัพเดตรหัสผ่าน
      await setPassword(uuid, password);
       const ipAddress = await getIPAddress(); 
      const logData = {
        uuid: "",
        email: userData.email,
        userUuid: userData.uuid, // ใช้ UUID จาก insertUser
        ipAddress: ipAddress,
        description: "Set Password" ,
      };
      await insertLogs(logData);
      // แสดงข้อความสำเร็จ
      await Swal.fire({
        icon: 'success',
        title: 'Password Updated Successfully',
        showConfirmButton: false,
        timer: 1500,
      });
  
      // รอให้ Swal แสดงผลแล้วค่อย redirect ไปยังหน้า Login
      navigate(`/`);
    } catch (error) {
      const ipAddress = await getIPAddress(); 
      const logData = {
        uuid: "",
        email: userData.email,
        userUuid: userData.uuid, // ใช้ UUID จาก insertUser
        ipAddress: ipAddress,
        description: "Set Password Error" + error ,
      };
      await insertLogs(logData);
      setError("Error updating password: " + error.message);
    }
  };

  return (
    <div className="set-password-container">
      <h2>Set New Password</h2>
      
      {/* แสดงข้อมูลผู้ใช้ */}
      {userData ? (
        <div className="user-info">
          {/* แสดงรูปภาพโปรไฟล์ */}
          <img
            src={userData.profileImg || "https://img.freepik.com/premium-vector/avatar-icon0002_750950-43.jpg"}
            alt="Profile"
            className="profile-img"
            onError={(e) => {
                e.target.onerror = null; // ป้องกัน loop ของ onError
                e.target.src = "https://img.freepik.com/premium-vector/avatar-icon0002_750950-43.jpg";
            }}
            />

          <p><strong>Name:</strong> {userData.firstName} {userData.lastName}</p>
          <p><strong>Email:</strong> {userData.email}</p>
        </div>
      ) : (
        <div>Loading user data...</div> // แสดงข้อความระหว่างที่กำลังโหลดข้อมูล
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPasswordState(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="btn btn-primary w-100">
          Set Password
        </button>
      </form>
    </div>
  );
};

export default SetPassword;
