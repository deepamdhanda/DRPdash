import { useState } from "react";
import type { CSSProperties } from "react";
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
    Building,
    User,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Twitter,
    Linkedin,
    Instagram,
} from "lucide-react";

// Custom CSS for the page (kept as a string so styles are injected inline in the component)
const customStyles = `
  :root {
    --primary-navy: #000434;
    --primary-dark: #191970;
    --accent-orange: #f97316;
    --accent-orange-hover: #ea580c;
    --success-green: #22c55e;
    --warning-yellow: #eab308;
    --danger-red: #ef4444;
    --text-light: #f1f5f9;
    --text-muted: #94a3b8;
    --max-width: 1200px;
  }
  body { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, Roboto, sans-serif; margin:0; padding:0; }
  .btn-accent {
    background: linear-gradient(135deg, var(--accent-orange) 0%, var(--accent-orange-hover) 100%);
    border: none; color: white; font-weight: 600; padding: 12px 20px; border-radius: 10px; cursor:pointer;
  }
  .small-muted { color: #94a3b8; font-size: 14px; }
  .text-gradient { background: linear-gradient(135deg, var(--accent-orange) 0%, #fb923c 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .preview-card { background: white; border-radius: 16px; box-shadow: 0 25px 50px rgba(0,0,0,0.12); padding: 18px; }
  .badge-ghost { background: rgba(255,255,255,0.06); padding:6px 12px; border-radius:999px; display:inline-flex; gap:8px; align-items:center; color:#fff; }
  .floating-badge { animation: float 3s ease-in-out infinite; }
  @keyframes float { 0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);} }
  .stat-card { background: rgba(255,255,255,0.06); padding:12px; border-radius:10px; text-align:center; color:#fff; }
  .section-muted { background: #f8fafc; }
  .footer-custom { background: #000434; color: #f1f5f9; padding: 40px 20px; }
`;
/* Reusable inline style helpers */
const styles: Record<string, CSSProperties> = {
  pageMax: { maxWidth: "1200px", margin: "0 auto", padding: "0 20px" },
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 60,
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(8px)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    padding: "12px 0",
  },
  navInner: { maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" },
  navLinks: { display: "flex", gap: 18, alignItems: "center" },
  hero: { minHeight: "100vh", display: "flex", alignItems: "center", background: "linear-gradient(135deg,#000434 0%,#191970 100%)", color: "#fff", paddingTop: 80 },
  heroLeft: { flex: 1, paddingRight: 28 },
  heroRight: { flex: 1, display: "flex", justifyContent: "center", alignItems: "center" },
  previewCard: { width: 380 },
  section: { padding: "60px 0" },
  centerText: { textAlign: "center" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 },
  cardHover: { borderRadius: 12, padding: 18, background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.06)" },
  formControl: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e6e9ef", fontSize: 16 },
  footerInner: { maxWidth: 1200, margin: "0 auto", padding: "40px 20px" },
};

// ============ NAVBAR ============
const NavbarSection = ({ scrollToSection }: { scrollToSection: (id: string) => void }) => {
  return (
    <div style={styles.navbar}>
      <style>{customStyles}</style>
      <div style={styles.navInner}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", borderRadius: 12, padding: 8 }}>
            <Shield size={20} color="#fff" />
          </div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>OrderzUp</div>
        </div>

        <div style={styles.navLinks} aria-hidden>
          <button onClick={() => scrollToSection("#how-it-works")} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#1f2937", fontWeight: 600 }}>How It Works</button>
          <button onClick={() => scrollToSection("#benefits")} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#1f2937", fontWeight: 600 }}>Benefits</button>
          <button onClick={() => scrollToSection("#testimonials")} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#1f2937", fontWeight: 600 }}>Testimonials</button>
          <button onClick={() => scrollToSection("#faq")} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#1f2937", fontWeight: 600 }}>FAQ</button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => scrollToSection("#credit-checker")} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #e6e9ef", background: "#fff" }}>Check Score</button>
          <button onClick={() => scrollToSection("#cta")} className="btn-accent">Book Demo</button>
        </div>
      </div>
    </div>
  );
};

