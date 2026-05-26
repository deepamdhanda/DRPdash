import React, { useEffect, useState } from "react";
import {
  FaComments,
  FaChevronLeft,
  FaTimes,
  FaRegLifeRing,
  FaPaperclip,
} from "react-icons/fa";
import { fetchGyaan, fetchTopics } from "../../../APIs/user/supportChat";
import { getAccountSummary } from "../../../APIs/user/dashboard";
import { createAmazonS3 } from "../../../APIs/user/amazonS3";
import { toast } from "react-toastify";
import {
  createTicket,
  getAllTickets,
  updateTicket,
  getTicketById,
} from "../../../APIs/user/ticket";
import { useUserStore } from "../../../store/useUserStore";
import { useStatsStore } from "../../../store/useStatsStore";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type Topic = {
  _id: string;
  name: string;
  icon: string;
  type: "category" | "subcategory" | "article";
  parentId?: string;
  description?: string;
  url?: string;
};

type Ticket = {
  _id: string;
  subject: string;
  description: string;
  category: { name: string };
  subcategory: { name: string };
  status: string;
  replies?: Array<{
    message: string;
    createdAt: string;
    attachments?: string[];
    user?: { name: string };
  }>;
  attachments?: string[];
  createdAt: string;
};

// --- Design System Constants ---
const theme = {
  white: "#ffffff",
  black: "#000000",
  textMain: "#111827",
  textMuted: "#6b7280",
  highlight: "#F5891E",
  border: "#e5e7eb",
  bgSubtle: "#f9fafb",
  shadowFloat:
    "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
  shadowSubtle:
    "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
};

// --- Custom Components & Styles ---

const CustomSpinner = ({
  size = 20,
  color = theme.white,
}: {
  size?: number;
  color?: string;
}) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    style={{
      width: size,
      height: size,
      border: `2px solid ${color}`,
      borderTopColor: "transparent",
      borderRadius: "50%",
      display: "inline-block",
    }}
  />
);

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: `1px solid ${theme.border}`,
  borderRadius: "8px",
  fontSize: "14px",
  marginBottom: "16px",
  boxSizing: "border-box",
  fontFamily: "inherit",
  backgroundColor: theme.white,
  color: theme.textMain,
  outline: "none",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  fontWeight: "500",
  color: theme.textMain,
};

const btnStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  fontWeight: "500",
  fontSize: "14px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  transition: "all 0.2s ease",
};

// --- Main Component ---

