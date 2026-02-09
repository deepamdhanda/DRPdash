import React, { useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  ProgressBar,
  Button,
  Badge,
  Navbar,
  Container,
  Nav,
  Dropdown,
} from "react-bootstrap";
import { FaCheck, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Stat, useStatsStore } from "../../store/useStatsStore";
import MakePool from "../../components/get-started/MakePool";
import MakeWarehouse from "../../components/get-started/MakeWarehouse";
import MakeChannelAccount from "../../components/get-started/MakeChannelAccount";
import logoImg from "../../assets/logo.png";
import logoImg1 from "../../assets/logo1.png";
import { drpCrmBaseUrl } from "../../axios/urls";
import { appAxios } from "../../axios/appAxios";
import { getAccountSummary } from "../../APIs/user/dashboard";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

/**
 * Horizontal Onboarding Stepper
 * - Retains original visual style (colors, sizes, fonts)
 * - Uses Bootstrap Grid + Flex for horizontal layout
 * - Adds Framer Motion for smooth content switching
 */

type Step = {
  key: string;
  label: string;
  helper?: string;
  content: React.ReactNode;
};

const GetStarted: React.FC = () => {
  const [activeStep, setActiveStep] = useState<string>("pools");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const { stats, setStatsStore } = useStatsStore();
  const [username, setUsername] = useState("");

  const verifyMe = async () => {
    try {
      const { data } = await appAxios(`${drpCrmBaseUrl}/auth/verify/me`);
      setUsername(data.username);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchAccountSummary = async () => {
    const res = await getAccountSummary();
    if (res) {
      setStatsStore((res as any).counts);
    }
  };

  useEffect(() => {
    verifyMe();
    fetchAccountSummary();
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

    const nextStep =
      stepOrder.find((step) => !completed.has(step.key)) ??
      stepOrder[stepOrder.length - 1];

    setActiveStep(nextStep.key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  // Step definitions
  const stepOrder: Step[] = [
    {
      key: "pools",
      label: "Pool Setup",
      helper: "Minimal business details",
      content: <MakePool handleNext={() => handleNext("pools")} />,
    },
    {
      key: "warehouses",
      label: "Warehouse",
      helper: "Create location",
      content: <MakeWarehouse handleNext={() => handleNext("warehouses")} />,
    },
    {
      key: "channel",
      label: "Channel Account",
      helper: "Connect Shopify/Manual",
      content: <MakeChannelAccount handleNext={() => handleNext("channel")} />,
    },
    {
      key: "final",
      label: "Finish",
      helper: "You're all set",
      content: (
        <div style={{ textAlign: "center", padding: 40 }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3 style={{ marginBottom: 12, color: "#000434" }}>Nice work 👏</h3>
            <p
              className="text-muted"
              style={{ maxWidth: 500, margin: "0 auto" }}
            >
              You completed onboarding. Explore dashboards, add products, or
              configure integrations.
            </p>
            <div style={{ marginTop: 24 }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  window.location.href = "/user";
                }}
              >
                Go to Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      ),
    },
  ];

  const totalSteps = stepOrder.length;
  const completedCount = completedSteps.length;
  const progress = Math.round((completedCount / (totalSteps - 1)) * 100);

  function handleNext(key: string) {
    if (!completedSteps.includes(key)) {
      setCompletedSteps((prev) => [...prev, key]);
    }
    const idx = stepOrder.findIndex((s) => s.key === key);
    if (idx >= 0 && idx < stepOrder.length - 1) {
      setActiveStep(stepOrder[idx + 1].key);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setActiveStep("final");
    }
  }

  function handleClickStep(key: string) {
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
    <>
      <OnboardingHeader username={username} />
      <div
        style={{
          padding: "2rem 1rem",
          backgroundColor: "#f5f7fb", // Keep original bg color
          minHeight: "100vh",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Header Section */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 style={{ color: "#000434", margin: 0, fontWeight: 700 }}>
                Welcome — Let's get you set up
              </h2>
              <div style={{ color: "#6b7280", marginTop: 6, fontSize: 14 }}>
                Onboarding in a few quick steps. We'll guide you.
              </div>
            </div>

            <div style={{ width: 320 }} className="d-none d-md-block">
              <div className="d-flex gap-2 align-items-center">
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

          {/* Horizontal Stepper */}
          <Row className="mb-4 g-3">
            {stepOrder.map((step, index) => {
              const isActive = activeStep === step.key;
              const isComplete = completedSteps.includes(step.key);

              return (
                <Col key={step.key} xs={12} md={6} lg={3}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleClickStep(step.key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      borderRadius: 10,
                      cursor: "pointer",
                      backgroundColor: "#fff",
                      // Animate background color gently
                      background: isActive ? "rgba(245,137,30,0.06)" : "#fff",
                      // Move border from Left to Bottom for horizontal feel
                      borderBottom: isActive
                        ? "4px solid #F5891E"
                        : "4px solid transparent",
                      border: isActive ? undefined : "1px solid transparent", // invisible border to prevent layout shift
                      boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
                      height: "100%",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {/* Circle Icon - Same Size (36px) */}
                    <div style={{ flexShrink: 0 }}>
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
                          <FaCheck size={14} />
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
                            fontWeight: 600,
                          }}
                        >
                          {index + 1}
                        </div>
                      )}
                    </div>

                    {/* Text Content */}
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div
                        className="text-truncate"
                        style={{
                          fontWeight: isActive ? 700 : 600,
                          color: isActive ? "#000434" : "#111827",
                          fontSize: "1rem",
                        }}
                      >
                        {step.label}
                      </div>
                      {step.helper && (
                        <div
                          className="text-truncate"
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            marginTop: 2,
                          }}
                        >
                          {step.helper}
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>

          {/* Content Card */}
          <Row>
            <Col xs={12}>
              <Card
                style={{
                  borderRadius: 16,
                  boxShadow: "0 8px 30px rgba(2,6,23,0.06)",
                  minHeight: 450,
                  padding: 24,
                  border: "none",
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <h4
                      style={{ margin: 0, color: "#000434", fontWeight: 700 }}
                    >
                      {stepOrder.find((s) => s.key === activeStep)?.label}
                    </h4>
                    <span style={{ fontSize: 13, color: "#9aa0ad" }}>
                      Step{" "}
                      {stepOrder.findIndex((s) => s.key === activeStep) + 1} of{" "}
                      {stepOrder.length}
                    </span>
                  </div>

                  {completedSteps.length > 0 && activeStep !== "final" && (
                    <Badge bg="success" pill style={{ fontSize: 12 }}>
                      {completedSteps.length} completed
                    </Badge>
                  )}
                </div>

                <div
                  style={{
                    borderTop: "1px dashed #eef2f6",
                    marginBottom: 20,
                  }}
                />

                {/* Framer Motion Transition */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    {renderedContent}
                  </motion.div>
                </AnimatePresence>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default GetStarted;

const OnboardingHeader = ({ username = "" }) => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await axios.post(
        `${drpCrmBaseUrl}/auth/logout`,
        {},
        { withCredentials: true }
      );
      navigate("/login");
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  // Reusing exact logic/colors from your original code
  return (
    <Navbar
      expand="lg"
      style={{
        backgroundColor: "#000434", // Explicit blue color from brand
        borderBottom: "1px solid #1a1e4b",
        padding: "0.75rem 0",
      }}
      variant="dark" // Ensures text/hamburger is light
    >
      <Container fluid style={{ maxWidth: 1200 }}>
        <div className="d-flex gap-2 align-items-center my-2">
          <span className="nav-logo-icon">
            <img src={logoImg} style={{ width: "30px " }} alt="logo" />
          </span>
          <span>
            <img src={logoImg1} style={{ width: "100px " }} alt="logo text" />
          </span>
        </div>

        <Nav className="ms-auto">
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="outline-light" // Changed to fit dark header
              id="user-dropdown"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 24,
                padding: "6px 12px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
              }}
            >
              <FaUserCircle size={18} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>{username}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
};