// ============ HERO ============
const HeroSection = ({ onOpenChecker }: { onOpenChecker: () => void }) => {
  return (
    <section style={styles.hero}>
      <div style={styles.pageMax}>
        <div style={{ display: "flex", gap: 32, alignItems: "center", color: "#fff" }}>
          <div style={styles.heroLeft}>
            <div style={{ display: "inline-flex", gap: 8, alignItems: "center", padding: "8px 12px", borderRadius: 999, background: "rgba(255,255,255,0.06)" }}>
              <BadgeCheck size={16} color="#f97316" />
              <span className="small-muted">Trusted by 500+ Indian D2C Brands</span>
            </div>

            <h1 style={{ fontSize: "44px", lineHeight: 1.05, margin: "18px 0 14px", fontWeight: 800 }}>
              Reduce RTO by <span className="text-gradient">40%</span><br />With Smart COD Control
            </h1>

            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, maxWidth: 520 }}>
              Our Ecommerce Credit Score tells you which customers deserve COD and which don't. Stop losing money on fake orders and courier penalties.
            </p>

            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
              <button className="btn-accent" onClick={onOpenChecker} style={{ fontSize: 16 }}>
                Check Customer Score <ArrowRight size={16} style={{ marginLeft: 8 }} />
              </button>
              <button style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.12)", padding: "10px 14px", borderRadius: 10, color: "#fff", cursor: "pointer" }}>
                Watch Demo
              </button>
            </div>

            <div style={{ display: "flex", gap: 18, marginTop: 18, opacity: 0.85 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Shield size={16} /> <span>Data Secured</span></div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><TrendingDown size={16} /> <span>Reduce RTO</span></div>
            </div>
          </div>

          <div style={styles.heroRight}>
            <div style={{ position: "relative", width: 420 }}>
              <div style={{ ...styles.previewCard }}>
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 76, height: 76, borderRadius: 999, background: "linear-gradient(135deg,#22c55e,#16a34a)", margin: "0 auto 8px" }}>
                    <Shield size={36} color="#fff" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Credit Score: 847</h3>
                  <p style={{ margin: 0, color: "#16a34a", fontWeight: 700 }}>Excellent - Safe for COD</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Order History", value: "98% Delivered" },
                    { label: "Risk Level", value: "Low Risk" },
                    { label: "Recommendation", value: "Allow COD ✓" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 10, background: "#f8fafc" }}>
                      <span style={{ color: "#374151" }}>{item.label}</span>
                      <span style={{ fontWeight: 700 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ position: "absolute", top: -12, right: -12 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.12)" }}>
                  Live Preview
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 16 }}>
                {[
                  { value: "40%", label: "Average RTO Reduction" },
                  { value: "2.5L+", label: "Orders Analyzed" },
                  { value: "500+", label: "D2C Brands Trust Us" },
                ].map((stat, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.06)", padding: 14, borderRadius: 10, textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{stat.value}</div>
                    <div style={{ color: "rgba(255,255,255,0.85)" }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
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
    <section style={{ padding: "60px 0" }}>
      <div style={styles.pageMax}>
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 30px" }}>
          <div style={{ display: "inline-block", background: "#fef3c7", color: "#92400e", padding: "8px 12px", borderRadius: 999 }}>The Problem</div>
          <h2 style={{ fontSize: 32, marginTop: 12 }}>COD is Killing Your <span className="text-gradient">Profit Margins</span></h2>
          <p style={{ color: "#6b7280" }}>Indian D2C brands lose crores every year to RTO. You're offering COD to everyone without knowing who's trustworthy.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {problems.map((problem, i) => (
            <div key={i} style={{ borderRadius: 12, padding: 18, boxShadow: "0 8px 30px rgba(2,6,23,0.06)", background: "#fff" }}>
              <div style={{ marginBottom: 12, width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239,68,68,0.06)" }}>
                <problem.icon size={20} color="#ef4444" />
              </div>
              <h5 style={{ margin: "8px 0" }}>{problem.title}</h5>
              <p style={{ color: "#6b7280", fontSize: 14 }}>{problem.description}</p>
              <div style={{ borderTop: "1px solid #eef2f6", paddingTop: 10 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#ef4444" }}>{problem.stat}</div>
                <small style={{ color: "#6b7280" }}>{problem.statLabel}</small>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 28 }}>
          <div style={{ display: "inline-block", background: "#ffffff", padding: 18, borderRadius: 12, boxShadow: "0 8px 30px rgba(2,6,23,0.06)", maxWidth: 700 }}>
            <p style={{ fontSize: 18, margin: 0 }}>"We were offering COD to everyone. Our RTO was 35%. We didn't know which customers were risky."</p>
            <small style={{ color: "#6b7280" }}>— Every D2C founder before using OrderzUp</small>
          </div>
        </div>
      </div>
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
    <section style={{ padding: "60px 0", background: "#f8fafc" }}>
      <div style={styles.pageMax}>
        <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "inline-block", background: "#fef3c7", color: "#92400e", padding: "8px 12px", borderRadius: 999 }}>The Solution</div>
            <h2 style={{ fontSize: 32, margin: "12px 0" }}>Introducing <span className="text-gradient">Ecommerce Credit Score</span></h2>
            <p style={{ color: "#6b7280" }}>Think of it like a CIBIL score, but for ecommerce. We analyze multiple data points to tell you if a customer is safe for COD.</p>

            <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 12, borderRadius: 10, background: "#fff", boxShadow: "0 8px 30px rgba(2,6,23,0.04)" }}>
                <div style={{ background: "linear-gradient(135deg,#000434,#191970)", padding: 10, borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <Brain size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>Smart Scoring</div>
                  <div style={{ color: "#6b7280", fontSize: 14 }}>AI-powered risk assessment analyzing <strong>15+ signals</strong> in real-time.</div>
                </div>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: 10, borderRadius: 8, background: "rgba(34,197,94,0.06)" }}>
                  <div style={{ width: 10, height: 10, background: "#16a34a", borderRadius: 999 }} />
                  <span style={{ fontWeight: 600 }}>Score 750+ → Allow Full COD</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: 10, borderRadius: 8, background: "rgba(234,179,8,0.06)" }}>
                  <div style={{ width: 10, height: 10, background: "#eab308", borderRadius: 999 }} />
                  <span style={{ fontWeight: 600 }}>Score 500-750 → Partial COD</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: 10, borderRadius: 8, background: "rgba(239,68,68,0.06)" }}>
                  <div style={{ width: 10, height: 10, background: "#ef4444", borderRadius: 999 }} />
                  <span style={{ fontWeight: 600 }}>Score &lt;500 → Prepaid Only</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {factors.map((f, i) => (
                <div key={i} style={{ background: "#fff", padding: 14, borderRadius: 10, boxShadow: "0 8px 30px rgba(2,6,23,0.04)" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 8, background: "rgba(0,0,0,0.06)" }}>
                    <f.icon size={18} />
                  </div>
                  <div style={{ fontWeight: 700, marginTop: 8 }}>{f.title}</div>
                  <div style={{ color: "#6b7280", fontSize: 14 }}>{f.description}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, background: "linear-gradient(135deg,#000434,#191970)", color: "#fff", padding: 16, borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>15+</div>
              <div style={{ opacity: 0.85 }}>Data signals analyzed per customer in real-time</div>
            </div>
          </div>
        </div>
      </div>
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
    }, 1600);
  };

  const resetChecker = () => {
    setStep("customer");
    setCustomerData({ phone: "", pincode: "", email: "" });
    setBusinessData({ brandName: "", yourName: "", email: "", phone: "", orderVolume: "" });
    setResult(null);
  };

  const getRiskColor = (risk: string) => risk === "low" ? "#22c55e" : risk === "medium" ? "#eab308" : "#ef4444";
  const getRiskIcon = (risk: string) => risk === "low" ? CheckCircle2 : risk === "medium" ? AlertTriangle : XCircle;

  return (
    <section id="credit-checker" style={{ padding: "60px 0" }}>
      <div style={styles.pageMax}>
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 24px" }}>
          <div style={{ display: "inline-block", background: "#fef3c7", color: "#92400e", padding: "8px 12px", borderRadius: 999 }}>Try It Now</div>
          <h2 style={{ fontSize: 28, marginTop: 12 }}>Check Your Customer's <span className="text-gradient">Credit Score</span></h2>
          <p style={{ color: "#6b7280" }}>Enter customer details below to see their ecommerce credit score instantly.</p>
        </div>

        <div style={{ maxWidth: 540, margin: "0 auto", background: "#fff", padding: 18, borderRadius: 12, boxShadow: "0 10px 30px rgba(2,6,23,0.06)" }}>
          {/* Progress */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 18 }}>
            {["customer", "business", "result"].map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: step === s ? "linear-gradient(135deg,#f97316,#ea580c)" : "#eef2f6", color: step === s ? "#fff" : "#374151", fontWeight: 700 }}>{i + 1}</div>
                {i < 2 && <div style={{ width: 60, height: 4, borderRadius: 4, background: ["customer", "business", "result"].indexOf(step) > i ? "#22c55e" : "#eef2f6" }} />}
              </div>
            ))}
          </div>

          {/* Card Body */}
          <div>
            {step === "customer" && (
              <>
                <h4 style={{ marginBottom: 12 }}><User size={18} /> Customer Details</h4>
                <div style={{ marginBottom: 12 }}>
                  <label className="small-muted">Phone Number *</label>
                  <input style={styles.formControl as any} type="tel" maxLength={10} value={customerData.phone} onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value.replace(/\D/g, "") })} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label className="small-muted">Pincode *</label>
                  <input style={styles.formControl as any} type="text" maxLength={6} value={customerData.pincode} onChange={(e) => setCustomerData({ ...customerData, pincode: e.target.value.replace(/\D/g, "") })} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="small-muted">Email (Optional)</label>
                  <input style={styles.formControl as any} type="email" value={customerData.email} onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })} />
                </div>
                <button className="btn-accent" style={{ width: "100%" }} onClick={handleCustomerSubmit} disabled={!customerData.phone || !customerData.pincode}>Next: Enter Your Details <ArrowRight size={14} style={{ marginLeft: 8 }} /></button>
              </>
            )}

            {step === "business" && (
              <>
                <h4 style={{ marginBottom: 12 }}><Building size={18} /> Your Business Details</h4>
                <div style={{ marginBottom: 12 }}>
                  <label className="small-muted">Brand Name *</label>
                  <input style={styles.formControl as any} type="text" value={businessData.brandName} onChange={(e) => setBusinessData({ ...businessData, brandName: e.target.value })} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label className="small-muted">Your Name</label>
                  <input style={styles.formControl as any} type="text" value={businessData.yourName} onChange={(e) => setBusinessData({ ...businessData, yourName: e.target.value })} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label className="small-muted">Business Email *</label>
                  <input style={styles.formControl as any} type="email" value={businessData.email} onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label className="small-muted">Phone Number *</label>
                  <input style={styles.formControl as any} type="tel" maxLength={10} value={businessData.phone} onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value.replace(/\D/g, "") })} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="small-muted">Monthly Order Volume</label>
                  <select style={styles.formControl as any} value={businessData.orderVolume} onChange={(e) => setBusinessData({ ...businessData, orderVolume: e.target.value })}>
                    <option value="">Select volume</option>
                    <option value="0-500">0 - 500 orders</option>
                    <option value="500-2000">500 - 2,000 orders</option>
                    <option value="2000-10000">2,000 - 10,000 orders</option>
                    <option value="10000+">10,000+ orders</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid #e6e9ef", background: "#fff" }} onClick={() => setStep("customer")}><ArrowLeft size={14} /> Back</button>
                  <button className="btn-accent" style={{ flex: 1 }} onClick={handleBusinessSubmit} disabled={!businessData.brandName || !businessData.email || !businessData.phone}>Get Score <ArrowRight size={14} /></button>
                </div>
              </>
            )}

            {isLoading && (
              <div style={{ textAlign: "center", padding: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
                  <Loader2 size={28} color="#fff" />
                </div>
                <h5 style={{ marginTop: 12 }}>Analyzing Customer...</h5>
                <p style={{ color: "#6b7280" }}>Checking 15+ data signals</p>
              </div>
            )}

            {step === "result" && result && !isLoading && (
              <div style={{ textAlign: "center" }}>
                <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
                  <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="80" cy="80" r="70" fill="none" stroke="#e6eef6" strokeWidth="12" />
                    <circle cx="80" cy="80" r="70" fill="none"
                      stroke={getRiskColor(result.risk)}
                      strokeWidth="12" strokeLinecap="round" strokeDasharray={440}
                      strokeDashoffset={440 - (result.score / 900) * 440} />
                  </svg>
                  <div style={{ position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-50%)", textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>{result.score}</div>
                    <div style={{ color: "#6b7280" }}>out of 900</div>
                  </div>
                </div>

                <div style={{ margin: "8px 0" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f1f5f9", padding: "6px 10px", borderRadius: 20 }}>
                    {(() => { const Icon = getRiskIcon(result.risk); return <Icon size={16} />; })()}
                    <strong>{result.risk.charAt(0).toUpperCase() + result.risk.slice(1)} Risk</strong>
                  </div>
                </div>

                <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: result.risk === "low" ? "linear-gradient(135deg,#22c55e,#16a34a)" : result.risk === "medium" ? "linear-gradient(135deg,#eab308,#ca8a04)" : "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff" }}>
                  <div style={{ fontWeight: 700 }}>{result.recommendation}</div>
                </div>

                <p style={{ color: "#6b7280", marginTop: 12 }}>{result.message}</p>

                <button className="btn-accent" style={{ width: "100%", marginTop: 10 }} onClick={() => document.querySelector("#cta")?.scrollIntoView({ behavior: "smooth" })}>Get Full Access - Book Demo</button>
                <button style={{ width: "100%", marginTop: 8, padding: 12, borderRadius: 10, border: "1px solid #e6e9ef", background: "#fff" }} onClick={resetChecker}>Check Another Customer</button>
              </div>
            )}
          </div>
        </div>

        <p style={{ textAlign: "center", color: "#6b7280", marginTop: 12 }}>🔒 Your data is secure and never shared with third parties</p>
      </div>
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
    <section id="how-it-works" style={styles.section}>
      <div style={styles.pageMax}>
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 24px" }}>
          <div style={{ display: "inline-block", background: "#fef3c7", color: "#92400e", padding: "8px 12px", borderRadius: 999 }}>How It Works</div>
          <h2 style={{ fontSize: 28, marginTop: 12 }}>Get Started in <span className="text-gradient">3 Simple Steps</span></h2>
          <p style={{ color: "#6b7280" }}>No technical expertise needed. Integration is fast.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ padding: 18, borderRadius: 12, background: "#fff", boxShadow: "0 8px 30px rgba(2,6,23,0.04)" }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff" }}>{s.number}</div>
              <h5 style={{ marginTop: 12 }}>{s.title}</h5>
              <p style={{ color: "#6b7280" }}>{s.description}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 22 }}>
          <div style={{ display: "inline-flex", gap: 12, alignItems: "center", background: "#fff", padding: 12, borderRadius: 10 }}>
            <span style={{ fontWeight: 700 }}>Ready to reduce your RTO?</span>
            <button className="btn-accent" onClick={() => document.querySelector("#credit-checker")?.scrollIntoView({ behavior: "smooth" })}>Try Free Score Check</button>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============ BENEFITS ============
