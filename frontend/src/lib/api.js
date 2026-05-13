import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API, timeout: 180000 });

export const queryDestination = (payload) => api.post("/query", payload).then(r => r.data);
export const chatFollowup = (payload) => api.post("/chat", payload).then(r => r.data);
export const getFeaturedCities = () => api.get("/featured-cities").then(r => r.data);
export const downloadSourceUrl = () => `${API}/download-source`;
