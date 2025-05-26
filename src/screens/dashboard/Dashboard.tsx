import React from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { Card } from "react-bootstrap";

export const Dashboard: React.FC = () => {
  const username = Cookies.get("username") || "User";

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto", backgroundColor: "#FFFFFF" }}>
      <h2 style={{ color: "#000434", marginBottom: "0.25rem" }}>
        Welcome back, {username} 👋
      </h2>
      <p style={{ fontSize: "16px", color: "#555" }}>
        Your control panel for managing orders, inventory, finances, and fulfillment.
      </p>

      <section style={{ marginTop: "2.5rem" }}>
        <h3 style={{ color: "#F5891E", marginBottom: "1rem" }}>📊 Business Overview</h3>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          {["Total Orders", "Wallet Balance", "Pending NDRs"].map((label) => (
            <div key={label} style={cardStyle}>
              <h4 style={{ fontSize: "16px", marginBottom: "0.5rem", color: "#000434" }}>{label}</h4>
              <p style={{ fontSize: "20px", fontWeight: 600, color: "#F5891E" }}>--</p>
            </div>
          ))}
        </div>
      </section>

      <Card style={{ marginTop: "3rem", padding: "30px" }}>
        <h3 style={{ color: "#F5891E", marginBottom: "1rem" }}>🚀 Getting Started Guide</h3>
        <ol style={{ paddingLeft: "1.25rem", fontSize: "16px", lineHeight: "1.9", color: "#000434" }}>
          <li><Link to="/dashboard/pools" style={linkStyle}><strong>Create a Pool</strong></Link> – Define dispatch hubs to manage order flow and allocation.</li>
          <li><Link to="/dashboard/channel_accounts" style={linkStyle}><strong>Add Channel Accounts</strong></Link> – Connect marketplaces like Amazon, Flipkart, etc.</li>
          <li><Link to="/dashboard/Warehouses" style={linkStyle}><strong>Set Up Warehouses</strong></Link> – Register storage locations for inventory tracking.</li>
          <li><Link to="/dashboard/ProductPacks" style={linkStyle}><strong>Configure Packages</strong></Link> – Setup packaging info for accurate courier selection.</li>
          <li><Link to="/dashboard/Products" style={linkStyle}><strong>Create Products</strong></Link> – Add your catalog with detailed product info.</li>
          <li><Link to="/dashboard/ProductSKU" style={linkStyle}><strong>Define Product SKUs</strong></Link> – Assign unique SKUs for each variant.</li>
          <li><Link to="/dashboard/ChannelSKU" style={linkStyle}><strong>Link SKUs to Channels</strong></Link> – Map internal SKUs to external listings.</li>
          <li><Link to="/dashboard/orders" style={linkStyle}><strong>Monitor Incoming Orders</strong></Link> – View real-time orders across platforms.</li>
          <li><Link to="/dashboard/Wallet" style={linkStyle}><strong>Recharge Your Wallet</strong></Link> – Maintain balance for seamless courier bookings.</li>
          <li><Link to="/dashboard/orders" style={linkStyle}><strong>Enhance Orders with AI</strong></Link> – Enrich order details using AI-driven content.</li>
          <li><Link to="/dashboard/orders" style={linkStyle}><strong>Track Deliveries</strong></Link> – Monitor fulfillment progress end-to-end.</li>
          <li><Link to="/dashboard/NDR" style={linkStyle}><strong>Manage NDR Effortlessly</strong></Link> – Handle non-delivery cases quickly and clearly.</li>
        </ol>
      </Card>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  flex: "1 1 200px",
  padding: "1rem",
  borderRadius: "10px",
  backgroundColor: "#FFFFFF",
  border: "1px solid #F5891E",
  boxShadow: "0 1px 4px rgba(0, 4, 52, 0.1)",
  textAlign: "center",
  minWidth: "200px",
};

const linkStyle: React.CSSProperties = {
  color: "#F5891E",
  textDecoration: "none",
};

