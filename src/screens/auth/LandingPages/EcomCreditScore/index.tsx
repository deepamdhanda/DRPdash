import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Nav,
  Navbar,
  Card,
  Form,
  Accordion,
  Badge,
  Spinner,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Shield,
  TrendingDown,
  BadgeCheck,
  ArrowRight,
  AlertTriangle,
  XCircle,
  Wallet,
  Brain,
  History,
  MapPin,
  Phone,
  Mail,
  Activity,
  Plug,
  Search,
  ShieldCheck,
  BarChart3,
  Zap,
  Globe,
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Rocket,
  Menu,
  X,
  Building,
  User,
  ArrowLeft,
  CheckCircle2,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";

// Color constants
const colors = {
  primaryNavy: "#0a1628",
  primaryDark: "#1a2744",
  accentOrange: "#f97316",
  accentOrangeHover: "#ea580c",
  successGreen: "#22c55e",
  warningYellow: "#eab308",
  dangerRed: "#ef4444",
  textLight: "#f1f5f9",
  textMuted: "#94a3b8",
  textSecondary: "#64748b",
  lightBg: "#f8fafc",
  white: "#ffffff",
  border: "#e2e8f0",
};

// Common styles
const gradients = {
  hero: `linear-gradient(135deg, ${colors.primaryNavy} 0%, ${colors.primaryDark} 100%)`,
  accent: `linear-gradient(135deg, ${colors.accentOrange} 0%, ${colors.accentOrangeHover} 100%)`,
  success: `linear-gradient(135deg, ${colors.successGreen} 0%, #16a34a 100%)`,
  warning: `linear-gradient(135deg, ${colors.warningYellow} 0%, #ca8a04 100%)`,
  danger: `linear-gradient(135deg, ${colors.dangerRed} 0%, #dc2626 100%)`,
  text: `linear-gradient(135deg, ${colors.accentOrange} 0%, #fb923c 100%)`,
};

const TextGradient = ({ children }: { children: React.ReactNode }) => (
  <span style={{
    background: gradients.text,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  }}>{children}</span>
);

// ============ NAVBAR ============
const NavbarSection = () => {
  const [expanded, setExpanded] = useState(false);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) element.scrollIntoView({ behavior: "smooth" });
    setExpanded(false);
  };

  return (
    <Navbar
      expand="lg"
      fixed="top"
      style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        padding: "8px 0",
      }}
    >
      <Container>
        <Navbar.Brand href="#" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ background: gradients.hero, borderRadius: 8, padding: 8 }}>
            <Shield size={20} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 20 }}>OrderzUp</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" onClick={() => setExpanded(!expanded)}>
          {expanded ? <X size={24} /> : <Menu size={24} />}
        </Navbar.Toggle>

        <Navbar.Collapse id="navbar-nav" in={expanded}>
          <Nav style={{ margin: "0 auto" }}>
            {["How It Works", "Benefits", "Testimonials", "FAQ"].map((label) => (
              <Nav.Link
                key={label}
                onClick={() => scrollToSection(`#${label.toLowerCase().replace(/\s+/g, "-")}`)}
                style={{ color: colors.textSecondary, fontWeight: 500, margin: "0 8px", cursor: "pointer" }}
              >
                {label}
              </Nav.Link>
            ))}
          </Nav>
          <div style={{ display: "flex", gap: 8, marginTop: window.innerWidth < 992 ? 16 : 0 }}>
            <Button variant="light" onClick={() => scrollToSection("#credit-checker")}>
              Check Score
            </Button>
            <Button
              style={{ background: gradients.accent, border: "none", color: "white", fontWeight: 600 }}
              onClick={() => scrollToSection("#cta")}
            >
              Book Demo
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