const BenefitsSection = () => {
  const benefits = [
    { icon: TrendingDown, title: "Reduce RTO by 40%", description: "Block risky customers from COD." },
    { icon: Wallet, title: "Save ₹150+ Per Order", description: "Stop paying double shipping on failed deliveries." },
    { icon: BarChart3, title: "Better Cash Flow", description: "More prepaid orders = faster remittance." },
    { icon: Shield, title: "Block Fake Orders", description: "Our AI detects fraud patterns." },
    { icon: Zap, title: "Real-Time Scoring", description: "Scores calculated in <200ms." },
    { icon: Globe, title: "Pan-India Coverage", description: "19,000+ serviceable pincodes in India." },
  ];

  return (
    <section id="benefits" style={{ ...styles.section, background: "#f8fafc" }}>
      <div style={styles.pageMax}>
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 24px" }}>
          <div style={{ display: "inline-block", background: "#ecfdf5", color: "#16a34a", padding: "8px 12px", borderRadius: 999 }}>Benefits</div>
          <h2 style={{ fontSize: 28, marginTop: 12 }}>Why D2C Brands <span className="text-gradient">Love OrderzUp</span></h2>
          <p style={{ color: "#6b7280" }}>Join 500+ brands who've transformed their COD strategy.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {benefits.map((b, i) => (
            <div key={i} style={{ padding: 18, borderRadius: 12, background: "#fff", boxShadow: "0 8px 30px rgba(2,6,23,0.04)" }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 10, background: "rgba(0,0,0,0.06)" }}>
                <b>{/* icon */}</b>
                <b><b /></b>
              </div>
              <h5 style={{ marginTop: 12 }}>{b.title}</h5>
              <p style={{ color: "#6b7280" }}>{b.description}</p>
            </div>
          ))}
        </div>

        <div style={{ background: "linear-gradient(135deg,#000434,#191970)", color: "#fff", padding: 18, borderRadius: 12, marginTop: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {[
              { value: "40%", label: "RTO Reduction" },
              { value: "500+", label: "Brands Trust Us" },
              { value: "2.5L+", label: "Orders Analyzed" },
              { value: "₹150+", label: "Saved Per RTO" },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{stat.value}</div>
                <div style={{ opacity: 0.9 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
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
    <section id="testimonials" style={styles.section}>
      <div style={styles.pageMax}>
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 24px" }}>
          <div style={{ display: "inline-block", background: "#fef3c7", color: "#92400e", padding: "8px 12px", borderRadius: 999 }}>Testimonials</div>
          <h2 style={{ fontSize: 28, marginTop: 12 }}>Trusted by <span className="text-gradient">500+ D2C Brands</span></h2>
          <p style={{ color: "#6b7280" }}>See what founders are saying about OrderzUp.</p>
        </div>

        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ position: "relative", padding: 18, borderRadius: 12, background: "#fff", boxShadow: "0 10px 30px rgba(2,6,23,0.06)" }}>
            <Quote size={48} style={{ position: "absolute", top: 16, right: 16, color: "#f59e0b", opacity: 0.2 }} />
            <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 8 }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={18} style={{ color: "#f59e0b" }} />)}
              </div>
            </div>

            <p style={{ fontSize: 18, marginBottom: 12 }}>"{testimonials[activeIndex].content}"</p>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <img src={testimonials[activeIndex].image} alt={testimonials[activeIndex].name} style={{ width: 56, height: 56, borderRadius: 999, objectFit: "cover", border: "2px solid #f59e0b" }} />
                <div>
                  <div style={{ fontWeight: 700 }}>{testimonials[activeIndex].name}</div>
                  <small style={{ color: "#6b7280" }}>{testimonials[activeIndex].role}, {testimonials[activeIndex].company}</small>
                </div>
              </div>

              <div style={{ background: "rgba(34,197,94,0.06)", padding: 12, borderRadius: 10 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ fontWeight: 700 }}>{testimonials[activeIndex].stats.before}</div>
                  <div style={{ color: "#6b7280" }}>→</div>
                  <div style={{ fontWeight: 700 }}>{testimonials[activeIndex].stats.after}</div>
                </div>
                <small style={{ color: "#6b7280" }}>{testimonials[activeIndex].stats.metric}</small>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8 }}>
                {testimonials.map((_, i) => <div key={i} onClick={() => setActiveIndex(i)} style={{ width: i === activeIndex ? 32 : 8, height: 8, borderRadius: 999, background: i === activeIndex ? "#f97316" : "#cbd5e1', cursor: 'pointer" }} />)}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setActiveIndex((p) => (p - 1 + testimonials.length) % testimonials.length)} style={{ padding: 8, borderRadius: 999, border: "1px solid #eef2f6", background: "#fff" }}><ChevronLeft /></button>
                <button onClick={() => setActiveIndex((p) => (p + 1) % testimonials.length)} style={{ padding: 8, borderRadius: 999, border: "1px solid #eef2f6", background: "#fff" }}><ChevronRight /></button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <p style={{ color: "#6b7280" }}>Trusted by leading D2C brands across India</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", opacity: 0.6 }}>
            {["StyleBox", "GlowUp", "FitGear", "HomeDeco", "UrbanWear", "NutriFit"].map((b) => <div key={b} style={{ fontWeight: 700, color: "#374151" }}>{b}</div>)}
          </div>
        </div>
      </div>
    </section>
  );
};

