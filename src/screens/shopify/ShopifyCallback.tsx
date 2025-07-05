// src/screens/shopify/ShopifyCallback.tsx
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export const ShopifyCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const shop = searchParams.get("shop");
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const jwt = localStorage.getItem("authToken");

    if (!shop || !code || !jwt) return;

    fetch("https://your-backend.com/api/shopify/callback", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ shop, code, state }),
    })
      .then((res) => res.json())
      .then(() => {
        navigate("/dashboard/channel_accounts");
      })
      .catch((err) => {
        console.error("OAuth failed:", err);
        alert("Failed to connect Shopify store.");
      });
  }, []);

  return <p>Connecting store...</p>;
};
