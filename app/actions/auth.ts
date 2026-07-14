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

    if (!res.ok || (data.message !== "Logged In" && data.message !== "No App")) {
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
    const ADMIN_TOKEN = process.env.ERPNEXT_ADMIN_TOKEN || "token 1495f539fda7d5a:8fd489ef0afcf1d";
    // Fetch using Admin Token to ensure we can read user_type and roles, which are restricted for normal users
    const userDocRes = await fetch(`${process.env.NEXT_PUBLIC_ERPNEXT_URL}/api/resource/User/${email}`, {
      headers: {
        "Accept": "application/json",
        "Authorization": ADMIN_TOKEN
      }
    });

    let restaurantName = "";
    let userFullName = "";
    let isMerchantRole = false;
    if (userDocRes.ok) {
      const userData = await userDocRes.json();
      const userType = userData.data?.user_type;
      userFullName = userData.data?.full_name || "";
      // Assuming the app developer adds a custom link field 'restaurant' to the User doctype
      restaurantName = userData.data?.restaurant || "";
      
      // Check if they have the Merchant role explicitly
      const hasMerchantRole = userData.data?.roles?.some((r: any) => r.role === "Merchant");
      isMerchantRole = hasMerchantRole;

      // If they are a System User, or they have a restaurant linked, or they have the Merchant role
      const isMerchant = userType === "System User" || !!restaurantName || hasMerchantRole;
      if (!isMerchant) {
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

    if (restaurantName) {
      cookieStore.set("restaurant_name", restaurantName, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 3,
      });
    }

    cookieStore.set("user_full_name", userFullName || data.full_name || "User", {
      httpOnly: false, // Accessible to client if needed, or we can read it on server
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 3,
    });
    
    cookieStore.set("user_role", isMerchantRole ? "Merchant" : "Owner", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 3,
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
    cookieStore.delete("restaurant_name");
    redirect("/login");
  }
}

export async function registerMerchant(prevState: any, formData: FormData) {
  const restaurantName = formData.get("restaurant_name") as string;
  const fullName = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const fields = { restaurant_name: restaurantName, full_name: fullName, email };

  if (!restaurantName || !fullName || !email || !password) {
    return { error: "All fields are required", fields };
  }

  const ADMIN_TOKEN = process.env.ERPNEXT_ADMIN_TOKEN || "token 1495f539fda7d5a:8fd489ef0afcf1d";
  const BASE_URL = process.env.NEXT_PUBLIC_ERPNEXT_URL || "http://104.248.237.122";

  try {
    // 1. Create User
    const userRes = await fetch(`${BASE_URL}/api/resource/User`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": ADMIN_TOKEN,
      },
      body: JSON.stringify({
        email: email,
        first_name: fullName,
        new_password: password,
        enabled: 1,
        send_welcome_email: 0,
        user_type: "System User",
        roles: [{ role: "Merchant" }]
      }),
    });

    const userData = await userRes.json();
    if (!userRes.ok) {
      console.error("User Creation Failed:", JSON.stringify(userData, null, 2));
      let errorMessage = userData.exc_type || "Failed to create user account";
      if (userData._server_messages) {
        try {
          const messages = JSON.parse(userData._server_messages);
          if (messages.length > 0) {
            const msgObj = JSON.parse(messages[0]);
            errorMessage = msgObj.message || errorMessage;
          }
        } catch (e) {}
      } else if (userData.exception) {
        const exLines = String(userData.exception).split("\n");
        errorMessage = exLines[exLines.length - 2] || errorMessage;
      }
      
      // Strip HTML tags from the error message (e.g. <div>...</div>)
      errorMessage = errorMessage.replace(/<[^>]*>?/gm, '');
      
      return { error: `Registration failed: ${errorMessage}`, fields };
    }



    // 3. Create Restaurant Record
    const restRes = await fetch(`${BASE_URL}/api/resource/Restaurant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": ADMIN_TOKEN,
      },
      body: JSON.stringify({
        restaurant_name: restaurantName,
        cuisine: "General",
        status: "Open",
        phone: "Update in Settings",
        address: "Update in Settings"
      }),
    });

    const restData = await restRes.json();
    const createdRestaurantName = restData.data?.name || restaurantName;

    // 4. Update User with Restaurant Link
    await fetch(`${BASE_URL}/api/resource/User/${email}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": ADMIN_TOKEN,
      },
      body: JSON.stringify({
        restaurant: createdRestaurantName
      }),
    });

    // 5. Automatically log them in
    return await login(null, formData);

  } catch (error: any) {
    console.error("Registration Error:", error);
    return { error: "An unexpected error occurred during registration", fields };
  }
}