// ============ HERO ============
const HeroSection = () => {
  const scrollToChecker = () => {
    document.querySelector("#credit-checker")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section style={{
      background: gradients.hero,
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      paddingTop: 80,
    }}>
      <Container style={{ padding: "80px 15px" }}>
        <Row style={{ alignItems: "center" }}>
          <Col lg={6} style={{ textAlign: "center", color: "white", marginBottom: 40 }}>
            <div style={{
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              borderRadius: 50,
              padding: "8px 16px",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
            }}>
              <BadgeCheck size={16} color={colors.accentOrange} />
              <span style={{ fontSize: 14 }}>Trusted by 500+ Indian D2C Brands</span>
            </div>

            <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 700, marginBottom: 24, lineHeight: 1.2 }}>
              Reduce RTO by <TextGradient>40%</TextGradient>
              <br />With Smart COD Control
            </h1>

            <p style={{ fontSize: 18, opacity: 0.75, marginBottom: 24, maxWidth: 500 }}>
              Our Ecommerce Credit Score tells you which customers deserve COD
              and which don't. Stop losing money on fake orders and courier penalties.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 24 }}>
              <Button
                size="lg"
                style={{ background: gradients.accent, border: "none", color: "white", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}
                onClick={scrollToChecker}
              >
                Check Customer Score <ArrowRight size={18} />
              </Button>
              <Button variant="outline-light" size="lg">
                Watch Demo
              </Button>
            </div>

            <div style={{ display: "flex", gap: 24, justifyContent: "center", opacity: 0.75 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                <Shield size={16} /> Data Secured
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                <TrendingDown size={16} /> Reduce RTO
              </span>
            </div>
          </Col>

          <Col lg={6} className="d-none d-lg-block">
            <div style={{ position: "relative" }}>
              <Card style={{
                background: "white",
                borderRadius: 16,
                boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                padding: 24,
                border: "none",
              }}>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <div style={{
                    background: gradients.success,
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 16,
                    width: 80,
                    height: 80,
                    marginBottom: 16,
                    animation: "float 3s ease-in-out infinite",
                  }}>
                    <Shield size={40} color="white" />
                  </div>
                  <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Credit Score: 847</h3>
                  <p style={{ color: colors.successGreen, fontWeight: 600, margin: 0 }}>Excellent - Safe for COD</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Order History", value: "98% Delivered" },
                    { label: "Risk Level", value: "Low Risk", success: true },
                    { label: "Recommendation", value: "Allow COD ✓" },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: colors.lightBg,
                      borderRadius: 8,
                      padding: 12,
                    }}>
                      <span style={{ color: colors.textSecondary }}>{item.label}</span>
                      <span style={{ fontWeight: 600, color: item.success ? colors.successGreen : "inherit" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Badge style={{
                position: "absolute",
                top: -10,
                right: -10,
                background: gradients.accent,
                color: "white",
                padding: "8px 16px",
                borderRadius: 20,
                animation: "float 3s ease-in-out infinite",
              }}>
                Live Preview
              </Badge>
            </div>

            <Row style={{ marginTop: 24 }}>
              {[
                { value: "40%", label: "Average RTO Reduction" },
                { value: "2.5L+", label: "Orders Analyzed" },
                { value: "500+", label: "D2C Brands Trust Us" },
              ].map((stat, i) => (
                <Col key={i}>
                  <div style={{
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 12,
                    padding: 16,
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 0 }}>{stat.value}</div>
                    <small style={{ opacity: 0.75 }}>{stat.label}</small>
                  </div>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  );
};

// ============ PROBLEM SECTION ============
const ProblemSection = () => {
  const problems = [
    { icon: AlertTriangle, title: "High RTO Rates", description: "30-40% of COD orders get returned, eating into your profits.", stat: "₹2,500 Cr+", statLabel: "Lost to RTO yearly" },
    { icon: XCircle, title: "Fake Orders", description: "Pranksters and competitors placing fake orders.", stat: "15%", statLabel: "Orders are fraudulent" },
    { icon: Wallet, title: "Courier Penalties", description: "You pay both forward and return shipping.", stat: "₹150+", statLabel: "Lost per RTO order" },
    { icon: TrendingDown, title: "Cash Flow Block", description: "COD remittance takes 7-14 days.", stat: "21 Days", statLabel: "Average cash cycle" },
  ];

  return (
    <section style={{ padding: "80px 0" }}>
      <Container>
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
          <Badge style={{ background: colors.warningYellow, color: "#1a1a1a", marginBottom: 16, textTransform: "uppercase", fontSize: 12 }}>
            The Problem
          </Badge>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, marginBottom: 16 }}>
            COD is Killing Your <TextGradient>Profit Margins</TextGradient>
          </h2>
          <p style={{ color: colors.textSecondary }}>
            Indian D2C brands lose crores every year to RTO. You're offering COD to everyone without knowing who's trustworthy.
          </p>
        </div>

        <Row>
          {problems.map((problem, i) => (
            <Col md={6} lg={3} key={i} style={{ marginBottom: 24 }}>
              <Card style={{
                height: "100%",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; }}
              >
                <Card.Body style={{ padding: 24 }}>
                  <div style={{
                    background: `${colors.dangerRed}15`,
                    borderRadius: 12,
                    padding: 12,
                    display: "inline-block",
                    marginBottom: 16,
                  }}>
                    <problem.icon size={24} color={colors.dangerRed} />
                  </div>
                  <h5 style={{ fontWeight: 700, marginBottom: 8 }}>{problem.title}</h5>
                  <p style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 16 }}>{problem.description}</p>
                  <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 16 }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: colors.dangerRed, marginBottom: 0 }}>{problem.stat}</div>
                    <small style={{ color: colors.textSecondary }}>{problem.statLabel}</small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <div style={{ background: colors.lightBg, borderRadius: 16, padding: 24, display: "inline-block", maxWidth: 600 }}>
            <p style={{ fontSize: 18, marginBottom: 8 }}>
              "We were offering COD to everyone. Our RTO was 35%. We didn't know which customers were risky."
            </p>
            <small style={{ color: colors.textSecondary }}>— Every D2C founder before using OrderzUp</small>
          </div>
        </div>
      </Container>
    </section>
  );
};

