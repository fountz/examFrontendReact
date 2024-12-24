const API_URL = "http://localhost:8701/apis/user";

const defaultHeaders = {
  "Content-Type": "application/json",
};

// Fetch User Data
export const fetchUserData = async (dataTablesInput) => {
  try {
    const response = await fetch(`${API_URL}/datatable`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(dataTablesInput),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    return await response.json(); // Return parsed JSON
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// Delete User
export const deleteUser = async (uuid) => {
  try {
    const response = await fetch(`${API_URL}/delete`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({ uuid }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }

    return await response.text(); // Return response as text
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// Insert User
export const insertUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/save`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Failed to insert user");
    }

    return await response.json(); // Return response as text
  } catch (error) {
    console.error("Error saving user:", error);
    throw error;
  }
};
// Send Mail
export const sendMail = async (mailData) => {
  try {
    const response = await fetch(`${API_URL}/sendmail`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(mailData),
    });
    if (!response.ok) {
      throw new Error("Failed to send mail");
    }

    return await response.text(); // Return parsed JSON (message or status)
  } catch (error) {
    console.error("Error sending mail:", error);
    throw error;
  }
};
// Login User
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Failed to login");
    }

    const data = await response.json();
    
    // ตรวจสอบว่า response มีข้อมูล uuid และ email หรือไม่
    if (data.uuid && data.email) {
      // เก็บข้อมูลใน sessionStorage
      sessionStorage.setItem("userUuid", data.uuid);
      sessionStorage.setItem("userEmail", data.email);
      sessionStorage.setItem("loginTime", Date.now()); // เก็บเวลาเข้าสู่ระบบ
      return data; // ส่งข้อมูลกลับไป
    } else {
      throw new Error("Invalid login response");
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};
// Check Email
export const checkMail = async (email) => {
  try {
    const response = await fetch(`${API_URL}/checkmail`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({ email }),
    });
    const responseText = await response.text();
    if (!response.ok) {
      throw new Error("Failed to check email");
    }

    if(responseText=="success") return true;
    else return false;
  } catch (error) {
    console.error("Error checking email:", error);
    throw error;
  }
};
// Set Password
export const setPassword = async (uuid, newPassword) => {
  try {
    const response = await fetch(`${API_URL}/changePWD`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({
        uuid,
        newPassword
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to change password");
    }

    const responseText = await response.text(); // Return response text (success or failure message)
    return responseText;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};
// Get User Data
export const getData = async (uuid) => {
  try {
    const response = await fetch(`${API_URL}/getData`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({ uuid }), // ส่ง uuid เป็นข้อมูลใน body
    });

    if (!response.ok) {
      throw new Error("Failed to get data");
    }

    const responseData = await response.json(); // รับข้อมูล JSON ที่ตอบกลับจากเซิร์ฟเวอร์
    return responseData; // ส่งข้อมูลที่ได้รับกลับมา
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};
