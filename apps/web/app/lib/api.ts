import axios from "axios";
import { supabase } from "./supabase";
import { getAuthAccessToken } from "./auth-session";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL,
});

api.interceptors.request.use(
  async (config) => {
    const accessToken = getAuthAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      return config;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
  }
);

export default api;