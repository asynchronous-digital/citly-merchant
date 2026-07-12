"use server";

import { cookies } from "next/headers";
import { erpFetch, ErpNextApiError } from "@/lib/erpnext/client";
import { redirect } from "next/navigation";

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_ERPNEXT_URL}/api/method/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ usr: email, pwd: password }),
    });

    const data = await res.json();

    if (!res.ok || data.message !== "Logged In") {
      return { error: data.message || "Invalid credentials" };
    }

    // Extract the sid from the Set-Cookie header
    const setCookieHeader = res.headers.get("set-cookie");
    let sid = "";
    if (setCookieHeader) {
      const sidMatch = setCookieHeader.match(/sid=([^;]+)/);
      if (sidMatch && sidMatch[1]) {
        sid = sidMatch[1];
      }
    }

    if (!sid) {
      return { error: "Failed to establish session cookie from server." };
    }

    // Role Verification: Check if user is a Merchant/System User
    // First get the logged in user email (just to be safe, though we have 'email')
    const userDocRes = await fetch(`${process.env.NEXT_PUBLIC_ERPNEXT_URL}/api/resource/User/${email}`, {
      headers: {
        "Accept": "application/json",
        "Cookie": `sid=${sid}`
      }
    });

    if (userDocRes.ok) {
      const userData = await userDocRes.json();
      const userType = userData.data?.user_type;
      
      // Regular customers are "Website User". Merchants/Staff are "System User"
      if (userType !== "System User") {
        // Destroy the session on the backend since they aren't authorized for this portal
        await fetch(`${process.env.NEXT_PUBLIC_ERPNEXT_URL}/api/method/logout`, {
          method: "POST",
          headers: { "Cookie": `sid=${sid}` }
        });
        return { error: "Unauthorized: Only restaurant staff/merchants can access this dashboard." };
      }
    } else {
       // If they don't have permission to read the User doctype, they likely aren't a system user anyway.
       return { error: "Unauthorized: Insufficient permissions to access dashboard." };
    }

    // Store in Next.js cookies if authorized
    const cookieStore = await cookies();
    cookieStore.set("sid", sid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 3, // 3 days
    });

  } catch (error: any) {
    console.error("Login Error:", error);
    return { error: "An unexpected error occurred connecting to the server" };
  }

  redirect("/dashboard");
}

export async function logout() {
  try {
    await erpFetch("/api/method/logout", {
      method: "POST",
    });
  } catch (error) {
    console.error("Logout failed on server:", error);
  } finally {
    const cookieStore = await cookies();
    cookieStore.delete("sid");
    redirect("/login");
  }
}
