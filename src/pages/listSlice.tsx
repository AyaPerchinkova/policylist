export const cidrRegex =
  /^((25[0-5]|(2[0-4]|1\d|)\d)\.?\b){4}\/([0-9]|[1-2][0-9]|3[0-2])$/;

export enum ListStatus {
  idle = "idle",
  loading = "loading",
  failed = "failed",
  initial = "initial",
}

export interface PolicyList {
  username: string;
  id: string;
  name: string;
  ranges: string[];
  type: PolicyListType;
  region: string; // Add the region property
  size: number; // Add the size property
  createdAt: string;
  updatedAt: string;
}

export enum PolicyTypeFilter {
  All = "All",
  Block = "Block",
  Allow = "Allow",
  Restricted = "restricted",
}

export enum PolicyListType {
  Allow = "allow",
  Block = "block",
  restricted = "restricted",
}

export const fetchData = async (): Promise<PolicyList[]> => {
  const token = localStorage.getItem("token"); // Retrieve JWT token from localStorage
  if (!token) {
    throw new Error("No valid token found. Please log in.");
  }
  try {
    const response = await fetch(`/api/lists`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json", // Ensure proper content type
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
      },
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to fetch policy lists: ${errorMessage}`);
    }

    const data = await response.json();
    return data.map((list: PolicyList) => ({
      ...list,
      username: list.username || "unknown", // Default to "Unknown" if username is not provided
      ranges: list.ranges || [],
      size: (list.ranges || []).length, // Safely calculate the length of ranges
      region: list.region || "Unknown",
      updatedAt: list.updatedAt || "N/A",
    }));
  } catch (error) {
    console.error("Error fetching policy lists:", error);
    throw error;
  }
};

export const createPolicyList = async ( data: PolicyList) => {
  try {
    const token = localStorage.getItem("token"); // Retrieve JWT token from localStorage
    const username = localStorage.getItem("username"); // Retrieve username from localStorage

    if (!token) {
      throw new Error("No valid token found. Please log in.");
    }
    if (!username) {
      throw new Error("Username is missing. Cannot create policy list.");
    }

    data.username = username; // Set the username in the policy list
    console.log("Username from localStorage:", username); // Debugging
    console.log("Username :", data.username); // Debugging

    console.log("Creating policy list with payload:", data); // Debugging

    const response = await fetch(`/api/lists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
      },
      body: JSON.stringify(data), // Exclude the username from the request
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error("Backend error details:", errorDetails);
      throw new Error("Failed to create policy list");
    }

    return response;
  } catch (error) {
    console.error("Error creating policy list:", error);
    throw error;
  }
};
export const deleteList = async (listID: string) => {
  const token = localStorage.getItem("token"); // Retrieve the token from localStorage
  if (!token) {
    throw new Error("No valid token found. Please log in.");
  }

  try {
    console.log(`Sending DELETE request for list ID: ${listID}`); // Debugging

    const response = await fetch(`/api/lists/${listID}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`, // Include the token in the Authorization header
      },
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error("Backend error details:", errorDetails); // Log backend error details
      throw new Error(`Failed to delete policy list with ID ${listID}`);
    }

    console.log(`Successfully deleted policy list with ID: ${listID}`); // Debugging
    return response;
  } catch (error) {
    console.error("Error in deleteList function:", error);
    throw error;
  }
};

export const updateData = async (listID: string, data: PolicyList) => {
  const username = localStorage.getItem("username"); // Retrieve username from localStorage
  const token = localStorage.getItem("token"); // Retrieve the token from localStorage
  if (!token) {
    throw new Error("No valid token found. Please log in.");
  }

  if (!username) {
    throw new Error("Username is missing. Cannot update policy list.");
  }
  if (!listID) {
    throw new Error("List ID is missing. Cannot update policy list.");
  }
  try{
    console.log(`Sending PATCH request for list ID: ${listID}`); // Debugging
    console.log("Payload being sent:", data); // Debugging
    data.username = username; // Ensure the username is included in the updated policy

    const response = await fetch(`/api/lists/${listID}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Backend error details:", errorDetails); // Log backend error details
        throw new Error("Failed to update policy list");      
      }
      console.log(`Successfully updated policy list with ID: ${listID}`); // Debugging
      return response;
  }catch (error) {
    console.error("Error in updateData function:", error);
    throw error;
  }
};

export const loginUser = async (username: string, password: string): Promise<{ username: string; email: string }> => {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });


  console.log("Response status:", response.status); // Log the status code
  console.log("Response headers:", response.headers); // Log the headers

  if (!response.ok) {
    const error = await response.json();
    console.error("Login failed:", error.message);
    throw new Error(error.message || "Login failed");
  }

  const data = await response.json();
  console.log("Login response:", data); // Log the response for debugging

 const token = data.token; // Extract the token
  if (!token) {
    throw new Error("Token not found in response");
  }
  localStorage.setItem("token", data.token); // Store the token in localStorage
  localStorage.setItem("token", token); // Store the token in localStorage
 localStorage.setItem("email", data.email);

  localStorage.setItem("username", data.username); // Optionally store the username
  console.log("Backend response:", data);
  console.log("Token received:", data.token); // Log the token for debugging
  console.log("Login successful, token:", data.token); // Log the successful login
  console.log("Username received:", data.username); // Log the username for debugging
    // Fallback for missing email
    const email = data.email || "Email not provided";
  console.log("Email received:", email); // Log the email

  return { username: data.username, email: data.email };
};

export const registerUser = async (
  username: string,
  password: string,
  confirmPassword: string,
  email: string
): Promise<{ username: string; email: string }> => {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password, confirmPassword, email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  const data = await response.json();
  console.log("Registration response:", data); // Debugging

  // Store the username and email in localStorage
  localStorage.setItem("username", data.username);
  localStorage.setItem("email", data.email);
  // Return the user data from the backend response
  return data;
};