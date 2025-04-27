export const drpCrmBaseUrl =
  import.meta.env.VITE_NODE_ENV === "dev"
    ? "http://localhost:5001"
    : "http://13.48.1.199:5001";
