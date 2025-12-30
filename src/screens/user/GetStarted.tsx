import React, { useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  ProgressBar,
  Button,
  Badge,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { FaCheck, FaChevronRight } from "react-icons/fa";
import { Stat, useStatsStore } from "../../store/useStatsStore";
import MakePool from "../../components/get-started/MakePool";
import MakeWarehouse from "../../components/get-started/MakeWarehouse";
import MakeChannelAccount from "../../components/get-started/MakeChannelAccount";

import { drpCrmBaseUrl } from "../../axios/urls";
import { appAxios } from "../../axios/appAxios";

/**
 * Modernized GetStarted stepper — focused on clarity, speed, and progressive disclosure.
 * - Left: vertical stepper (collapses to top on small screens)
 * - Right: content card with progress and subtle visual affordances
 * - Retains integration with MakePool / MakeWarehouse / MakeChannelAccount through handleNext
 */

type Step = {
  key: string;
  label: string;
  helper?: string;
  content: React.ReactNode;
  optional?: boolean;
};

const GetStarted: React.FC = () => {
  const [activeStep, setActiveStep] = useState<string>("pools");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const { stats } = useStatsStore();
  const verifyMe = async () => {
    try {
      await appAxios(`${drpCrmBaseUrl}/auth/verify/me`);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    verifyMe();
  }, []);

  useEffect(() => {
    if (!stats || stats.length === 0) return;
    const completed = new Set<string>();

    stats.forEach((stat: Stat) => {
      const token = stat.label.split(" ")[1]?.toLowerCase();
      if (
        (token === "pools" || token === "warehouses" || token === "channel") &&
        Number(stat.count) > 0
      ) {
        completed.add(token);
      }
    });

    const completedArray = Array.from(completed);
    setCompletedSteps(completedArray);

    // choose next incomplete step
    const nextStep =
      stepOrder.find((step) => !completed.has(step.key)) ??
      stepOrder[stepOrder.length - 1];

    setActiveStep(nextStep.key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  // Step definitions (keeps the same children)
  const stepOrder: Step[] = [
    {
      key: "pools",
      label: "Pool Setup",
      helper: "Minimal business details — required for payouts",
      content: <MakePool handleNext={() => handleNext("pools")} />,
    },
    {
      key: "warehouses",
      label: "Warehouse",
      helper: "Create your fulfillment location",
      content: <MakeWarehouse handleNext={() => handleNext("warehouses")} />,
    },
    {
      key: "channel",
      label: "Channel Account",
      helper: "Connect Shopify or add a manual channel",
      content: <MakeChannelAccount handleNext={() => handleNext("channel")} />,
    },
    {
      key: "final",
      label: "Finish",
      helper: "You're all set",
      content: (
        <div style={{ textAlign: "center", padding: 18 }}>
          <h3 style={{ marginBottom: 8 }}>Nice work 👏</h3>
          <p className="text-muted" style={{ maxWidth: 640, margin: "0 auto" }}>
            You completed onboarding. Explore dashboards, add products, or
            configure integrations.
          </p>
          <div style={{ marginTop: 18 }}>
            <Button
              variant="primary"
              onClick={() => {
                // go to dashboard root — keep simple, user can change
                window.location.href = "/user";
              }}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      ),
    },
  ];

  const totalSteps = stepOrder.length;
  const completedCount = completedSteps.length;
  const progress = Math.round((completedCount / (totalSteps - 1)) * 100); // exclude final as target

  function handleNext(key: string) {
    if (!completedSteps.includes(key)) {
      setCompletedSteps((prev) => [...prev, key]);
    }
    const idx = stepOrder.findIndex((s) => s.key === key);
    if (idx >= 0 && idx < stepOrder.length - 1) {
      setActiveStep(stepOrder[idx + 1].key);
      // scroll to top of content (good UX for mobile)
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setActiveStep("final");
    }
  }

  function handleClickStep(key: string) {
    // allow navigation to completed steps or next immediate step, or current
    const idxClicked = stepOrder.findIndex((s) => s.key === key);
    const idxActive = stepOrder.findIndex((s) => s.key === activeStep);
    const isCompleted = completedSteps.includes(key);
    const isCurrentOrPrevious = idxClicked <= idxActive + 1;
    if (isCompleted || isCurrentOrPrevious) setActiveStep(key);
  }

  const renderedContent = useMemo(
    () => stepOrder.find((s) => s.key === activeStep)?.content,
    [activeStep, stepOrder]
  );

  return (
    <div
      style={{
        padding: "2rem 1rem",
        backgroundColor: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ color: "#000434", margin: 0 }}>
              Welcome — Let's get you set up
            </h2>
            <div style={{ color: "#6b7280", marginTop: 6, fontSize: 14 }}>
              Onboarding in a few quick steps. We'll guide you.
            </div>
          </div>

          <div style={{ width: 320 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <ProgressBar
                  now={progress}
                  variant="warning"
                  style={{ height: 8, borderRadius: 8 }}
                />
                <div
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    marginTop: 6,
                    textAlign: "right",
                  }}
                >
                  {completedCount}/{totalSteps - 1} completed
                </div>
              </div>
            </div>
          </div>
        </div>

        <Row>
          <Col lg={3} md={4} sm={12} xs={12} style={{ marginBottom: 12 }}>
            <aside
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 12,
                border: "1px solid #eef2f6",
                position: "sticky",
                top: 24,
                maxHeight: "75vh",
                overflow: "auto",
              }}
              aria-label="Onboarding steps"
            >
              {stepOrder.map((step, index) => {
                const isActive = activeStep === step.key;
                const isComplete = completedSteps.includes(step.key);
                return (
                  <div
                    key={step.key}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleClickStep(step.key)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        handleClickStep(step.key);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 8px",
                      borderRadius: 10,
                      marginBottom: 8,
                      cursor:
                        isComplete || step.key === activeStep
                          ? "pointer"
                          : "pointer",
                      background: isActive
                        ? "rgba(245,137,30,0.06)"
                        : "transparent",
                      borderLeft: isActive
                        ? "4px solid #F5891E"
                        : "4px solid transparent",
                      transition: "all 0.12s ease",
                    }}
                    title={step.helper}
                  >
                    <div style={{ width: 36, textAlign: "center" }}>
                      {isComplete ? (
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            background: "#F5891E",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                          }}
                        >
                          <FaCheck />
                        </div>
                      ) : (
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            border: "1px solid #e6e9ee",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: isActive ? "#F5891E" : "#9aa0ad",
                            background: isActive
                              ? "rgba(245,137,30,0.06)"
                              : "transparent",
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{index + 1}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: isActive ? 700 : 600,
                            color: isActive ? "#000434" : "#111827",
                          }}
                        >
                          {step.label}
                        </div>
                        <div style={{ color: "#9aa0ad", fontSize: 12 }}>
                          {isComplete ? (
                            <small>Done</small>
                          ) : (
                            <small>
                              {index === stepOrder.length - 1 ? "Optional" : ""}
                            </small>
                          )}
                        </div>
                      </div>
                      {step.helper && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            marginTop: 4,
                          }}
                        >
                          {step.helper}
                        </div>
                      )}
                    </div>

                    <div>
                      <OverlayTrigger
                        overlay={
                          <Tooltip id={`tooltip-${step.key}`}>
                            {isComplete ? "Completed" : "Open step"}
                          </Tooltip>
                        }
                      >
                        <span style={{ color: "#9aa0ad" }}>
                          <FaChevronRight />
                        </span>
                      </OverlayTrigger>
                    </div>
                  </div>
                );
              })}
            </aside>
          </Col>

          <Col lg={9} md={8} sm={12} xs={12}>
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 8px 30px rgba(2,6,23,0.06)",
                minHeight: 420,
                padding: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, color: "#6b7280" }}>
                    Step{" "}
                    {Math.min(
                      stepOrder.findIndex((s) => s.key === activeStep) + 1,
                      stepOrder.length
                    )}{" "}
                    of {stepOrder.length}
                  </div>
                  <h4 style={{ margin: 0, color: "#000434" }}>
                    {stepOrder.find((s) => s.key === activeStep)?.label}
                  </h4>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {completedSteps.length > 0 && (
                    <Badge bg="success" pill style={{ fontSize: 12 }}>
                      {completedSteps.length} complete
                    </Badge>
                  )}
                </div>
              </div>

              <div
                style={{
                  borderTop: "1px dashed #eef2f6",
                  marginTop: 10,
                  paddingTop: 14,
                }}
              >
                {renderedContent}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default GetStarted;
