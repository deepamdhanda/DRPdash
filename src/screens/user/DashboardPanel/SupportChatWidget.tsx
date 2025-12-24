import { useEffect, useState } from "react";
import { FaComments, FaChevronLeft } from "react-icons/fa";
import { fetchGyaan, fetchTopics } from "../../../APIs/user/supportChat";
import { getAccountSummary } from "../../../APIs/user/dashboard";
import { Form, Button, Tabs, Tab, Spinner, Modal } from "react-bootstrap";
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

const SupportChatWidget = () => {
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
  // const [isTicketOpen, setIsTicketOpen] = useState(false)
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
    }
  };

  const onTicketClose = () => {
    // setIsTicketOpen(false)
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
      openReplyScreen(replyTicketId); // Refresh ticket data
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

  // --- UI ---
  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => {
          setOpen(!open);
          setOrderly(false);
        }}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          backgroundColor: "#F5891E",
          color: "#fff",
          padding: "16px",
          borderRadius: "50%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          border: "none",
          cursor: "pointer",
          zIndex: 999,
        }}
      >
        <FaComments size={20} />
      </button>

      {/* Onboarding Widget */}
      {orderly && (
        <div
          style={{
            maxWidth: "320px",
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "16px",
            marginBottom: "16px",
            fontSize: "14px",
            fontFamily: "sans-serif",
            bottom: 40,
            right: 24,
            position: "fixed",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.22)",
            transition: "transform 0.3s ease, opacity 0.3s ease",
            transform: "translateY(0%)",
            opacity: 1,
            zIndex: 998,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>
              <span style={{ fontSize: "24px" }}>👋</span> Hi {username}!
            </p>
            <button
              style={{ border: "none", background: "#fff", cursor: "pointer" }}
              onClick={() => {
                setOrderly(false);
              }}
            >
              X
            </button>
          </div>
          <p style={{ margin: "0 0 4px 0" }}>
            I’m <strong>Orderly</strong> 💁‍♀️ — your assistant for a smoother
            shipping journey!
          </p>
          {stats && stats.counts.some((s: any) => s.count === 0) ? (
            <>
              <p style={{ margin: "0 0 8px 0" }}>
                Here's your <strong>To-Do List</strong> — you're off to a great
                start 🚀
              </p>
              <ul style={{ paddingLeft: "18px", margin: 0, listStyle: "none" }}>
                {stats.counts.map((i: any) => (
                  <li
                    key={i.label}
                    style={{
                      textDecoration: i.count > 0 ? "line-through" : "none",
                    }}
                  >
                    {i.count > 0 ? "✅" : "⬜️"} {i.label}: {i.count}
                  </li>
                ))}
              </ul>
              <p style={{ margin: "8px 0 0 0", color: "#F5891E" }}>
                You're almost done! Let’s check off the remaining tasks together
                💪
              </p>
            </>
          ) : (
            <>
              <p style={{ margin: "8px 0 0 0" }}>
                🎉 You're all set up! Systems are good to go.
              </p>
              {gyaan?.gyaan && (
                <div
                  style={{
                    backgroundColor: "#fff3e0",
                    border: "2px dashed #F5891E",
                    borderRadius: "12px",
                    color: "#000434",
                    padding: "20px",
                    marginTop: "20px",
                    fontFamily: "Hiragino Maru Gothic ProN W4",
                    boxShadow: "2px 4px 12px rgba(0,0,0,0.1)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "-12px",
                      right: "16px",
                      fontSize: "1.5rem",
                    }}
                  >
                    🤓🧠🔥
                  </div>
                  <h3
                    style={{
                      fontWeight: "bold",
                      marginBottom: "10px",
                      fontSize: "1.4rem",
                    }}
                  >
                    🧠 Aaj Ka Dhamakedaar Gyaan!
                  </h3>
                  <p
                    style={{
                      fontSize: "1.05rem",
                      fontStyle: "italic",
                      lineHeight: "1.6",
                    }}
                  >
                    “{gyaan?.gyaan}”
                  </p>
                  <p
                    style={{
                      marginTop: "12px",
                      fontSize: "0.9rem",
                      color: "#000",
                    }}
                  >
                    💬 Gyaan accha laga? Toh like thoko, share karo aur doston
                    ko bhi enlighten karo! 🚀
                  </p>
                </div>
              )}
              <p style={{ margin: "4px 0 0 0", color: "#000434" }}>
                😄 Let me know if you need help anytime!
              </p>
            </>
          )}
        </div>
      )}

      {/* Main Chat Panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            maxWidth: "380px",
            maxHeight: "80vh",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            overflow: "hidden",
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#000434",
              color: "white",
              padding: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: "bold" }}>👋 Hey, I’m Orderly</span>
            <button
              onClick={() => {
                setOpen(false);
                setIsNew(false);
                setReplyTicketId(null);
                setReplyTicketData(null);
              }}
              style={{
                background: "none",
                color: "white",
                fontSize: "18px",
                border: "none",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <Tabs
            activeKey={tab}
            onSelect={(k) => setTab(k as any)}
            className="mb-2"
            fill
            style={{ background: "#f8f9fa" }}
          >
            <Tab eventKey="tickets" title="Tickets" />
            <Tab eventKey="help" title="Help Center" />
          </Tabs>

          {/* Tab Content */}
          <div
            style={{
              padding: 12,
              overflowY: "auto",
              maxHeight: "calc(80vh - 100px)",
            }}
          >
            {/* Tickets Tab */}
            {tab === "tickets" && (
              <>
                {replyTicketId && replyTicketData ? (
                  <div>
                    <Button
                      size="sm"
                      variant="link"
                      onClick={() => {
                        setReplyTicketId(null);
                        setReplyTicketData(null);
                      }}
                      style={{ paddingLeft: 0 }}
                    >
                      <FaChevronLeft /> Back to Tickets
                    </Button>
                    <h5 className="mt-2">{replyTicketData.subject}</h5>
                    <div className="mb-2 text-muted">
                      <strong>Category:</strong>{" "}
                      {replyTicketData.category?.name} -{" "}
                      {replyTicketData.subcategory?.name}
                    </div>
                    <div className="mb-2">
                      <strong>Status:</strong>{" "}
                      <span
                        className={
                          replyTicketData.status === "open"
                            ? "text-success"
                            : "text-secondary"
                        }
                      >
                        {replyTicketData.status}
                      </span>
                    </div>
                    <div className="mb-2">
                      <strong>Description:</strong>{" "}
                      {replyTicketData.description}
                    </div>
                    <div className="mb-2">
                      <strong>Created:</strong>{" "}
                      {new Date(replyTicketData.createdAt).toLocaleString()}
                    </div>
                    {replyTicketData.attachments &&
                      replyTicketData.attachments.length > 0 && (
                        <div className="mb-2">
                          <strong>Attachments:</strong>
                          <ul>
                            {replyTicketData.attachments.map((url, idx) => (
                              <li
                                key={idx}
                                onClick={() => {
                                  setDisplayImage(url);
                                }}
                              >
                                <img src={url} style={{ width: "50px" }} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    <hr />
                    <div>
                      <strong>Replies:</strong>
                      <div
                        style={{
                          maxHeight: 120,
                          overflowY: "auto",
                          marginBottom: 8,
                        }}
                      >
                        {replyTicketData.replies &&
                        replyTicketData.replies.length > 0 ? (
                          replyTicketData.replies.map((rep, idx) => (
                            <div key={idx} style={{ marginBottom: 10 }}>
                              <div>
                                <span style={{ fontWeight: 500 }}>
                                  {rep.user?.name || "Support"}
                                </span>
                                <span
                                  className="text-muted"
                                  style={{ marginLeft: 8, fontSize: 12 }}
                                >
                                  {new Date(rep.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <div>{rep.message}</div>
                              {rep.attachments &&
                                rep.attachments.length > 0 && (
                                  <div>
                                    {rep.attachments.map((url, i) => (
                                      <a
                                        key={i}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        Attachment {i + 1}
                                      </a>
                                    ))}
                                  </div>
                                )}
                            </div>
                          ))
                        ) : (
                          <div className="text-muted">No replies yet.</div>
                        )}
                      </div>
                      <Form onSubmit={handleReplySubmit}>
                        <Form.Group className="mb-2">
                          <Form.Label>Reply</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Type your reply here..."
                            disabled={replyLoading}
                          />
                        </Form.Group>
                        <Form.Group className="mb-2">
                          <Form.Label>Attachment (optional)</Form.Label>
                          <Form.Control
                            type="file"
                            onChange={(e: any) =>
                              setReplyAttachment(e.target.files?.[0] || null)
                            }
                            disabled={replyLoading}
                          />
                        </Form.Group>
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          disabled={replyLoading}
                        >
                          {replyLoading ? (
                            <Spinner size="sm" animation="border" />
                          ) : (
                            "Send Reply"
                          )}
                        </Button>
                      </Form>
                    </div>
                  </div>
                ) : isNew ? (
                  <Form onSubmit={handleSubmitTicket}>
                    <p>
                      <strong>Category: </strong>
                      <span className="text-primary fw-semibold">
                        {selectedCategory?.name || "N/A"}
                      </span>
                      <span className="text-muted"> → </span>
                      <span className="text-success fw-semibold">
                        {selectedSubcategory?.name || "N/A"}
                      </span>
                    </p>
                    <Form.Group className="mb-3">
                      <Form.Label>Subject</Form.Label>
                      <Form.Control
                        name="subject"
                        type="text"
                        placeholder="Briefly summarize your issue"
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Priority</Form.Label>
                      <Form.Select name="priority" required>
                        <option value="">Select priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Describe your issue or feedback</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="description"
                        rows={4}
                        placeholder="Please describe the issue in detail."
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Attachment (optional)</Form.Label>
                      <Form.Control name="attachment" type="file" />
                    </Form.Group>
                    <Button
                      variant="secondary"
                      onClick={() => setIsNew(false)}
                      className="me-2"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                      Submit Ticket
                    </Button>
                  </Form>
                ) : (
                  <div>
                    <div
                      className="d-flex justify-content-between align-items-center mb-2"
                      style={{ minWidth: "260px" }}
                    >
                      <h6 className="mb-0">Your Tickets</h6>
                      <Button
                        size="sm"
                        onClick={() => {
                          selectedCategory ? setIsNew(true) : setTab("help");
                        }}
                      >
                        + New Ticket
                      </Button>
                    </div>
                    {loadingTickets ? (
                      <div className="text-center py-4">
                        <Spinner animation="border" />
                      </div>
                    ) : tickets.length === 0 ? (
                      <div className="text-center text-muted py-4">
                        No tickets found.
                      </div>
                    ) : (
                      <div style={{ maxHeight: 220, overflowY: "auto" }}>
                        {tickets.map((ticket) => (
                          <div
                            key={ticket._id}
                            className="border rounded p-2 mb-2 bg-light"
                            style={{ cursor: "pointer" }}
                            onClick={() => openReplyScreen(ticket._id)}
                          >
                            <div className="fw-bold">{ticket.subject}</div>
                            <div className="small text-muted">
                              {ticket.category?.name} -{" "}
                              {ticket.subcategory?.name}
                            </div>
                            <div className="small">
                              <span>Status: </span>
                              <span
                                className={
                                  ticket.status === "open"
                                    ? "text-success"
                                    : "text-secondary"
                                }
                              >
                                {ticket.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Help Center Tab */}
            {tab === "help" && (
              <div>
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
                      color: "#666",
                      fontSize: "13px",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <FaChevronLeft style={{ marginRight: "6px" }} /> Back
                  </button>
                )}
                {step === "categories" && (
                  <>
                    <p style={{ marginBottom: "12px" }}>
                      What can I help you with today?
                    </p>
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => handleCategoryClick(cat)}
                        style={{
                          textAlign: "left",
                          padding: "6px 8px",
                          backgroundColor: "#f9f9f9",
                          color: "#333",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          fontWeight: 500,
                          fontSize: "10px",
                          cursor: "pointer",
                          transition: "all 0.2s ease-in-out",
                          alignItems: "center",
                          margin: "6px 6px 6px 0",
                          border: "1px solid #d0dfff",
                          display: "inline-flex",
                          gap: "6px",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#ffe6cc";
                          e.currentTarget.style.color = "#F5891E";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#f9f9f9";
                          e.currentTarget.style.color = "#333";
                        }}
                      >
                        <span style={{ fontSize: "14px" }}>{cat.icon}</span>
                        {cat.name}
                      </button>
                    ))}
                  </>
                )}
                {step === "subcategories" && (
                  <>
                    <p style={{ marginBottom: "12px" }}>
                      Topics under <strong>{selectedCategory?.name}</strong>:
                    </p>
                    {subcategories.map((sub) => (
                      <button
                        key={sub._id}
                        onClick={() => handleSubcategoryClick(sub)}
                        style={{
                          textAlign: "left",
                          padding: "6px 8px",
                          backgroundColor: "#f9f9f9",
                          color: "#333",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          fontWeight: 500,
                          fontSize: "10px",
                          cursor: "pointer",
                          transition: "all 0.2s ease-in-out",
                          alignItems: "center",
                          margin: "6px 6px 6px 0",
                          border: "1px solid #d0dfff",
                          display: "inline-flex",
                          gap: "6px",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#ffe6cc";
                          e.currentTarget.style.color = "#F5891E";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#f9f9f9";
                          e.currentTarget.style.color = "#333";
                        }}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </>
                )}
                {step === "articles" && (
                  <>
                    <p style={{ marginBottom: "12px" }}>
                      Articles under{" "}
                      <strong>{selectedSubcategory?.name}</strong>:
                    </p>
                    {articles.length > 0 ? (
                      articles.map((article) => (
                        <a
                          key={article._id}
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "block",
                            padding: "8px",
                            color: "#0056b3",
                            textDecoration: "none",
                            fontSize: "12px",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          {article.name}
                        </a>
                      ))
                    ) : (
                      <div style={{ color: "#666", fontSize: "13px" }}>
                        😕 No helpful articles found.
                        <br />
                        <button
                          onClick={() => setStep("fallback")}
                          style={{
                            marginTop: "12px",
                            backgroundColor: "#F5891E",
                            color: "white",
                            border: "none",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          Talk to Support
                        </button>
                      </div>
                    )}
                  </>
                )}
                {(step === "fallback" || step === "articles") && (
                  <div>
                    <p style={{ margin: "12px 0", fontSize: "12px" }}>
                      {step === "articles"
                        ? "Still confused? No worries, let’s get you the help you need."
                        : "No worries, we're here to help!"}
                    </p>
                    <Button
                      onClick={() => {
                        setTab("tickets");
                        setIsNew(true);
                      }}
                      style={{
                        backgroundColor: "#000434",
                        color: "white",
                        padding: "6px 12px",
                        width: "100%",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      ✍️ Create a Support Ticket
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          <Modal show={!!displayImage} onHide={() => setDisplayImage(null)}>
            <Modal.Body>
              {displayImage && (
                <img
                  src={displayImage}
                  style={{ width: "100%", maxWidth: "600px" }}
                />
              )}
            </Modal.Body>
          </Modal>
        </div>
      )}
    </>
  );
};

export default SupportChatWidget;
