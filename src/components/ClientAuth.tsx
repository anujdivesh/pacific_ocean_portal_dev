"use client"; // Client-side rendering

// Libraries
import { useEffect } from "react";
import { useAppDispatch } from "@/app/GlobalRedux/hooks";
import { logout as logoutAction, login as loginAction, updateCountry, updateToken } from "@/app/GlobalRedux/Features/auth/authSlice";

export default function ClientAuth() {
  const dispatch = useAppDispatch();

  // Fetch session on component mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/session");
        const data = await response.json();
        if (data.isLoggedin) {
          dispatch(loginAction()); // Update Redux store
          dispatch(updateCountry(data.countryId));
          dispatch(updateToken(data.userId));
        } else {
          dispatch(logoutAction()); // Update Redux store
          dispatch(updateCountry(null));
          dispatch(updateToken(null));
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
        dispatch(logoutAction()); // Fallback to logout state
      }
    };

    fetchSession();
  }, [dispatch]);

  return null; // This component doesn't render anything
}