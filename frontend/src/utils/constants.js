// Backend API URL (Render)
// Determine a sensible default API URL:
// - If `REACT_APP_API_URL` is provided at build/runtime, use it.
// - If running on Vercel (frontend hosted on vercel.app), use the relative `/api` path so serverless functions are called.
// - Otherwise default to a local backend for development.
export const API_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== "undefined" && window.location.hostname.includes("vercel.app")
    ? "/api"
    : "https://dbms-agri.onrender.com/api");

// Default map location
export const DEFAULT_MAP_CENTER = [28.7041, 77.1025];
export const DEFAULT_MAP_ZOOM = 10;

// Image base URL
export const IMAGE_BASE_URL =
  process.env.REACT_APP_IMAGE_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname.includes("vercel.app")
    ? "https://dbms-agri.onrender.com"
    : "https://dbms-agri.onrender.com");

// App configuration
export const APP_NAME = "Kisan Sewa Kendra";
export const APP_DESCRIPTION = "Intelligent Agricultural Advisor & E-Store";
