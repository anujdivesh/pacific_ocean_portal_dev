"use server";

import { z } from "zod";
import { createSession, deleteSession } from "@/app/lib/session";
import { get_url } from '@/components/json/urls';

// Define the login form schema
const loginSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }).trim(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).trim(),
});

// Define a more specific type for prevState
interface PrevState {
  errors?: {
    username?: string[];
    password?: string[];
  };
  success?: boolean;
  message?: string; // Add a message field for API errors
}

export async function login(prevState: PrevState, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  // Validate form data
  const result = loginSchema.safeParse({ username, password });

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    // Send credentials to the external API
    const apiResponse = await fetch(get_url('root-path')+"/middleware/api/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    // Handle API response
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      return {
        errors: {
          username: [errorData.detail || "Invalid credentials"], // Use API error message if available
        },
        message: errorData.detail || "Login failed", // Add a generic message
      };
    }

    const { access } = await apiResponse.json();
    
    // Fetch the user's account details using the access token
    const accountResponse = await fetch(get_url('root-path')+"/middleware/api/account/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });

    if (!accountResponse.ok) {
      const errorData = await accountResponse.json();
      return {
        errors: {
          username: [errorData.detail || "Failed to fetch account details"],
        },
        message: errorData.detail || "Failed to fetch account details",
      };
    }
    const accountData = await accountResponse.json();
    //const countryId = accountData.country;
    let country_idx = "";

    if (Array.isArray(accountData) && accountData.length > 0) {
      // Find the account object that matches the username
      const userObj = accountData.find(acc => acc.user.email === username);
    
      if (userObj) {
        country_idx = userObj.country.id;
      }
    
      // Store the countryId and access token in the session
      await createSession(country_idx, access);
    }
    
/*
    if (Array.isArray(accountData) && accountData.length > 0) {
      // Extract the country_id from the first element
       countryId = accountData[0].country.id;
    //  console.log("Country ID:", countryId);
    
      // Store the countryId and access token in the session
      await createSession(countryId, access);
    }
    */


    // Extract the access token from the API response
    //const { access } = await apiResponse.json();

    // Store the access token in a session or cookie
    //await createSession(JSON.stringify({ countryId,access })); 
    //await createSession(access); // Pass the access token to createSession
//    await createSession("hello", access);
    // Return a success flag to update Redux state on the client
    return { success: true,countryId:country_idx,token:access };
  } catch (error) {
    console.error("API request failed:", error);
    return {
      errors: {
        username: ["An error occurred while logging in"],
      },
      message: "An error occurred while logging in",
    };
  }
}

export async function logout() {
  await deleteSession();

  // Return a success flag to update Redux state on the client
  return { success: true };
}