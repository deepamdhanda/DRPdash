// src/screens/shopify/ShopifyAuthRedirect.tsx
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const ShopifyAuthRedirect = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const shop = searchParams.get("shop");

    if (!shop) {
      alert("Missing shop parameter");
      return;
    }

    const scopes = [
      "read_orders",
      "write_orders",
      "read_products",
      "write_products",
      "read_customers",
    ].join(",");

    const clientId = import.meta.env.VITE_SHOPIFY_API_KEY; // from .env
    const redirectUri = encodeURIComponent(
      `${window.location.origin}/dashboard/channel_accounts`
    );

    const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`;

    window.location.href = authUrl;
  }, [searchParams]);

  return <p>Redirecting to Shopify...</p>;
};
