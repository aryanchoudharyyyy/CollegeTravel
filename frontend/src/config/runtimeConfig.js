// const isProduction = import.meta.env.PROD;

// const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
// export const API_BASE_URL = configuredApiBaseUrl || (isProduction ? "" : "http://localhost:8080");

// if (!API_BASE_URL) {
//     throw new Error("VITE_API_BASE_URL must be set for production builds.");
// }

// if (isProduction) {
//     const apiUrl = new URL(API_BASE_URL);
//     if (apiUrl.protocol !== "https:" || apiUrl.pathname !== "/" || apiUrl.search || apiUrl.hash) {
//         throw new Error("VITE_API_BASE_URL must be an HTTPS origin without a path in production.");
//     }
// }

// const configuredWebSocketUrl = import.meta.env.VITE_WS_URL?.trim();
// export const WEBSOCKET_URL = configuredWebSocketUrl || (isProduction ? "" : "ws://localhost:8080/api/chat/ws");

// if (!WEBSOCKET_URL) {
//     throw new Error("VITE_WS_URL must be set for production builds.");
// }

// if (isProduction) {
//     const websocketUrl = new URL(WEBSOCKET_URL);
//     if (websocketUrl.protocol !== "wss:" || websocketUrl.pathname !== "/api/chat/ws" || websocketUrl.search || websocketUrl.hash) {
//         throw new Error("VITE_WS_URL must use wss:// and end with /api/chat/ws in production.");
//     }
// }

const isProduction = import.meta.env.PROD;

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL =
  configuredApiBaseUrl || "http://localhost:8080";

const configuredWebSocketUrl = import.meta.env.VITE_WS_URL?.trim();

export const WEBSOCKET_URL =
  configuredWebSocketUrl || "ws://localhost:8080/api/chat/ws";
