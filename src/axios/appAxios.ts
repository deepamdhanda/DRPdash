import axios from "axios";
import Cookies from "js-cookie";
import _ from "lodash";
import { drpCrmBaseUrl } from "./urls";
import { useUserStore } from "../store/useUserStore";

const Axios = axios.create({
  withCredentials: true, // 🔥 Added globally
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
Axios.interceptors.request.use(
  (config) => {
    // Always send credentials
    config.withCredentials = true;

    // If you still want to attach non-httpOnly cookie token
    const authToken = Cookies.get("authToken");
    if (authToken) {
      config.headers["Authorization"] = `Bearer ${authToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
Axios.interceptors.response.use(
  (res) => res,

  async (error) => {
    const status = error?.response?.status;
    const reset = useUserStore.getState().reset;
    if (status === 401) {
      console.log("Unauthorized");

      try {
        reset();
        await axios.post(
          `${drpCrmBaseUrl}/api/auth/logout`,
          {},
          { withCredentials: true }
        );
      } catch (logoutErr) {
        console.log("Logout API failed:", logoutErr);
      }

      // Redirect user to login
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (status === 403) {
      console.log("Forbidden");
    }

    // Standardize error
    let errorMessage =
      error?.response?.data?.message ||
      "Something went wrong, please try again later.";

    _.set(error, "response.data", {
      result: null,
      error: error.response?.data?.error || null,
      success: false,
      errorMessage,
    });
    _.set(error, "message", errorMessage);

    return Promise.reject(error);
  }
);

export const appAxios = Axios;
