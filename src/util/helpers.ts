//import { Entry } from "../pages/detailSlice";
import { BACKEND, API_SUBDOMAIN as apiSubdomain, getAbsoluteRoute, UI_SUBDOMAIN as uiSubdomain } from "./Routes";

export const localizedDate = (dateString: string) => {
  const date = new Date(dateString);
  const dateFormatter = new Intl.DateTimeFormat("en-EN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Detects user's local time zone
  });

  return dateFormatter.format(date);
};

export const parseAPIHost = (url: string) => {
  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]*?)\.([a-zA-Z0-9-]*?)\.(.*)$/;
  const matchPattern = url.match(urlPattern);
  if (!matchPattern) {
    return url;
  }

  const [, protocol, , secondSubdomain, rest] = matchPattern;
  if (secondSubdomain === uiSubdomain) {
    return `${protocol || "https://"}${apiSubdomain}.${rest}`;
  }
  return `${protocol || "https://"}${secondSubdomain}.${rest}`;
};

const csrfTokenHeader = "x-csrf-token";
export const getCsrfToken = async () => {
  const headers: any = {};
  headers[csrfTokenHeader] = "fetch";
  const response: Response = await wrapFetch(getAbsoluteRoute(`${BACKEND.DATASOURCES}`), {
    headers,
  });
  if (response.ok) {
    if (!response.headers.get(csrfTokenHeader)) console.error("Error: No csrf token returned.");
    return response.headers.get(csrfTokenHeader);
  } else {
    console.error("Error: While fetching a CSRF token.");
    return "";
  }
};

export const getHeaders = async () => {
  let headers: any = { "Content-Type": "application/json" };
  headers[csrfTokenHeader] = await getCsrfToken()!;
  return headers;
};


export const wrapResponse = async (resp: Response, rejectWithValue: Function) => {
  if (!resp.ok) return rejectWithValue(`${resp.status} - ${resp.statusText}: ${await resp.text()}`);

  if (resp.headers?.get("content-type")?.includes("text/html")) {
    return rejectWithValue("Your session timed out. Please refresh the page.");
  } else {
    return await resp.json();
  }
};

export const wrapFetch = async (input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response> => {
  window.dispatchEvent(new Event("fetch"));
  return fetch(input, init);
};

export const getMessageFromResponse = async (response: Response) => {
  if (response.headers?.get("content-type")?.includes("application/json")) {
    const responseJson = await response.json();
    return responseJson.error.message;
  }
  return await response.text();
};

export const handleUnauthorized = (error: Error) => {
  console.error("Unauthorized error:", error.message);

  if (error.message.includes("401") || error.message === "Failed to fetch") {
    localStorage.removeItem("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDM3MDc4MTUsInVzZXJuYW1lIjoiMSJ9.BTWz44OXP007WrHAQarXS22Rs02QbeOvmkmOJjSjxpo"); // Clear the token
    window.location.href = "/login"; // Redirect to the login page
  }
};