// ============ SOLUTION SECTION ============
const SolutionSection = () => {
  const factors = [
    { icon: History, title: "Order History", description: "Past delivery success rate across D2C brands" },
    { icon: MapPin, title: "Pincode Analysis", description: "RTO patterns in customer's area" },
    { icon: Phone, title: "Phone Verification", description: "Phone number age and spam signals" },
    { icon: Activity, title: "Behavioral Signals", description: "Purchase patterns and session behavior" },
  ];

  return (
    <section style={{ padding: "80px 0", background: colors.lightBg }}>
      <Container>
        <Row style={{ alignItems: "center" }}>
          <Col lg={6} style={{ marginBottom: 48 }}>
            <Badge style={{ background: colors.warningYellow, color: "#1a1a1a", marginBottom: 16, textTransform: "uppercase", fontSize: 12 }}>
              The Solution
            </Badge>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, marginBottom: 16 }}>
              Introducing <TextGradient>Ecommerce Credit Score</TextGradient>
            </h2>
            <p style={{ color: colors.textSecondary, marginBottom: 24 }}>
              Think of it like a CIBIL score, but for ecommerce. We analyze multiple data points to tell you if a customer is safe for COD.
            </p>

            <Card style={{ border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", marginBottom: 24 }}>
              <Card.Body style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: 20 }}>
                <div style={{ background: gradients.hero, borderRadius: 12, padding: 12 }}>
                  <Brain size={28} color="white" />
                </div>
                <div>
                  <h5 style={{ fontWeight: 700, marginBottom: 4 }}>Smart Scoring</h5>
                  <p style={{ color: colors.textSecondary, fontSize: 14, margin: 0 }}>
                    AI-powered risk assessment analyzing <strong>15+ signals</strong> in real-time.
                  </p>
                </div>
              </Card.Body>
            </Card>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { color: colors.successGreen, bg: `${colors.successGreen}15`, text: "Score 750+ → Allow Full COD" },
                { color: colors.warningYellow, bg: `${colors.warningYellow}25`, text: "Score 500-750 → Partial COD" },
                { color: colors.dangerRed, bg: `${colors.dangerRed}15`, text: "Score <500 → Prepaid Only" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  background: item.bg,
                  borderRadius: 8,
                  border: `1px solid ${item.color}40`,
                }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: item.color }} />
                  <span style={{ fontWeight: 500 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </Col>

          <Col lg={6}>
            <Row>
              {factors.map((factor, i) => (
                <Col sm={6} key={i} style={{ marginBottom: 16 }}>
                  <Card style={{
                    height: "100%",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <Card.Body style={{ padding: 20 }}>
                      <div style={{
                        background: "#3b82f615",
                        borderRadius: 8,
                        padding: 8,
                        display: "inline-block",
                        marginBottom: 12,
                      }}>
                        <factor.icon size={20} color="#3b82f6" />
                      </div>
                      <h6 style={{ fontWeight: 700, marginBottom: 4 }}>{factor.title}</h6>
                      <small style={{ color: colors.textSecondary }}>{factor.description}</small>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            <div style={{
              background: gradients.hero,
              borderRadius: 16,
              padding: 24,
              textAlign: "center",
              color: "white",
              marginTop: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                <Shield size={28} />
                <span style={{ fontSize: 32, fontWeight: 700 }}>15+</span>
              </div>
              <p style={{ opacity: 0.75, margin: 0 }}>Data signals analyzed per customer in real-time</p>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

// ============ CREDIT SCORE CHECKER ============
const CreditScoreChecker = () => {
  type Step = "customer" | "business" | "result";

  const [step, setStep] = useState<Step>("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [customerData, setCustomerData] = useState({ phone: "", pincode: "", email: "" });
  const [businessData, setBusinessData] = useState({ brandName: "", yourName: "", email: "", phone: "", orderVolume: "" });
  const [result, setResult] = useState<{ score: number; risk: "low" | "medium" | "high"; recommendation: string; message: string } | null>(null);

  const handleCustomerSubmit = () => {
    if (!customerData.phone || !customerData.pincode) return;
    setStep("business");
  };

  const handleBusinessSubmit = () => {
    if (!businessData.brandName || !businessData.email || !businessData.phone) return;
    setIsLoading(true);

    setTimeout(() => {
      const pincodeNum = parseInt(customerData.pincode.slice(0, 3)) || 500;
      const score = Math.min(900, Math.max(300, 600 + (pincodeNum % 300)));

      let risk: "low" | "medium" | "high", recommendation: string, message: string;
      if (score >= 750) {
        risk = "low"; recommendation = "Allow Full COD"; message = "This customer has excellent delivery history. Safe for COD orders.";
      } else if (score >= 500) {
        risk = "medium"; recommendation = "Partial COD (50%)"; message = "Moderate risk. Recommend partial payment upfront.";
      } else {
        risk = "high"; recommendation = "Prepaid Only"; message = "High-risk customer. Multiple RTO signals detected.";
      }

      setResult({ score, risk, recommendation, message });
      setIsLoading(false);
      setStep("result");
    }, 2000);
  };

  const resetChecker = () => {
    setStep("customer");
    setCustomerData({ phone: "", pincode: "", email: "" });
    setBusinessData({ brandName: "", yourName: "", email: "", phone: "", orderVolume: "" });
    setResult(null);
  };

  const getRiskColor = (risk: string) => risk === "low" ? colors.successGreen : risk === "medium" ? colors.warningYellow : colors.dangerRed;
  const getRiskGradient = (risk: string) => risk === "low" ? gradients.success : risk === "medium" ? gradients.warning : gradients.danger;
  const getRiskIcon = (risk: string) => risk === "low" ? CheckCircle2 : risk === "medium" ? AlertTriangle : XCircle;

  const steps = ["customer", "business", "result"];
  const currentIndex = steps.indexOf(step);

  return (
    <section id="credit-checker" style={{ padding: "80px 0" }}>
      <Container>
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 40px" }}>
          <Badge style={{ background: colors.warningYellow, color: "#1a1a1a", marginBottom: 16, textTransform: "uppercase", fontSize: 12 }}>
            Try It Now
          </Badge>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, marginBottom: 16 }}>
            Check Your Customer's <TextGradient>Credit Score</TextGradient>
          </h2>
          <p style={{ color: colors.textSecondary }}>Enter customer details below to see their ecommerce credit score instantly.</p>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, maxWidth: 400, margin: "0 auto 32px" }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                background: step === s ? gradients.accent : currentIndex > i ? colors.successGreen : colors.lightBg,
                color: step === s || currentIndex > i ? "white" : colors.textSecondary,
              }}>
                {i + 1}
              </div>
              {i < 2 && (
                <div style={{
                  width: 60,
                  height: 4,
                  borderRadius: 2,
                  margin: "0 8px",
                  background: currentIndex > i ? colors.successGreen : colors.border,
                }} />
              )}
            </div>
          ))}
        </div>

        <Card style={{ border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", maxWidth: 500, margin: "0 auto" }}>
          <Card.Body style={{ padding: 32 }}>
            {step === "customer" && (
              <>
                <h5 style={{ fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                  <User size={20} color={colors.warningYellow} /> Customer Details
                </h5>
                <Form.Group style={{ marginBottom: 16 }}>
                  <Form.Label>Phone Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter 10-digit phone"
                    maxLength={10}
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                  />
                </Form.Group>
                <Form.Group style={{ marginBottom: 16 }}>
                  <Form.Label>Pincode *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                    value={customerData.pincode}
                    onChange={(e) => setCustomerData({ ...customerData, pincode: e.target.value })}
                  />
                </Form.Group>
                <Form.Group style={{ marginBottom: 24 }}>
                  <Form.Label>Email (Optional)</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="customer@email.com"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  />
                </Form.Group>
                <Button
                  style={{ width: "100%", background: gradients.accent, border: "none", color: "white", fontWeight: 600, padding: "12px 24px" }}
                  onClick={handleCustomerSubmit}
                  disabled={!customerData.phone || !customerData.pincode}
                >
                  Next: Enter Your Details <ArrowRight size={16} style={{ marginLeft: 8 }} />
                </Button>
              </>
            )}

            {step === "business" && !isLoading && (
              <>
                <h5 style={{ fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                  <Building size={20} color={colors.warningYellow} /> Your Business Details
                </h5>
                <Form.Group style={{ marginBottom: 16 }}>
                  <Form.Label>Brand Name *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Your brand name"
                    value={businessData.brandName}
                    onChange={(e) => setBusinessData({ ...businessData, brandName: e.target.value })}
                  />
                </Form.Group>
                <Form.Group style={{ marginBottom: 16 }}>
                  <Form.Label>Your Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Your full name"
                    value={businessData.yourName}
                    onChange={(e) => setBusinessData({ ...businessData, yourName: e.target.value })}
                  />
                </Form.Group>
                <Form.Group style={{ marginBottom: 16 }}>
                  <Form.Label>Business Email *</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="you@yourbrand.com"
                    value={businessData.email}
                    onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                  />
                </Form.Group>
                <Form.Group style={{ marginBottom: 16 }}>
                  <Form.Label>Phone Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Your contact number"
                    maxLength={10}
                    value={businessData.phone}
                    onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                  />
                </Form.Group>
                <Form.Group style={{ marginBottom: 24 }}>
                  <Form.Label>Monthly Order Volume</Form.Label>
                  <Form.Select
                    value={businessData.orderVolume}
                    onChange={(e) => setBusinessData({ ...businessData, orderVolume: e.target.value })}
                  >
                    <option value="">Select volume</option>
                    <option value="0-500">0 - 500 orders</option>
                    <option value="500-2000">500 - 2,000 orders</option>
                    <option value="2000-10000">2,000 - 10,000 orders</option>
                    <option value="10000+">10,000+ orders</option>
                  </Form.Select>
                </Form.Group>
                <div style={{ display: "flex", gap: 12 }}>
                  <Button
                    variant="outline-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setStep("customer")}
                  >
                    <ArrowLeft size={16} style={{ marginRight: 8 }} /> Back
                  </Button>
                  <Button
                    style={{ flex: 1, background: gradients.accent, border: "none", color: "white", fontWeight: 600 }}
                    onClick={handleBusinessSubmit}
                    disabled={!businessData.brandName || !businessData.email || !businessData.phone}
                  >
                    Get Score <ArrowRight size={16} style={{ marginLeft: 8 }} />
                  </Button>
                </div>
              </>
            )}

            {isLoading && (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{
                  background: gradients.accent,
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 64,
                  height: 64,
                  marginBottom: 16,
                }}>
                  <Spinner animation="border" variant="light" />
                </div>
                <h5 style={{ fontWeight: 700, marginBottom: 4 }}>Analyzing Customer...</h5>
                <p style={{ color: colors.textSecondary }}>Checking 15+ data signals</p>
              </div>
            )}

            {step === "result" && result && !isLoading && (
              <div style={{ textAlign: "center" }}>
                <div style={{ position: "relative", display: "inline-block", marginBottom: 24, width: 160, height: 160 }}>
                  <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="80" cy="80" r="70" fill="none" stroke={colors.border} strokeWidth="12" />
                    <circle
                      cx="80" cy="80" r="70" fill="none"
                      stroke={getRiskColor(result.risk)}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={440}
                      strokeDashoffset={440 - (result.score / 900) * 440}
                    />
                  </svg>
                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}>
                    <span style={{ fontSize: 36, fontWeight: 700 }}>{result.score}</span>
                    <br /><small style={{ color: colors.textSecondary }}>out of 900</small>
                  </div>
                </div>

                <Badge style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  background: getRiskColor(result.risk),
                  color: "white",
                  padding: "8px 16px",
                  marginBottom: 16,
                  borderRadius: 20,
                }}>
                  {(() => { const Icon = getRiskIcon(result.risk); return <Icon size={16} />; })()}
                  {result.risk.charAt(0).toUpperCase() + result.risk.slice(1)} Risk
                </Badge>

                <div style={{
                  background: getRiskGradient(result.risk),
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                }}>
                  <p style={{ fontWeight: 700, color: "white", margin: 0 }}>{result.recommendation}</p>
                </div>

                <p style={{ color: colors.textSecondary, marginBottom: 24 }}>{result.message}</p>

                <Button
                  style={{ width: "100%", background: gradients.accent, border: "none", color: "white", fontWeight: 600, padding: "12px 24px", marginBottom: 8 }}
                  onClick={() => document.querySelector("#cta")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Get Full Access - Book Demo
                </Button>
                <Button variant="outline-secondary" style={{ width: "100%" }} onClick={resetChecker}>
                  Check Another Customer
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>

        <p style={{ textAlign: "center", color: colors.textSecondary, fontSize: 14, marginTop: 16 }}>
          🔒 Your data is secure and never shared with third parties
        </p>
      </Container>
    </section>
  );
};

// ============ HOW IT WORKS ============
const HowItWorksSection = () => {
  const steps = [
    { icon: Plug, number: "01", title: "Connect Your Store", description: "Simple one-click integration with Shopify, WooCommerce, or custom platform." },
    { icon: Search, number: "02", title: "We Score Every Customer", description: "At checkout, we instantly analyze and return their ecommerce credit score." },
    { icon: ShieldCheck, number: "03", title: "Smart COD Control", description: "Based on the score, your store shows COD, Partial COD, or Prepaid only." },
  ];

  return (
    <section id="how-it-works" style={{ padding: "80px 0" }}>
      <Container>
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
          <Badge style={{ background: colors.warningYellow, color: "#1a1a1a", marginBottom: 16, textTransform: "uppercase", fontSize: 12 }}>
            How It Works
          </Badge>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, marginBottom: 16 }}>
            Get Started in <TextGradient>3 Simple Steps</TextGradient>
          </h2>
          <p style={{ color: colors.textSecondary }}>No technical expertise needed. Integration is fast.</p>
        </div>

        <Row style={{ position: "relative" }}>
          <div style={{
            display: window.innerWidth >= 992 ? "block" : "none",
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 2,
            background: colors.border,
            transform: "translateY(-50%)",
            zIndex: 0,
          }} />
          {steps.map((step, i) => (
            <Col md={4} key={i} style={{ marginBottom: 24 }}>
              <Card style={{
                height: "100%",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                position: "relative",
                zIndex: 1,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <Badge style={{
                  position: "absolute",
                  top: -8,
                  left: 24,
                  background: gradients.accent,
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: 6,
                }}>
                  {step.number}
                </Badge>
                <Card.Body style={{ padding: 24, paddingTop: 40 }}>
                  <div style={{ background: gradients.hero, borderRadius: 12, padding: 12, display: "inline-block", marginBottom: 16 }}>
                    <step.icon size={28} color="white" />
                  </div>
                  <h5 style={{ fontWeight: 700, marginBottom: 8 }}>{step.title}</h5>
                  <p style={{ color: colors.textSecondary, margin: 0 }}>{step.description}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <div style={{
            background: colors.lightBg,
            borderRadius: 16,
            padding: 24,
            display: "inline-flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 16,
          }}>
            <span style={{ fontWeight: 500 }}>Ready to reduce your RTO?</span>
            <Button
              style={{ background: gradients.accent, border: "none", color: "white", fontWeight: 600 }}
              onClick={() => document.querySelector("#credit-checker")?.scrollIntoView({ behavior: "smooth" })}
            >
              Try Free Score Check
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
};

// ============ BENEFITS ============
const BenefitsSection = () => {
  const benefits = [
    { icon: TrendingDown, title: "Reduce RTO by 40%", description: "Block risky customers from COD.", color: colors.successGreen },
    { icon: Wallet, title: "Save ₹150+ Per Order", description: "Stop paying double shipping on failed deliveries.", color: colors.warningYellow },
    { icon: BarChart3, title: "Better Cash Flow", description: "More prepaid orders = faster remittance.", color: "#3b82f6" },
    { icon: Shield, title: "Block Fake Orders", description: "Our AI detects fraud patterns.", color: colors.successGreen },
    { icon: Zap, title: "Real-Time Scoring", description: "Scores calculated in <200ms.", color: colors.warningYellow },
    { icon: Globe, title: "Pan-India Coverage", description: "19,000+ serviceable pincodes in India.", color: "#3b82f6" },
  ];

  return (
    <section id="benefits" style={{ padding: "80px 0", background: colors.lightBg }}>
      <Container>
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
          <Badge style={{ background: colors.warningYellow, color: "#1a1a1a", marginBottom: 16, textTransform: "uppercase", fontSize: 12 }}>
            Benefits
          </Badge>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, marginBottom: 16 }}>
            Why D2C Brands <TextGradient>Love OrderzUp</TextGradient>
          </h2>
          <p style={{ color: colors.textSecondary }}>Join 500+ brands who've transformed their COD strategy.</p>
        </div>

        <Row style={{ marginBottom: 48 }}>
          {benefits.map((benefit, i) => (
            <Col md={6} lg={4} key={i} style={{ marginBottom: 24 }}>
              <Card style={{
                height: "100%",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <Card.Body style={{ padding: 24 }}>
                  <div style={{
                    background: `${benefit.color}15`,
                    borderRadius: 8,
                    padding: 8,
                    display: "inline-block",
                    marginBottom: 16,
                  }}>
                    <benefit.icon size={24} color={benefit.color} />
                  </div>
                  <h5 style={{ fontWeight: 700, marginBottom: 8 }}>{benefit.title}</h5>
                  <p style={{ color: colors.textSecondary, fontSize: 14, margin: 0 }}>{benefit.description}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ background: gradients.hero, borderRadius: 16, padding: "32px 24px" }}>
          <Row style={{ textAlign: "center", color: "white" }}>
            {[
              { value: "40%", label: "RTO Reduction" },
              { value: "500+", label: "Brands Trust Us" },
              { value: "2.5L+", label: "Orders Analyzed" },
              { value: "₹150+", label: "Saved Per RTO" },
            ].map((stat, i) => (
              <Col xs={6} lg={3} key={i} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 0 }}>{stat.value}</div>
                <small style={{ opacity: 0.75 }}>{stat.label}</small>
              </Col>
            ))}
          </Row>
        </div>
      </Container>
    </section>
  );
};

// ============ TESTIMONIALS ============
const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    { name: "Rahul Sharma", role: "Founder", company: "StyleBox India", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", content: "Our RTO dropped from 35% to 18% in just 2 months. OrderzUp pays for itself 10x over.", stats: { before: "35%", after: "18%", metric: "RTO Rate" } },
    { name: "Priya Patel", role: "Co-founder", company: "GlowUp Cosmetics", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face", content: "We were bleeding money on fake orders. OrderzUp blocked 90% of fraudulent attempts.", stats: { before: "90%", after: "Blocked", metric: "Fake Orders" } },
    { name: "Amit Kumar", role: "CEO", company: "FitGear Pro", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face", content: "Integration took 10 minutes. The ROI was visible in the first week itself. We save ₹2L+ monthly.", stats: { before: "₹2L+", after: "Saved", metric: "Monthly" } },
    { name: "Sneha Reddy", role: "Operations Head", company: "HomeDeco Hub", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face", content: "The partial COD feature is genius. Conversion stayed the same but RTO dropped significantly.", stats: { before: "Same", after: "CVR", metric: "Maintained" } },
  ];

  return (
    <section id="testimonials" style={{ padding: "80px 0" }}>
      <Container>
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
          <Badge style={{ background: colors.warningYellow, color: "#1a1a1a", marginBottom: 16, textTransform: "uppercase", fontSize: 12 }}>
            Testimonials
          </Badge>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, marginBottom: 16 }}>
            Trusted by <TextGradient>500+ D2C Brands</TextGradient>
          </h2>
          <p style={{ color: colors.textSecondary }}>See what founders are saying about OrderzUp.</p>
        </div>

        <Card style={{ border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", maxWidth: 800, margin: "0 auto", position: "relative" }}>
          <Quote size={48} color={colors.warningYellow} style={{ position: "absolute", top: 20, right: 20, opacity: 0.25 }} />
          <Card.Body style={{ padding: "32px 40px" }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={20} color={colors.warningYellow} fill={colors.accentOrange} />)}
            </div>

            <p style={{ fontSize: 20, fontWeight: 500, marginBottom: 24 }}>"{testimonials[activeIndex].content}"</p>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <img
                  src={testimonials[activeIndex].image}
                  alt={testimonials[activeIndex].name}
                  style={{ width: 56, height: 56, borderRadius: "50%", border: `2px solid ${colors.warningYellow}`, objectFit: "cover" }}
                />
                <div>
                  <h6 style={{ fontWeight: 700, margin: 0 }}>{testimonials[activeIndex].name}</h6>
                  <small style={{ color: colors.textSecondary }}>{testimonials[activeIndex].role}, {testimonials[activeIndex].company}</small>
                </div>
              </div>

              <div style={{ background: `${colors.successGreen}15`, borderRadius: 12, padding: 16, textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: colors.successGreen }}>{testimonials[activeIndex].stats.before}</span>
                  <span style={{ color: colors.textSecondary }}>→</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: colors.successGreen }}>{testimonials[activeIndex].stats.after}</span>
                </div>
                <small style={{ color: colors.textSecondary }}>{testimonials[activeIndex].stats.metric}</small>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 24, borderTop: `1px solid ${colors.border}` }}>
              <div style={{ display: "flex", gap: 8 }}>
                {testimonials.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    style={{
                      width: i === activeIndex ? 32 : 8,
                      height: 8,
                      borderRadius: 4,
                      background: i === activeIndex ? colors.accentOrange : "#cbd5e1",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  variant="light"
                  style={{ borderRadius: "50%", width: 40, height: 40, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                  onClick={() => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                >
                  <ChevronLeft size={20} />
                </Button>
                <Button
                  variant="light"
                  style={{ borderRadius: "50%", width: 40, height: 40, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                  onClick={() => setActiveIndex((prev) => (prev + 1) % testimonials.length)}
                >
                  <ChevronRight size={20} />
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <p style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 16 }}>Trusted by leading D2C brands across India</p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 32, opacity: 0.5 }}>
            {["StyleBox", "GlowUp", "FitGear", "HomeDeco", "UrbanWear", "NutriFit"].map((brand) => (
              <span key={brand} style={{ fontSize: 20, fontWeight: 700, color: colors.textSecondary }}>{brand}</span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

// ============ CTA SECTION ============
const CTASection = () => {
  return (
    <section id="cta" style={{ padding: "80px 0", background: gradients.hero, position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 400,
        height: 400,
        background: colors.warningYellow,
        opacity: 0.1,
        borderRadius: "50%",
        filter: "blur(80px)",
      }} />
      <div style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 300,
        height: 300,
        background: "white",
        opacity: 0.1,
        borderRadius: "50%",
        filter: "blur(80px)",
      }} />

      <Container style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", color: "white", maxWidth: 800, margin: "0 auto" }}>
          <Badge style={{ background: colors.warningYellow, color: "#1a1a1a", marginBottom: 16, textTransform: "uppercase", fontSize: 12 }}>
            Get Started Today
          </Badge>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, marginBottom: 16 }}>
            Ready to Reduce Your <TextGradient>RTO by 40%?</TextGradient>
          </h2>
          <p style={{ fontSize: 18, opacity: 0.75, marginBottom: 48, maxWidth: 600, margin: "0 auto 48px" }}>
            Join 500+ D2C brands who trust OrderzUp for smarter COD decisions.
          </p>

          <Row style={{ maxWidth: 600, margin: "0 auto 48px" }}>
            <Col md={6} style={{ marginBottom: 24 }}>
              <Card style={{ height: "100%", border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", textAlign: "left" }}>
                <Card.Body style={{ padding: 24 }}>
                  <div style={{ background: gradients.accent, borderRadius: 12, padding: 12, display: "inline-block", marginBottom: 16 }}>
                    <Calendar size={24} color="white" />
                  </div>
                  <h5 style={{ fontWeight: 700, marginBottom: 8 }}>Book Free Demo</h5>
                  <p style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 16 }}>See OrderzUp in action. 30-minute call.</p>
                  <Button style={{ width: "100%", background: gradients.accent, border: "none", color: "white", fontWeight: 600 }}>
                    Schedule Demo <ArrowRight size={16} style={{ marginLeft: 8 }} />
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} style={{ marginBottom: 24 }}>
              <Card style={{ height: "100%", border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", textAlign: "left" }}>
                <Card.Body style={{ padding: 24 }}>
                  <div style={{ background: gradients.hero, borderRadius: 12, padding: 12, display: "inline-block", marginBottom: 16 }}>
                    <Rocket size={24} color="white" />
                  </div>
                  <h5 style={{ fontWeight: 700, marginBottom: 8 }}>Start Free Trial</h5>
                  <p style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 16 }}>Try OrderzUp free for 14 days.</p>
                  <Button
                    variant="outline-dark"
                    style={{ width: "100%" }}
                    onClick={() => document.querySelector("#credit-checker")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Start Free Trial <ArrowRight size={16} style={{ marginLeft: 8 }} />
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 32, opacity: 0.75 }}>
            {[
              { icon: Shield, text: "Data Encrypted" },
              { icon: Calendar, text: "No Long Contracts" },
              { icon: Rocket, text: "Setup in 5 mins" },
            ].map((item, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                <item.icon size={16} /> {item.text}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

// ============ FAQ ============
const FAQSection = () => {
  const faqs = [
    { question: "Is collecting customer data for credit scoring legal?", answer: "Yes, absolutely. We only use publicly available data signals and comply with all Indian data protection laws." },
    { question: "Will this affect my conversion rate?", answer: "Most brands see no drop—many see improvement. High-risk customers can still buy with prepaid." },
    { question: "How accurate is the credit score?", answer: "Our model has 85%+ accuracy in predicting RTO risk, analyzing 15+ data signals." },
    { question: "Does OrderzUp work with Shopify and WooCommerce?", answer: "Yes! We have native apps for both that install in under 5 minutes." },
    { question: "What if a good customer gets a low score?", answer: "Our partial COD feature handles this—medium-risk customers pay 50% upfront." },
    { question: "How much does OrderzUp cost?", answer: "Plans start at ₹2,999/month for up to 1,000 orders. Most brands see 10x+ ROI." },
    { question: "Can I customize the score thresholds?", answer: "Yes! You have full control over what score triggers each payment option." },
    { question: "How long does integration take?", answer: "For Shopify and WooCommerce, less than 5 minutes. Custom platforms: 1-2 days." },
  ];

  return (
    <section id="faq" style={{ padding: "80px 0", background: colors.lightBg }}>
      <Container>
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
          <Badge style={{ background: colors.warningYellow, color: "#1a1a1a", marginBottom: 16, textTransform: "uppercase", fontSize: 12 }}>
            FAQ
          </Badge>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, marginBottom: 16 }}>
            Frequently Asked <TextGradient>Questions</TextGradient>
          </h2>
          <p style={{ color: colors.textSecondary }}>Everything you need to know about OrderzUp.</p>
        </div>

        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <Accordion flush>
            {faqs.map((faq, i) => (
              <Accordion.Item key={i} eventKey={String(i)} style={{ marginBottom: 12, border: `1px solid ${colors.border}`, borderRadius: 8, overflow: "hidden" }}>
                <Accordion.Header style={{ fontWeight: 600 }}>{faq.question}</Accordion.Header>
                <Accordion.Body style={{ color: colors.textSecondary }}>{faq.answer}</Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <p style={{ color: colors.textSecondary, marginBottom: 8 }}>Still have questions?</p>
          <a href="mailto:hello@orderzup.com" style={{ color: colors.warningYellow, fontWeight: 600, textDecoration: "none" }}>
            Contact our team →
          </a>
        </div>
      </Container>
    </section>
  );
};

// ============ FOOTER ============
const FooterSection = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    product: ["How It Works", "Benefits", "Pricing", "API Docs"],
    company: ["About Us", "Careers", "Blog", "Press"],
    support: ["Help Center", "Contact Us", "Status", "FAQ"],
    legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"],
  };

  return (
    <footer style={{ background: colors.primaryNavy, color: colors.textLight, padding: "80px 0" }}>
      <Container>
        <Row style={{ marginBottom: 48 }}>
          <Col lg={4} style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ background: gradients.accent, borderRadius: 8, padding: 8 }}>
                <Shield size={20} color="white" />
              </div>
              <span style={{ fontSize: 20, fontWeight: 700 }}>OrderzUp</span>
            </div>
            <p style={{ opacity: 0.75, marginBottom: 24, maxWidth: 280 }}>
              Helping D2C brands reduce RTO with smart ecommerce credit scoring.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, opacity: 0.75 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Mail size={16} /> hello@orderzup.com</span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Phone size={16} /> +91 98765 43210</span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}><MapPin size={16} /> Bangalore, India</span>
            </div>
          </Col>

          {Object.entries(links).map(([title, items]) => (
            <Col xs={6} md={3} lg={2} key={title} style={{ marginBottom: 24 }}>
              <h6 style={{ fontWeight: 600, marginBottom: 16, textTransform: "capitalize" }}>{title}</h6>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {items.map((item) => (
                  <li key={item} style={{ marginBottom: 8 }}>
                    <a href="#" style={{ color: "inherit", textDecoration: "none", opacity: 0.75, fontSize: 14 }}>{item}</a>
                  </li>
                ))}
              </ul>
            </Col>
          ))}
        </Row>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          gap: 16,
        }}>
          <small style={{ opacity: 0.75 }}>© {currentYear} OrderzUp. All rights reserved.</small>
          <div style={{ display: "flex", gap: 12 }}>
            {[Twitter, Linkedin, Instagram].map((Icon, i) => (
              <a
                key={i}
                href="#"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "inherit",
                }}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
};

// ============ MAIN PAGE ============
const Index = () => {
  return (
    <>s
      <main style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", backgroundColor: "white" }}>
        <NavbarSection />
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <CreditScoreChecker />
        <HowItWorksSection />
        <BenefitsSection />
        <TestimonialsSection />
        <CTASection />
        <FAQSection />
        <FooterSection />
      </main>
    </>
  );
};

export default Index;
