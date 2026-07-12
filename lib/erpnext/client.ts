import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_ERPNEXT_URL;

export interface ErpNextApiError {
  message: string;
  status: number;
  originalError?: any;
}

export async function erpFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cookieStore = await cookies();
  const sid = cookieStore.get("sid")?.value;
  
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  
  if (sid) {
    headers.set("Cookie", `sid=${sid}`);
  }

  // Ensure endpoint starts with a slash
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });

    // ERPNext sometimes returns 200 OK with an HTML error page or specific JSON error structure
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      
      if (!res.ok || data.exc) {
        throw {
          message: data.message || "An error occurred in ERPNext",
          status: res.status,
          originalError: data
        } as ErpNextApiError;
      }
      
      return data.message || data.data || data;
    }

    if (!res.ok) {
      throw {
        message: `HTTP Error: ${res.statusText}`,
        status: res.status,
      } as ErpNextApiError;
    }

    // For non-JSON responses (e.g. empty 200 OK on logout)
    return {} as T;

  } catch (error: any) {
    if (error.status) {
      throw error; // Already an ErpNextApiError
    }
    throw {
      message: error.message || "Network error",
      status: 500,
      originalError: error
    } as ErpNextApiError;
  }
}