// ============ CTA ============
const CTASection = () => {
  return (
    <section id="cta" style={{ padding: "60px 0", background: "linear-gradient(135deg,#000434,#191970)", color: "#fff" }}>
      <div style={styles.pageMax}>
        <div style={{ textAlign: "center", maxWidth: 800, margin: "0 auto 24px" }}>
          <div style={{ display: "inline-block", background: "#fef3c7", color: "#92400e", padding: "8px 12px", borderRadius: 999 }}>Get Started Today</div>
          <h2 style={{ fontSize: 28, marginTop: 12 }}>Ready to Reduce Your <span className="text-gradient">RTO by 40%</span>?</h2>
          <p style={{ color: "rgba(255,255,255,0.8)" }}>Join 500+ D2C brands who trust OrderzUp for smarter COD decisions.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 820, margin: "0 auto" }}>
          <div style={{ background: "#fff", padding: 18, borderRadius: 12 }}>
            <div style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", width: 48, height: 48, borderRadius: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff" }}></div>
            <h4 style={{ marginTop: 8 }}>Book a Demo</h4>
            <p style={{ color: "#6b7280" }}>Get a personalized walkthrough of OrderzUp with our team. See how it can work for your business.</p>
            <button className="btn-accent" style={{ width: "100%" }} onClick={() => window.location.href = "mailto:demo@orderzup.com"}>Schedule Demo <ArrowRight style={{ marginLeft: 8 }} /></button>
          </div>

          <div style={{ background: "#fff", padding: 18, borderRadius: 12 }}>
            <div style={{ background: "linear-gradient(135deg,#000434,#191970)", width: 48, height: 48, borderRadius: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Rocket /></div>
            <h4 style={{ marginTop: 8 }}>Start Free Trial</h4>
            <p style={{ color: "#6b7280" }}>Try OrderzUp free for 14 days.</p>
            <button style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.06)", background: "#fff" }} onClick={() => document.querySelector("#credit-checker")?.scrollIntoView({ behavior: "smooth" })}>Start Free Trial <ArrowRight style={{ marginLeft: 8 }} /></button>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 18, opacity: 0.9 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Shield size={16} /> Data Encrypted</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Calendar size={16} /> No Long Contracts</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Rocket size={16} /> Setup in 5 mins</div>
        </div>
      </div>
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
    <section id="faq" style={{ padding: "60px 0", background: "#f8fafc" }}>
      <div style={styles.pageMax}>
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 24px" }}>
          <div style={{ display: "inline-block", background: "#ecfeff", color: "#0369a1", padding: "8px 12px", borderRadius: 999 }}>FAQ</div>
          <h2 style={{ fontSize: 28, marginTop: 12 }}>Frequently Asked <span className="text-gradient">Questions</span></h2>
          <p style={{ color: "#6b7280" }}>Everything you need to know about OrderzUp.</p>
        </div>

        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          {faqs.map((f, i) => (
            <details key={i} style={{ background: "#fff", padding: 12, borderRadius: 10, marginBottom: 10, boxShadow: "0 8px 30px rgba(2,6,23,0.04)" }}>
              <summary style={{ fontWeight: 700, cursor: "pointer" }}>{f.question}</summary>
              <div style={{ marginTop: 8, color: "#6b7280" }}>{f.answer}</div>
            </details>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <p style={{ color: "#6b7280" }}>Still have questions?</p>
          <a href="mailto:hello@orderzup.com" style={{ color: "#f97316", fontWeight: 700 }}>Contact our team →</a>
        </div>
      </div>
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
    <footer className="footer-custom">
      <div style={styles.footerInner}>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 260px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", padding: 8, borderRadius: 8 }}><Shield size={20} color="#fff" /></div>
              <div style={{ fontWeight: 700 }}>OrderzUp</div>
            </div>
            <div style={{ color: "rgba(255,255,255,0.85)", maxWidth: 280 }}>Helping D2C brands reduce RTO with smart ecommerce credit scoring.</div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8, color: "rgba(255,255,255,0.85)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Mail size={16} /> hello@orderzup.com</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Phone size={16} /> +91 98765 43210</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><MapPin size={16} /> Bangalore, India</div>
            </div>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title} style={{ minWidth: 120 }}>
              <div style={{ fontWeight: 700, textTransform: "capitalize", marginBottom: 8 }}>{title}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {items.map(i => <li key={i} style={{ marginBottom: 8 }}><a href="#" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>{i}</a></li>)}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 18 }}>
          <div style={{ color: "rgba(255,255,255,0.85)" }}>© {currentYear} OrderzUp. All rights reserved.</div>
          <div style={{ display: "flex", gap: 12 }}>
            {[Twitter, Linkedin, Instagram].map((Icon, i) => (
              <a key={i} href="#" style={{ width: 40, height: 40, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.06)", color: "inherit" }}><Icon size={18} /></a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// ============ MAIN ============
const Index = () => {
  const scrollToSection = (id = "#") => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{customStyles}</style>
      <main style={{ overflowX: "hidden" }}>
        <NavbarSection scrollToSection={scrollToSection} />
        <HeroSection onOpenChecker={() => scrollToSection("#credit-checker")} />
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