const SupportChatWidget = () => {
  const navigate = useNavigate();
  const { setStatsStore } = useStatsStore();
  const [open, setOpen] = useState(false);
  const { username } = useUserStore();
  const [tab, setTab] = useState<"tickets" | "help">("tickets");
  const [step, setStep] = useState<
    "categories" | "subcategories" | "articles" | "fallback"
  >("categories");
  const [categories, setCategories] = useState<Topic[]>([]);
  const [subcategories, setSubcategories] = useState<Topic[]>([]);
  const [articles, setArticles] = useState<Topic[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Topic | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Topic | null>(
    null
  );
  const [stats, setStats] = useState<any>();
  const [gyaan, setGyaan] = useState<any>();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isNew, setIsNew] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [replyTicketId, setReplyTicketId] = useState<string | null>(null);
  const [replyTicketData, setReplyTicketData] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyAttachment, setReplyAttachment] = useState<File | null>(null);
  const [replyLoading, setReplyLoading] = useState(false);
  const [displayImage, setDisplayImage] = useState<string | null>(null);
  const [orderly, setOrderly] = useState(true);
  const [help, setHelp] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchTopics("category").then(setCategories);
    fetchGyaan().then(setGyaan);
    fetchAllTickets();
    fetchAccountSummary();
  }, []);

  const fetchAllTickets = async () => {
    setLoadingTickets(true);
    try {
      const data = await getAllTickets();
      setTickets(data || []);
    } finally {
      setLoadingTickets(false);
    }
  };

  const fetchAccountSummary = async () => {
    const res = await getAccountSummary();
    if (res) {
      setStatsStore((res as any).counts);
      setStats(res);
      if (window.location.pathname === "/user/channel_accounts") {
        return;
      }
      (res as any).counts.forEach((stat: any) => {
        const token = stat.label.split(" ")[1]?.toLowerCase();
        if (
          (token === "pools" ||
            token === "warehouses" ||
            token === "channel") &&
          Number(stat.count) === 0
        ) {
          navigate("/get-started");
        }
      });
    }
  };

  const onTicketClose = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // --- Ticket Creation ---
  const handleSubmitTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const subject = formData.get("subject") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;
    const file = formData.get("attachment") as File;

    if (
      !subject ||
      !description ||
      !priority ||
      !selectedCategory ||
      !selectedSubcategory
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    let attachmentUrl;
    if (file && file.name) {
      try {
        const base64String = await fileToBase64(file);
        const fileName = `tickets/${Date.now()}_${file.name}`;
        attachmentUrl = await createAmazonS3(fileName, base64String);
      } catch (err) {
        toast.error("Image upload failed. Please try again.");
        return;
      }
    }

    const data = {
      subject,
      description,
      category: selectedCategory._id,
      subcategory: selectedSubcategory._id,
      attachments: attachmentUrl ? [attachmentUrl.url] : null,
    };

    try {
      const res = await createTicket(data);
      if (res) {
        toast.success("Your ticket has been submitted successfully.");
        form.reset();
        onTicketClose();
        setIsNew(false);
        fetchAllTickets();
      } else {
        toast.error("Ticket submission failed. Please try again.");
      }
    } catch (err) {
      toast.error("Ticket submission failed. Please try again.");
    }
  };

  // --- Ticket Reply ---
  const openReplyScreen = async (ticketId: string) => {
    setReplyTicketId(ticketId);
    setReplyLoading(true);
    try {
      const data = await getTicketById(ticketId);
      setReplyTicketData(Array.isArray(data) ? data[0] || null : data);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTicketId || !replyMessage.trim()) {
      toast.error("Reply message cannot be empty.");
      return;
    }
    setReplyLoading(true);
    let attachmentUrl;
    if (replyAttachment) {
      try {
        const base64String = await fileToBase64(replyAttachment);
        const fileName = `tickets/replies/${Date.now()}_${
          replyAttachment.name
        }`;
        attachmentUrl = await createAmazonS3(fileName, base64String);
      } catch (err) {
        toast.error("Attachment upload failed.");
        setReplyLoading(false);
        return;
      }
    }
    try {
      await updateTicket(replyTicketId, {
        message: replyMessage,
        attachments: attachmentUrl ? [attachmentUrl.url] : [],
      });
      toast.success("Reply sent!");
      setReplyMessage("");
      setReplyAttachment(null);
      openReplyScreen(replyTicketId);
      fetchAllTickets();
    } catch (err) {
      toast.error("Failed to send reply.");
    } finally {
      setReplyLoading(false);
    }
  };

  // --- Help Center Navigation ---
  const handleCategoryClick = async (category: Topic) => {
    setSelectedCategory(category);
    const subs = await fetchTopics("subcategory", category._id);
    setSubcategories(subs);
    setStep("subcategories");
  };

  const handleSubcategoryClick = async (subcategory: Topic) => {
    setSelectedSubcategory(subcategory);
    const arts = await fetchTopics("article", subcategory._id);
    setArticles(arts);
    setStep("articles");
  };

  const resetToStep = (target: typeof step) => {
    if (target === "categories") {
      setStep("categories");
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else if (target === "subcategories") {
      setStep("subcategories");
      setSelectedSubcategory(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        {/* HELP DESK LOGIC */}
        {!help ? (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => {
              setHelp(true);
              setOpen(false);
              setOrderly(false);
            }}
            style={{
              position: "fixed",
              bottom: "16px",
              right: "16px",
              backgroundColor: theme.white,
              color: theme.textMain,
              padding: "16px",
              borderRadius: "50%",
              boxShadow: theme.shadowFloat,
              border: `1px solid ${theme.border}`,
              cursor: "pointer",
              zIndex: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = theme.highlight)
            }
            onMouseLeave={(e) => (e.currentTarget.style.color = theme.textMain)}
          >
            <FaRegLifeRing size={20} />
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              position: "fixed",
              bottom: "16px",
              right: "16px",
              width: "calc(100vw - 32px)",
              maxWidth: "320px",
              backgroundColor: theme.white,
              borderRadius: "16px",
              boxShadow: theme.shadowFloat,
              border: `1px solid ${theme.border}`,
              overflow: "hidden",
              zIndex: 1000,
              padding: "24px",
              fontFamily: "sans-serif",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  color: theme.textMain,
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                Help Desk
              </h4>
              <button
                onClick={() => setHelp(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: theme.textMuted,
                  fontSize: "14px",
                  padding: 0,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = theme.highlight)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = theme.textMuted)
                }
              >
                <FaTimes />
              </button>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <span
                style={{
                  fontSize: "12px",
                  color: theme.textMuted,
                  display: "block",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Support Agent
              </span>
              <strong
                style={{
                  color: theme.textMain,
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Gurdeep
              </strong>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <span
                style={{
                  fontSize: "12px",
                  color: theme.textMuted,
                  display: "block",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Phone
              </span>
              <a
                href="tel:+918640000446"
                style={{
                  textDecoration: "none",
                  color: theme.textMain,
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = theme.highlight)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = theme.textMain)
                }
              >
                +91 86400-00446
              </a>
            </div>
            <div>
              <span
                style={{
                  fontSize: "12px",
                  color: theme.textMuted,
                  display: "block",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Email
              </span>
              <a
                href="mailto:gurdeep-a24@orderzup.com"
                style={{
                  textDecoration: "none",
                  color: theme.textMain,
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = theme.highlight)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = theme.textMain)
                }
              >
                gurdeep-a24@orderzup.com
              </a>
            </div>
          </motion.div>
        )}

        {/* MAIN CHAT LOGIC */}
        {!open ? (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => {
              setOpen(true);
              setOrderly(false);
              setHelp(false);
            }}
            style={{
              position: "fixed",
              bottom: "72px",
              right: "16px",
              backgroundColor: theme.highlight,
              color: theme.white,
              padding: "16px",
              borderRadius: "50%",
              boxShadow: theme.shadowFloat,
              border: "none",
              cursor: "pointer",
              zIndex: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaComments size={20} />
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              position: "fixed",
              bottom: "16px",
              right: "16px",
              width: "calc(100vw - 32px)",
              maxWidth: "380px",
              maxHeight: "85vh",
              backgroundColor: theme.white,
              borderRadius: "16px",
              boxShadow: theme.shadowFloat,
              border: `1px solid ${theme.border}`,
              overflow: "hidden",
              zIndex: 1000,
              fontFamily: "sans-serif",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                backgroundColor: theme.white,
                color: theme.textMain,
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: `1px solid ${theme.border}`,
              }}
            >
              <span style={{ fontWeight: "600", fontSize: "16px" }}>
                Hey, I’m Orderly
              </span>
              <button
                onClick={() => {
                  setOpen(false);
                  setIsNew(false);
                  setReplyTicketId(null);
                  setReplyTicketData(null);
                }}
                style={{
                  background: "none",
                  color: theme.textMuted,
                  fontSize: "16px",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = theme.highlight)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = theme.textMuted)
                }
              >
                <FaTimes />
              </button>
            </div>

            {/* Custom Tabs */}
            <div
              style={{
                display: "flex",
                backgroundColor: theme.white,
                borderBottom: `1px solid ${theme.border}`,
              }}
            >
              <button
                onClick={() => setTab("tickets")}
                style={{
                  flex: 1,
                  padding: "14px",
                  border: "none",
                  background: "transparent",
                  borderBottom:
                    tab === "tickets"
                      ? `2px solid ${theme.highlight}`
                      : "2px solid transparent",
                  color: tab === "tickets" ? theme.highlight : theme.textMuted,
                  fontWeight: tab === "tickets" ? "600" : "500",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "color 0.2s, border-color 0.2s",
                }}
              >
                Tickets
              </button>
              <button
                onClick={() => setTab("help")}
                style={{
                  flex: 1,
                  padding: "14px",
                  border: "none",
                  background: "transparent",
                  borderBottom:
                    tab === "help"
                      ? `2px solid ${theme.highlight}`
                      : "2px solid transparent",
                  color: tab === "help" ? theme.highlight : theme.textMuted,
                  fontWeight: tab === "help" ? "600" : "500",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "color 0.2s, border-color 0.2s",
                }}
              >
                Help Center
              </button>
            </div>

            {/* Tab Content */}
            <div
              style={{
                padding: "20px",
                overflowY: "auto",
                maxHeight: "calc(85vh - 125px)",
                backgroundColor: theme.white,
              }}
            >
              {/* Tickets Tab */}
              {tab === "tickets" && (
                <AnimatePresence mode="wait">
                  {replyTicketId && replyTicketData ? (
                    <motion.div
                      key="reply-view"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <button
                        onClick={() => {
                          setReplyTicketId(null);
                          setReplyTicketData(null);
                        }}
                        style={{
                          ...btnStyle,
                          background: "transparent",
                          color: theme.textMuted,
                          padding: 0,
                          marginBottom: "20px",
                          fontSize: "13px",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = theme.highlight)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = theme.textMuted)
                        }
                      >
                        <FaChevronLeft size={10} /> Back to Tickets
                      </button>
                      <h5
                        style={{
                          margin: "0 0 12px 0",
                          color: theme.textMain,
                          fontWeight: "600",
                          fontSize: "16px",
                        }}
                      >
                        {replyTicketData.subject}
                      </h5>
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          marginBottom: "16px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            color: theme.textMuted,
                            background: theme.bgSubtle,
                            padding: "4px 8px",
                            borderRadius: "4px",
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          {replyTicketData.category?.name} /{" "}
                          {replyTicketData.subcategory?.name}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color:
                              replyTicketData.status === "open"
                                ? theme.highlight
                                : theme.textMuted,
                            background: theme.bgSubtle,
                            padding: "4px 8px",
                            borderRadius: "4px",
                            border: `1px solid ${theme.border}`,
                            fontWeight: "500",
                            textTransform: "capitalize",
                          }}
                        >
                          {replyTicketData.status}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: "14px",
                          color: theme.textMain,
                          marginBottom: "16px",
                          lineHeight: "1.5",
                        }}
                      >
                        {replyTicketData.description}
                      </div>

                      {replyTicketData.attachments &&
                        replyTicketData.attachments.length > 0 && (
                          <div style={{ marginBottom: "20px" }}>
                            <strong
                              style={{
                                fontSize: "12px",
                                color: theme.textMuted,
                                display: "block",
                                marginBottom: "8px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Attachments
                            </strong>
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              {replyTicketData.attachments.map((url, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => setDisplayImage(url)}
                                  style={{
                                    border: `1px solid ${theme.border}`,
                                    borderRadius: "6px",
                                    padding: "2px",
                                    cursor: "pointer",
                                    overflow: "hidden",
                                  }}
                                >
                                  <img
                                    src={url}
                                    alt="attachment"
                                    style={{
                                      width: "60px",
                                      height: "60px",
                                      objectFit: "cover",
                                      borderRadius: "4px",
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      <hr
                        style={{
                          border: "0",
                          borderTop: `1px solid ${theme.border}`,
                          margin: "24px 0",
                        }}
                      />

                      <div>
                        <strong
                          style={{
                            fontSize: "12px",
                            color: theme.textMuted,
                            display: "block",
                            marginBottom: "12px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Conversation
                        </strong>
                        <div
                          style={{
                            maxHeight: 200,
                            overflowY: "auto",
                            marginBottom: "20px",
                            paddingRight: "4px",
                          }}
                        >
                          {replyTicketData.replies &&
                          replyTicketData.replies.length > 0 ? (
                            replyTicketData.replies.map((rep, idx) => (
                              <div
                                key={idx}
                                style={{
                                  marginBottom: "16px",
                                  borderLeft: `2px solid ${theme.border}`,
                                  paddingLeft: "12px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "6px",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontWeight: 600,
                                      fontSize: "13px",
                                      color: theme.textMain,
                                    }}
                                  >
                                    {rep.user?.name || "Support"}
                                  </span>
                                  <span
                                    style={{
                                      color: theme.textMuted,
                                      fontSize: "11px",
                                    }}
                                  >
                                    {new Date(rep.createdAt).toLocaleString(
                                      undefined,
                                      {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    fontSize: "13px",
                                    color: theme.textMain,
                                    lineHeight: "1.5",
                                  }}
                                >
                                  {rep.message}
                                </div>
                                {rep.attachments &&
                                  rep.attachments.length > 0 && (
                                    <div
                                      style={{
                                        marginTop: "8px",
                                        display: "flex",
                                        gap: "8px",
                                        flexWrap: "wrap",
                                      }}
                                    >
                                      {rep.attachments.map((url, i) => (
                                        <a
                                          key={i}
                                          href={url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{
                                            fontSize: "11px",
                                            color: theme.textMain,
                                            textDecoration: "none",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            background: theme.bgSubtle,
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            border: `1px solid ${theme.border}`,
                                          }}
                                          onMouseEnter={(e) =>
                                            (e.currentTarget.style.borderColor =
                                              theme.highlight)
                                          }
                                          onMouseLeave={(e) =>
                                            (e.currentTarget.style.borderColor =
                                              theme.border)
                                          }
                                        >
                                          <FaPaperclip size={10} /> Attachment{" "}
                                          {i + 1}
                                        </a>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            ))
                          ) : (
                            <div
                              style={{
                                fontSize: "13px",
                                color: theme.textMuted,
                                fontStyle: "italic",
                              }}
                            >
                              No replies yet.
                            </div>
                          )}
                        </div>
                        <form onSubmit={handleReplySubmit}>
                          <label style={labelStyle}>Your Reply</label>
                          <textarea
                            style={{
                              ...inputStyle,
                              minHeight: "80px",
                              resize: "vertical",
                            }}
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Type here..."
                            disabled={replyLoading}
                          />
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <label
                              style={{
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "36px",
                                height: "36px",
                                borderRadius: "8px",
                                border: `1px solid ${theme.border}`,
                                background: theme.white,
                                color: theme.textMuted,
                              }}
                            >
                              <FaPaperclip />
                              <input
                                type="file"
                                style={{ display: "none" }}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                  setReplyAttachment(
                                    e.target.files?.[0] || null
                                  )
                                }
                                disabled={replyLoading}
                              />
                            </label>
                            <button
                              type="submit"
                              style={{
                                ...btnStyle,
                                backgroundColor: theme.highlight,
                                color: theme.white,
                                flex: 1,
                              }}
                              disabled={replyLoading}
                            >
                              {replyLoading ? (
                                <CustomSpinner size={16} />
                              ) : (
                                "Send"
                              )}
                            </button>
                          </div>
                          {replyAttachment && (
                            <div
                              style={{
                                fontSize: "11px",
                                color: theme.textMuted,
                                marginTop: "8px",
                              }}
                            >
                              Attached: {replyAttachment.name}
                            </div>
                          )}
                        </form>
                      </div>
                    </motion.div>
                  ) : isNew ? (
                    <motion.form
                      key="new-ticket"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleSubmitTicket}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          marginBottom: "20px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ color: theme.textMuted }}>
                          Category:
                        </span>
                        <span
                          style={{
                            background: theme.bgSubtle,
                            padding: "4px 8px",
                            borderRadius: "4px",
                            border: `1px solid ${theme.border}`,
                            color: theme.textMain,
                            fontWeight: "500",
                            fontSize: "12px",
                          }}
                        >
                          {selectedCategory?.name || "N/A"}
                        </span>
                        <span style={{ color: theme.textMuted }}>/</span>
                        <span
                          style={{
                            background: theme.bgSubtle,
                            padding: "4px 8px",
                            borderRadius: "4px",
                            border: `1px solid ${theme.border}`,
                            color: theme.textMain,
                            fontWeight: "500",
                            fontSize: "12px",
                          }}
                        >
                          {selectedSubcategory?.name || "N/A"}
                        </span>
                      </div>
                      <div>
                        <label style={labelStyle}>Subject</label>
                        <input
                          name="subject"
                          type="text"
                          style={inputStyle}
                          placeholder="Briefly summarize your issue"
                          required
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Priority</label>
                        <select
                          name="priority"
                          style={{
                            ...inputStyle,
                            backgroundColor: theme.white,
                          }}
                          required
                        >
                          <option value="">Select priority</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Description</label>
                        <textarea
                          name="description"
                          rows={4}
                          style={{ ...inputStyle, resize: "vertical" }}
                          placeholder="Please describe the issue in detail."
                          required
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Attachment (optional)</label>
                        <input
                          name="attachment"
                          type="file"
                          style={{
                            ...inputStyle,
                            padding: "8px",
                            border: "none",
                            background: "transparent",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          marginTop: "12px",
                        }}
                      >
                        <button
                          type="button"
                          style={{
                            ...btnStyle,
                            flex: 1,
                            backgroundColor: theme.white,
                            color: theme.textMain,
                            border: `1px solid ${theme.border}`,
                          }}
                          onClick={() => setIsNew(false)}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              theme.bgSubtle)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              theme.white)
                          }
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          style={{
                            ...btnStyle,
                            flex: 1,
                            backgroundColor: theme.highlight,
                            color: theme.white,
                          }}
                        >
                          Submit
                        </button>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="list-tickets"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "20px",
                        }}
                      >
                        <h6
                          style={{
                            margin: 0,
                            fontSize: "16px",
                            fontWeight: "600",
                            color: theme.textMain,
                          }}
                        >
                          Your Tickets
                        </h6>
                        <button
                          style={{
                            ...btnStyle,
                            backgroundColor: theme.highlight,
                            color: theme.white,
                            padding: "8px 16px",
                            fontSize: "13px",
                          }}
                          onClick={() => {
                            selectedCategory ? setIsNew(true) : setTab("help");
                          }}
                        >
                          Create Ticket
                        </button>
                      </div>
                      {loadingTickets ? (
                        <div style={{ textAlign: "center", padding: "40px 0" }}>
                          <CustomSpinner size={30} color={theme.highlight} />
                        </div>
                      ) : tickets.length === 0 ? (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "40px 0",
                            color: theme.textMuted,
                            fontSize: "14px",
                          }}
                        >
                          No tickets found.
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                          }}
                        >
                          {tickets.map((ticket) => (
                            <div
                              key={ticket._id}
                              onClick={() => openReplyScreen(ticket._id)}
                              style={{
                                border: `1px solid ${theme.border}`,
                                borderRadius: "12px",
                                padding: "16px",
                                backgroundColor: theme.white,
                                cursor: "pointer",
                                transition: "all 0.2s",
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor =
                                  theme.highlight;
                                e.currentTarget.style.boxShadow =
                                  theme.shadowSubtle;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor =
                                  theme.border;
                                e.currentTarget.style.boxShadow = "none";
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  gap: "8px",
                                }}
                              >
                                <div
                                  style={{
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    color: theme.textMain,
                                    lineHeight: "1.4",
                                  }}
                                >
                                  {ticket.subject}
                                </div>
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    color:
                                      ticket.status === "open"
                                        ? theme.highlight
                                        : theme.textMuted,
                                  }}
                                >
                                  {ticket.status}
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: theme.textMuted,
                                }}
                              >
                                {ticket.category?.name} •{" "}
                                {ticket.subcategory?.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {/* Help Center Tab */}
              {tab === "help" && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`step-${step}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    {step !== "categories" && (
                      <button
                        onClick={() =>
                          resetToStep(
                            step === "articles" ? "subcategories" : "categories"
                          )
                        }
                        style={{
                          background: "none",
                          border: "none",
                          color: theme.textMuted,
                          fontSize: "13px",
                          marginBottom: "20px",
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          padding: 0,
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = theme.highlight)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = theme.textMuted)
                        }
                      >
                        <FaChevronLeft
                          style={{ marginRight: "6px" }}
                          size={10}
                        />{" "}
                        Back
                      </button>
                    )}
                    {step === "categories" && (
                      <>
                        <p
                          style={{
                            marginBottom: "16px",
                            fontSize: "15px",
                            fontWeight: "500",
                            color: theme.textMain,
                          }}
                        >
                          What can we help you with?
                        </p>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          {categories.map((cat) => (
                            <button
                              key={cat._id}
                              onClick={() => handleCategoryClick(cat)}
                              style={{
                                textAlign: "left",
                                padding: "14px 16px",
                                backgroundColor: theme.white,
                                color: theme.textMain,
                                borderRadius: "12px",
                                border: `1px solid ${theme.border}`,
                                fontWeight: 500,
                                fontSize: "14px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor =
                                  theme.highlight;
                                e.currentTarget.style.color = theme.highlight;
                                e.currentTarget.style.boxShadow =
                                  theme.shadowSubtle;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor =
                                  theme.border;
                                e.currentTarget.style.color = theme.textMain;
                                e.currentTarget.style.boxShadow = "none";
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "18px",
                                  filter: "grayscale(100%)",
                                  opacity: 0.8,
                                }}
                              >
                                {cat.icon}
                              </span>
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    {step === "subcategories" && (
                      <>
                        <p
                          style={{
                            marginBottom: "16px",
                            fontSize: "15px",
                            color: theme.textMain,
                          }}
                        >
                          Topics under{" "}
                          <strong style={{ fontWeight: "600" }}>
                            {selectedCategory?.name}
                          </strong>
                        </p>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          {subcategories.map((sub) => (
                            <button
                              key={sub._id}
                              onClick={() => handleSubcategoryClick(sub)}
                              style={{
                                textAlign: "left",
                                padding: "14px 16px",
                                backgroundColor: theme.white,
                                color: theme.textMain,
                                borderRadius: "12px",
                                border: `1px solid ${theme.border}`,
                                fontWeight: 500,
                                fontSize: "14px",
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor =
                                  theme.highlight;
                                e.currentTarget.style.color = theme.highlight;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor =
                                  theme.border;
                                e.currentTarget.style.color = theme.textMain;
                              }}
                            >
                              {sub.name}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    {step === "articles" && (
                      <>
                        <p
                          style={{
                            marginBottom: "16px",
                            fontSize: "15px",
                            color: theme.textMain,
                          }}
                        >
                          Articles for{" "}
                          <strong style={{ fontWeight: "600" }}>
                            {selectedSubcategory?.name}
                          </strong>
                        </p>
                        {articles.length > 0 ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            {articles.map((article) => (
                              <a
                                key={article._id}
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: "block",
                                  padding: "14px 16px",
                                  color: theme.textMain,
                                  textDecoration: "none",
                                  fontSize: "14px",
                                  border: `1px solid ${theme.border}`,
                                  borderRadius: "12px",
                                  transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor =
                                    theme.highlight;
                                  e.currentTarget.style.color = theme.highlight;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor =
                                    theme.border;
                                  e.currentTarget.style.color = theme.textMain;
                                }}
                              >
                                {article.name}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <div
                            style={{
                              color: theme.textMuted,
                              fontSize: "14px",
                              marginTop: "16px",
                              textAlign: "center",
                              padding: "20px",
                            }}
                          >
                            No articles found for this topic.
                            <br />
                            <button
                              onClick={() => setStep("fallback")}
                              style={{
                                ...btnStyle,
                                marginTop: "20px",
                                backgroundColor: theme.highlight,
                                color: theme.white,
                              }}
                            >
                              Contact Support
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    {(step === "fallback" || step === "articles") && (
                      <div
                        style={{
                          marginTop: "32px",
                          borderTop: `1px solid ${theme.border}`,
                          paddingTop: "24px",
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 16px 0",
                            fontSize: "14px",
                            color: theme.textMuted,
                            textAlign: "center",
                          }}
                        >
                          {step === "articles"
                            ? "Still need help? Our team is here."
                            : "Let's get you connected to support."}
                        </p>
                        <button
                          onClick={() => {
                            setTab("tickets");
                            setIsNew(true);
                          }}
                          style={{
                            ...btnStyle,
                            backgroundColor: theme.white,
                            color: theme.textMain,
                            border: `1px solid ${theme.border}`,
                            width: "100%",
                            padding: "12px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = theme.highlight;
                            e.currentTarget.style.color = theme.highlight;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = theme.border;
                            e.currentTarget.style.color = theme.textMain;
                          }}
                        >
                          Create a Ticket
                        </button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Widget (Orderly) */}
      <AnimatePresence>
        {orderly && !open && !help && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{
              width: "calc(100vw - 32px)",
              maxWidth: "340px",
              backgroundColor: theme.white,
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "16px",
              fontSize: "14px",
              fontFamily: "sans-serif",
              bottom: "124px",
              right: "16px",
              position: "fixed",
              boxShadow: theme.shadowFloat,
              border: `1px solid ${theme.border}`,
              zIndex: 998,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <p
                style={{
                  margin: "0",
                  fontWeight: "600",
                  fontSize: "18px",
                  color: theme.textMain,
                }}
              >
                Hi {username}
              </p>
              <button
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: theme.textMuted,
                  padding: 0,
                }}
                onClick={() => setOrderly(false)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = theme.textMain)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = theme.textMuted)
                }
              >
                <FaTimes />
              </button>
            </div>

            <p
              style={{
                margin: "0 0 16px 0",
                color: theme.textMuted,
                lineHeight: "1.5",
              }}
            >
              I’m{" "}
              <strong style={{ color: theme.textMain, fontWeight: "600" }}>
                Orderly
              </strong>{" "}
              — your assistant for a smoother shipping journey.
            </p>

            {stats && stats.counts.some((s: any) => s.count === 0) ? (
              <>
                <p
                  style={{
                    margin: "0 0 12px 0",
                    color: theme.textMain,
                    fontWeight: "500",
                  }}
                >
                  Your setup checklist:
                </p>
                <ul
                  style={{
                    paddingLeft: "0",
                    margin: 0,
                    listStyle: "none",
                    color: theme.textMuted,
                  }}
                >
                  {stats.counts.map((i: any) => (
                    <li
                      key={i.label}
                      style={{
                        textDecoration: i.count > 0 ? "line-through" : "none",
                        marginBottom: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        opacity: i.count > 0 ? 0.6 : 1,
                      }}
                    >
                      <span
                        style={{
                          color:
                            i.count > 0 ? theme.textMuted : theme.highlight,
                          fontSize: "12px",
                        }}
                      >
                        {i.count > 0 ? "●" : "○"}
                      </span>
                      <span>{i.label}</span>
                    </li>
                  ))}
                </ul>
                <p
                  style={{
                    margin: "16px 0 0 0",
                    color: theme.highlight,
                    fontWeight: "500",
                    fontSize: "13px",
                  }}
                >
                  Let’s check off the remaining tasks.
                </p>
              </>
            ) : (
              <>
                <p
                  style={{
                    margin: "8px 0 0 0",
                    color: theme.textMain,
                    fontWeight: "600",
                  }}
                >
                  Setup complete. Systems are ready.
                </p>
                <p
                  style={{
                    margin: "12px 0 0 0",
                    color: theme.textMuted,
                    fontSize: "13px",
                  }}
                >
                  Let me know if you need help anytime.
                </p>
              </>
            )}

            {/* Seamless, unboxed Gyaan at the bottom */}
            {gyaan?.gyaan && (
              <div
                style={{
                  marginTop: "24px",
                  borderTop: `1px solid ${theme.border}`,
                  paddingTop: "16px",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    color: theme.textMuted,
                    fontStyle: "italic",
                    margin: 0,
                    lineHeight: "1.5",
                  }}
                >
                  💡 "{gyaan?.gyaan}"
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Modal (Custom) */}
      <AnimatePresence>
        {displayImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(4px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
            onClick={() => setDisplayImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                position: "relative",
                maxWidth: "95vw",
                maxHeight: "90vh",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setDisplayImage(null)}
                style={{
                  position: "absolute",
                  top: "-40px",
                  right: "0",
                  background: theme.white,
                  border: `1px solid ${theme.border}`,
                  color: theme.textMain,
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: theme.shadowSubtle,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = theme.highlight)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = theme.textMain)
                }
              >
                <FaTimes />
              </button>
              <img
                src={displayImage}
                alt="Enlarged Attachment"
                style={{
                  maxWidth: "100%",
                  maxHeight: "85vh",
                  borderRadius: "12px",
                  boxShadow: theme.shadowFloat,
                  objectFit: "contain",
                  backgroundColor: theme.white,
                  border: `1px solid ${theme.border}`,
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SupportChatWidget;
