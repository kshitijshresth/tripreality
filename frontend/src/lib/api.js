import axios from "axios";

// Use environment variable when available (set at build time). Fallback to
// the deployed Render backend URL.
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://tripreality.onrender.com";
export const API = `${BACKEND_URL.replace(/\/$/, "")}/api`;

export const api = axios.create({ baseURL: API, timeout: 180000 });

export const queryDestination = (payload) => api.post("/query", payload).then(r => r.data);
export const chatFollowup = (payload) => api.post("/chat", payload).then(r => r.data);
export const getFeaturedCities = () => api.get("/featured-cities").then(r => r.data);
