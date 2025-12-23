import React, { useState } from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import { FaCheck } from "react-icons/fa";

interface Step {
  key: string;
  label: string;
  helper: string;
  content: React.ReactNode;
}

const GetStarted: React.FC = () => {
  const [activeStep, setActiveStep] = useState<string>("brand");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const handleNext = (key: string) => {
    if (!completedSteps.includes(key)) setCompletedSteps([...completedSteps, key]);
    const currentIndex = steps.findIndex((s) => s.key === key);
    if (currentIndex < steps.length - 1) setActiveStep(steps[currentIndex + 1].key);
  };

  const steps: Step[] = [
    {
      key: "brand",
      label: "Brand Setup",
      helper: "Basic business details",
      content: (
        <div>
          <h4>Brand Setup</h4>
          <p>Provide your company details, GST, and branding info to get started.</p>
          <Button onClick={() => handleNext("brand")} style={btnStyle}>
            Complete Step
          </Button>
        </div>
      ),
    },
    {
      key: "logistics",
      label: "Logistics",
      helper: "Warehouses & Pools",
      content: (
        <div>
          <h4>Logistics Setup</h4>
          <p>Define your warehouses and pools for order routing and dispatch.</p>
          <Button onClick={() => handleNext("logistics")} style={btnStyle}>
            Complete Step
          </Button>
        </div>
      ),
    },
    {
      key: "products",
      label: "Products",
      helper: "SKUs & Inventory",
      content: (
        <div>
          <h4>Product Setup</h4>
          <p>Add products, SKUs, and packaging information for accurate fulfillment.</p>
          <Button onClick={() => handleNext("products")} style={btnStyle}>
            Complete Step
          </Button>
        </div>
      ),
    },
    {
      key: "channels",
      label: "Sales Channels",
      helper: "Order sources",
      content: (
        <div>
          <h4>Sales Channels</h4>
          <p>Connect your marketplaces and map SKUs for smooth order import.</p>
          <Button onClick={() => handleNext("channels")} style={btnStyle}>
            Complete Step
          </Button>
        </div>
      ),
    },
    {
      key: "automation",
      label: "Automation",
      helper: "Rules & workflows",
      content: (
        <div>
          <h4>Automation</h4>
          <p>Enable auto-confirmation, best courier selection, shipping, and pickups.</p>
          <Button onClick={() => handleNext("automation")} style={btnStyle}>
            Complete Step
          </Button>
        </div>
      ),
    },
    {
      key: "wallet",
      label: "Wallet & Billing",
      helper: "Payments & billing",
      content: (
        <div>
          <h4>Wallet & Billing</h4>
          <p>Setup your wallet, recharge options, and billing preferences.</p>
          <Button onClick={() => handleNext("wallet")} style={btnStyle}>
            Complete Step
          </Button>
        </div>
      ),
    },
    {
      key: "goLive",
      label: "Go Live",
      helper: "Final checks",
      content: (
        <div>
          <h4>Go Live 🚀</h4>
          <p>Test orders, review checklist, and launch your store operations.</p>
          <Button onClick={() => handleNext("goLive")} style={btnStyle}>
            Complete Step
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f8f9fa" }}>
      <h2 style={{ color: "#000434", marginBottom: "1rem" }}>Welcome to Your Dashboard</h2>
      <Row>
        <Col md={3}>
          <div style={sidebarStyle}>
            {steps.map((step, index) => (
              <div
                key={step.key}
                onClick={() => setActiveStep(step.key)}
                style={{
                  ...tabItemStyle,
                  ...(activeStep === step.key ? activeTabStyle : {}),
                  ...(completedSteps.includes(step.key) ? completedTabStyle : {}),
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>
                    {index + 1}. {step.label}
                  </span>
                  {completedSteps.includes(step.key) && <FaCheck color="#F5891E" />}
                </div>
                <small style={{ opacity: 0.7 }}>{step.helper}</small>
              </div>
            ))}
          </div>
        </Col>
        <Col md={9}>
          <Card style={contentCardStyle}>{steps.find((s) => s.key === activeStep)?.content}</Card>
        </Col>
      </Row>
    </div>
  );
};

const sidebarStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 12,
  border: "1px solid #eee",
};

const tabItemStyle: React.CSSProperties = {
  padding: "12px 14px",
  cursor: "pointer",
  borderRadius: 8,
  marginBottom: 6,
  transition: "all 0.2s",
};

const activeTabStyle: React.CSSProperties = {
  background: "rgba(245,137,30,0.08)",
  borderLeft: "4px solid #F5891E",
};

const completedTabStyle: React.CSSProperties = {
  opacity: 0.8,
};

const contentCardStyle: React.CSSProperties = {
  minHeight: 400,
  padding: "2rem",
  borderRadius: 16,
  boxShadow: "0 6px 20px rgba(0,4,52,0.08)",
};

const btnStyle: React.CSSProperties = {
  backgroundColor: "#F5891E",
  border: "none",
  color: "#fff",
  marginTop: "1rem",
};

export default GetStarted;
