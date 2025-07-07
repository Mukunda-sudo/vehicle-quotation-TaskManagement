

const BASE_URL  = "https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec"; 



const apiRequest = async (body) => {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok. Status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Request failed');
    }

    return result;
  } catch (error) {
    console.error('API request error:', error);
    throw new Error(`Error: ${error.message}`);
  }
};

// Function to signup a user
export const signupUser = async (userData) => {
  return apiRequest({ action: "signup", ...userData });
};

// Function to login a user
export const loginUser = async (email, password) => {
  return apiRequest({ action: "login", email, password });
};

// Function to fetch tasks for a user based on their unique ID
export const fetchTasks = async (userId) => {
  // Ensure userId is passed in the body
  if (!userId) {
    throw new Error("User ID is required");
  }
  const result = await apiRequest({ action: "fetchTasks", userId });
  return result.data || [];
};
