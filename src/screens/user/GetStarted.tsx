import React, { useEffect, useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { FaCheck } from "react-icons/fa";
import { Stat, useStatsStore } from "../../store/useStatsStore";
import MakePool from "../../components/get-started/MakePool";
import MakeWarehouse from "../../components/get-started/MakeWarehouse";
import MakeChannelAccount from "../../components/get-started/MakeChannelAccount";

interface Step {
  key: string;
  label: string;
  helper: string;
  content: React.ReactNode;
}

const GetStarted: React.FC = () => {
  const [activeStep, setActiveStep] = useState<string>("pools");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  //   const handleNext = (key: string) => {
  //     if (!completedSteps.includes(key))
  //       setCompletedSteps([...completedSteps, key]);
  //     const currentIndex = stepOrder.findIndex((s) => s.key === key);
  //     if (currentIndex < stepOrder.length - 1)
  //       setActiveStep(stepOrder[currentIndex + 1].key);
  //   }; Send as props
  const { stats } = useStatsStore();

  useEffect(() => {
    if (!stats || stats.length === 0) return;

    const completed = new Set<string>();

    stats.forEach((stat: Stat) => {
      const key = stat.label.split(" ")[1]?.toLowerCase();

      if (
        (key === "pools" || key === "warehouses" || key === "channel") &&
        Number(stat.count) > 0
      ) {
        completed.add(key);
      }
    });

    const completedArray = Array.from(completed);
    setCompletedSteps(completedArray);

    // find next incomplete step
    const nextStep =
      stepOrder.find((step) => !completed.has(step.key)) ??
      stepOrder[stepOrder.length - 1];

    setActiveStep(nextStep.key);
  }, [stats]);

  const stepOrder: Step[] = [
    {
      key: "pools",
      label: "Pool Setup",
      helper: "Basic Business details",
      content: <MakePool />,
    },
    {
      key: "warehouses",
      label: "Warehouse",
      helper: "Warehouse information.",
      content: <MakeWarehouse />,
    },
    {
      key: "channel",
      label: "Create Channel Account",
      helper: "Your ecommerce sales channel.",
      content: <MakeChannelAccount />,
    },
    {
      key: "final",
      label: "Final Step",
      helper: "Final Step",
      content: (
        <div>
          <h4>Congratulations</h4>
          <p>Congratulations on completing your task.</p>
        </div>
      ),
    },
  ];

  //   const handleClick = (key: string) => {
  //     const exits = completedSteps.find((key) => key);
  //     if (!exits) {
  //       setActiveStep(key);
  //     }
  //   }; Uncomment on prod

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f8f9fa" }}>
      <h2 style={{ color: "#000434", marginBottom: "1rem" }}>
        Welcome to Your Dashboard
      </h2>
      <Row>
        <Col md={3}>
          <div style={sidebarStyle}>
            {stepOrder.map((step, index) => (
              <div
                key={step.key}
                // onClick={() => handleClick(step.key)} uncomment on prod
                onClick={() => setActiveStep(step.key)} //comment on prod
                style={{
                  ...tabItemStyle,
                  ...(activeStep === step.key ? activeTabStyle : {}),
                  ...(completedSteps.includes(step.key)
                    ? completedTabStyle
                    : {}),
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>
                    {index + 1}. {step.label}
                  </span>
                  {completedSteps.includes(step.key) && (
                    <FaCheck color="#F5891E" />
                  )}
                </div>
                <small style={{ opacity: 0.7 }}>{step.helper}</small>
              </div>
            ))}
          </div>
        </Col>
        <Col md={9}>
          <Card style={contentCardStyle}>
            {stepOrder.find((s) => s.key === activeStep)?.content}
          </Card>
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

// const btnStyle: React.CSSProperties = {
//   backgroundColor: "#F5891E",
//   border: "none",
//   color: "#fff",
//   marginTop: "1rem",
// };

export default GetStarted;
