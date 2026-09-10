/**
 * Central URL helper to resolve frontend client URL and backend API URL
 * from environment variables with safe fallbacks.
 */

export const getClientUrl = () => {
  return (
    process.env.LIVE_WEBSITE_URL ||
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    "http://localhost:5173"
  ).replace(/\/+$/, "");
};

export const getApiUrl = () => {
  return (
    process.env.API_URL ||
    process.env.BACKEND_URL ||
    process.env.SERVER_URL ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");
};
