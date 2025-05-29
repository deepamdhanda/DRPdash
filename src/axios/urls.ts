export const drpCrmBaseUrl =
  import.meta.env.VITE_NODE_ENV !== "dev"
    ? "http://localhost:5001"
    : "http://api.orderzup.com";
