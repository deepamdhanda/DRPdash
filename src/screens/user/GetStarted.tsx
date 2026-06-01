import React, { useEffect, useMemo, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Stat, useStatsStore } from "../../store/useStatsStore";
import MakePool from "../../components/get-started/MakePool";
import MakeWarehouse from "../../components/get-started/MakeWarehouse";
import MakeChannelAccount from "../../components/get-started/MakeChannelAccount";
import logoImg from "/Orderzup.png";
import { drpCrmBaseUrl } from "../../axios/urls";
import { appAxios } from "../../axios/appAxios";
import { getAccountSummary } from "../../APIs/user/dashboard";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import GetStartedRecharge from "../../components/get-started/MakeWalletRecharge";

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
  }, [stats]);

  // Step definitions
  const stepOrder: Step[] = [
    {
      key: "warehouses",
      label: "Warehouse",
      helper: "Create location",
      content: <MakeWarehouse handleNext={() => handleNext("warehouses")} />,
    },
    {
      key: "pools",
      label: "Business Account Setup",
      helper: "Minimal business details",
      content: <MakePool handleNext={() => handleNext("pools")} />,
    },
    {
      key: "channel",
      label: "Channel Account",
      helper: "Connect Shopify/Manual",
      content: <MakeChannelAccount handleNext={() => handleNext("channel")} />,
    },
    {
      key: "recharge",
      label: "Wallet Recharge",
      helper: "Let's add some balance.",
      content: <GetStartedRecharge />,
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
      <div className="py-8 px-4 bg-[#f5f7fb] min-h-screen">
        <div className="max-w-[1200px] mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-[#000434] m-0 font-bold text-2xl md:text-3xl">
                Welcome — Let's get you set up
              </h2>
              <div className="text-gray-500 mt-1.5 text-sm">
                Onboarding in a few quick steps. We'll guide you.
              </div>
            </div>

            <div className="hidden md:block w-[320px]">
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  {/* Custom Progress Bar replicating Bootstrap's variant="warning" */}
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ffc107] rounded-full transition-all duration-300 ease-in-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1.5 text-right">
                    {completedCount}/{totalSteps - 1} completed
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Tabs */}
          <div className="mb-6 flex gap-3 flex-nowrap overflow-x-auto pb-2 scrollbar-hide">
            {stepOrder.map((step, index) => {
              const isActive = activeStep === step.key;
              const isComplete = completedSteps.includes(step.key);

              return (
                <div key={step.key} className="flex-1 min-w-[250px]">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleClickStep(step.key)}
                    className={`flex items-center gap-3 p-3 px-4 rounded-xl cursor-pointer h-full transition-all duration-200 shadow-[0_2px_5px_rgba(0,0,0,0.03)] border-b-4 
                      ${
                        isActive
                          ? "bg-[#F5891E]/10 border-b-[#F5891E]"
                          : "bg-white border-b-transparent border border-transparent"
                      }
                    `}
                  >
                    <div className="shrink-0">
                      {isComplete ? (
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold transition-all duration-200 
                            ${
                              isComplete
                                ? "bg-[#F5891E] text-white"
                                : isActive
                                ? "bg-[#F5891E]/10 text-[#F5891E] border border-[#F5891E]"
                                : "bg-white text-[#9aa0ad] border border-[#e6e9ee]"
                            }
                          `}
                        >
                          <FaCheck size={14} />
                        </div>
                      ) : (
                        <div
                          className={`w-9 h-9 rounded-full border inline-flex items-center justify-center font-semibold transition-all duration-200
                            ${
                              isActive
                                ? "border-[#F5891E] text-[#F5891E] bg-[#F5891E]/10"
                                : "border-[#e6e9ee] text-[#9aa0ad] bg-transparent"
                            }
                          `}
                        >
                          {index + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <div
                        className={`truncate text-base ${
                          isActive
                            ? "font-bold text-[#000434]"
                            : "font-semibold text-gray-900"
                        }`}
                      >
                        {step.label}
                      </div>

                      {step.helper && (
                        <div className="truncate text-xs text-gray-500 mt-0.5">
                          {step.helper}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Content Card */}
          <div className="w-full">
            <div className="rounded-2xl shadow-[0_8px_30px_rgba(2,6,23,0.06)] min-h-[450px] p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="m-0 text-[#000434] font-bold text-xl">
                    {stepOrder.find((s) => s.key === activeStep)?.label}
                  </h4>
                  <span className="text-[13px] text-[#9aa0ad]">
                    Step {stepOrder.findIndex((s) => s.key === activeStep) + 1}{" "}
                    of {stepOrder.length}
                  </span>
                </div>

                {completedSteps.length > 0 && activeStep !== "final" && (
                  <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    {completedSteps.length} completed
                  </span>
                )}
              </div>

              <div className="border-t border-dashed border-[#eef2f6] mb-5" />

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
            </div>
          </div>
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

  return (
    <header className="bg-white border-b border-white/10">
      <div className="max-w-[1200px] mx-auto py-4.5 px-6 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-0 leading-none">
            <img
              src={logoImg}
              alt="logo"
              className="w-11 h-11 object-contain -mr-0.5"
            />

            <span className="font-bold text-[#000967] text-[34px] leading-11 tracking-tight">
              Orderz
              <span className="text-[#F5891E] -ml-px">Up</span>
            </span>
          </div>

          <div className="mt-1 ml-15.5 text-[13px] tracking-wide text-slate-400 uppercase">
            Hello,
            <span className="text-[#F5891E] font-bold ml-1.5">{username}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="border-none bg-[#F5891E] text-white px-5.5 py-2.5 rounded-lg font-semibold cursor-pointer shadow-[0_4px_12px_rgba(245,137,30,0.25)] hover:bg-[#e07a16] transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};
