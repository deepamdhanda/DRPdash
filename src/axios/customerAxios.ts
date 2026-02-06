import axios from "axios";
import _ from "lodash";
import { drpCrmBaseUrl } from "./urls";
import { useUserStore } from "../store/useUserStore";

const Axios = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
Axios.interceptors.request.use(
  (config) => {
    config.withCredentials = true;

    return config;
  },
  (error) => Promise.reject(error)
);

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
          `${drpCrmBaseUrl}/customers/auth/logout`,
          {},
          { withCredentials: true }
        );
      } catch (logoutErr) {
        console.log("Logout API failed:", logoutErr);
      }
      const path = window.location.pathname;
      window.location.href = `/customer/login?path=${path}`;
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

export const customerAxios = Axios;
