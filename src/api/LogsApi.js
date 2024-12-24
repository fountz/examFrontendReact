const API_URL = "http://localhost:8701/apis/logs";

const defaultHeaders = {
  "Content-Type": "application/json",
};

// Fetch Logs Data
export const fetchLogsData = async (dataTablesInput) => {
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

// Insert Logs
export const insertLogs = async (logsData) => {
  try {
    const response = await fetch(`${API_URL}/save`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(logsData),
    });

    if (!response.ok) {
      throw new Error("Failed to insert logs");
    }

    return await response.json(); // Return response as text
  } catch (error) {
    console.error("Error saving logs:", error);
    throw error;
  }
};