import axios from "axios";
import Cookies from "js-cookie";
import _ from "lodash";
import { drpCrmBaseUrl } from "./urls";

// Create Axios instance with base URL and content-type headers
const Axios = axios.create({
  baseURL: drpCrmBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
Axios.interceptors.request.use(
  (config) => {
    // Retrieve the token from cookies
    const authToken = Cookies.get("authToken");

    if (authToken) {
      // Set the Authorization header if the token exists
      config.headers["Authorization"] = `Bearer ${authToken}`;
    }

    return config;
  },
  (error) => {
    // Reject the promise if there's a request error
    return Promise.reject(error);
  }
);

// Response Interceptor
Axios.interceptors.response.use(
  (res) => {
    return res;
  },
  (error) => {
    let errorMessage = "Something went wrong, please try again later.";

    if (error?.response?.status === 500) {
      errorMessage =
        "Please check your internet connection, and try again later.";
    }
    if (error?.response?.status === 401) {
      console.log("gettinnnn");
      errorMessage = "Login Failed.";
      window.location.href = "/login";
    }

    if (error?.response?.data?.errorMessage) {
      errorMessage = error.response.data.errorMessage;
    }

    // Set custom error structure in the error response
    _.set(error, "response.data", {
      result: null,
      error: error.response?.data?.error || null,
      success: false,
      errorMessage,
    });

    return Promise.reject(error); // Reject the error
  }
);

// Export Axios instance for use in other files
export const appAxios = Axios;
