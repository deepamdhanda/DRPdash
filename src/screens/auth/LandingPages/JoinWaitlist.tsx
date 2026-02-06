import React, { useEffect, useRef, useState } from "react";
import './JoinWaitlist.css'
import image1 from "../../../assets/1.jpg";
import image2 from "../../../assets/2.jpg";
import image3 from "../../../assets/3.jpg";
import logoWide from "../../../assets/logo-wide.png";
import { registerLead } from "../../../APIs/landingPageAPIs";

const JoinWaitingList: React.FC = () => {
  // Spots state and constants
  const [spots, setSpots] = useState<number>(() => {
    const stored = localStorage.getItem("orderzup_spots");
    return stored ? parseInt(stored, 10) : 37;
  });
  const TOTAL_SPOTS = 50;

  // Countdown state
  const [countdown, setCountdown] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  // Popup & form state
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [formHidden, setFormHidden] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const waitlistPopupRef = useRef<HTMLDivElement | null>(null);
  const exitIntentRef = useRef<HTMLDivElement | null>(null);

  // Launch date used in original file
  const launchDate = new Date("2026-06-01T11:00:00Z").getTime();


  // Helper pad
  const pad = (n: number) => (n < 10 ? "0" + n : String(n));

  // Countdown effect (flip countdown)
  useEffect(() => {
    const updateFlipCountdown = () => {
      const now = Date.now();
      let distance = launchDate - now;
      if (distance < 0) distance = 0;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setCountdown({
        days: pad(days),
        hours: pad(hours),
        minutes: pad(minutes),
        seconds: pad(seconds),
      });
    };
    const id = setInterval(updateFlipCountdown, 1000);
    updateFlipCountdown();
    return () => clearInterval(id);
  }, []);

  // Spots logic (dynamic decreasing)
  useEffect(() => {
    // DOMContentLoaded logic equivalent: slightly reduce spots on initial load by random 0-2
    const dec = Math.floor(Math.random() * 3);
    setSpots((prev) => {
      const newSpots = prev > 12 ? Math.max(12, prev - dec) : prev;
      localStorage.setItem("orderzup_spots", String(newSpots));
      return newSpots;
    });

    const interval = setInterval(() => {
      setSpots((prev) => {
        if (prev > 12 && Math.random() < 0.18) {
          const newSpots = prev - 1;
          localStorage.setItem("orderzup_spots", String(newSpots));
          return newSpots;
        }
        return prev;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Show popup after 10 seconds (like original)
  useEffect(() => {
    const t = setTimeout(() => setShowPopup(true), 10000);
    return () => clearTimeout(t);
  }, []);

  // Close popup on overlay click (same behaviour as original)
  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === waitlistPopupRef.current) {
      setShowPopup(false);
      // also reset states like original?
    }
  };

  // Form submit handler (mimics original)
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = {
      sourceTypeId: 1001,
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      orders: fd.get("orders"),
      platform: fd.get("platform"),
    };
    const res = await registerLead(data);
    if (!res) return;
    setFormHidden(true);
    setShowSuccess(true);
    setTimeout(() => {
      setShowPopup(false);
      setFormHidden(false);
      setShowSuccess(false);
      form.reset();
    }, 250000);
  };

  // Canvas particles logic (converted from original)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let particles: any[] = [];
    let rafId = 0;

    function resizeCanvas() {
      if (canvas) {
        w = (canvas.width = window.innerWidth);
        // find hero-section height - approximate from canvas container
        const heroEl = document.querySelector(".hero-section") as HTMLElement | null;
        h = heroEl ? heroEl.offsetHeight : window.innerHeight / 2;
        canvas.height = h;
      }
    }

    function Particle() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 1.6 + 0.8,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
      };
    }

    function createParticles(num: number) {
      particles = [];
      for (let i = 0; i < num; i++) particles.push(Particle());
    }

    function drawParticles() {
      if (ctx) {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
          ctx.fillStyle = "#F5891E";
          ctx.globalAlpha = 0.18;
          ctx.fill();
          ctx.globalAlpha = 1;
          for (let j = i + 1; j < particles.length; j++) {
            const q = particles[j];
            const dist = Math.hypot(p.x - q.x, p.y - q.y);
            if (dist < 80) {
              ctx.strokeStyle = "#fff";
              ctx.globalAlpha = 0.09;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
          }
          p.x += p.speedX;
          p.y += p.speedY;
          if (p.x < 0 || p.x > w) p.speedX *= -1;
          if (p.y < 0 || p.y > h) p.speedY *= -1;
        }
      }
      rafId = requestAnimationFrame(drawParticles);
    }

    function onResize() {
      resizeCanvas();
      createParticles(Math.floor(w / 18));
    }

    window.addEventListener("resize", onResize);
    onResize();
    drawParticles();

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // FAQ accordion toggling (delegated)
  useEffect(() => {
    const container = document.getElementById("faqAccordion");
    if (!container) return;
    const onClick = (ev: Event) => {
      const t = ev.target as HTMLElement;
      if (t && t.classList.contains("faq-question")) {
        const item = t.parentElement;
        if (!item) return;
        if (item.classList.contains("open")) {
          item.classList.remove("open");
        } else {
          item.classList.add("open");
        }
      }
    };
    container.addEventListener("click", onClick);
    return () => container.removeEventListener("click", onClick);
  }, []);

  // Compute progress width used in the UI
  const progressPercent = ((TOTAL_SPOTS - spots) / TOTAL_SPOTS) * 100;

  return (
    <div id="join_waiting_list" className="page-wrapper" style={{ fontFamily: "'Inter', Arial, sans-serif", fontSize: "15px!important", margin: 10 }}>
      {/* Inject CSS */}

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-bg-anim">
          <canvas id="hero-particles" ref={canvasRef}></canvas>
        </div>

        <div className="hero-content">
          <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
            {/* Left Column */}
            <div style={{ flex: "1 1 520px", minWidth: 300 }}>
              <h1 className="display-4 fw-bold mb-3" data-abtest="headline" style={{ margin: 0 }}>
                Slash RTOs by <span style={{ color: "var(--orange)" }}>30%</span> with AI-Driven Logistics
              </h1>
              <h2 style={{ marginTop: 12, fontSize: "1.35rem", fontWeight: 400 }} data-abtest="subheadline">
                Join the <strong>OrderzUp Waitlist</strong> for early access to the only D2C platform that
                automates fulfillment, reduces returns, and boosts your bottom line.
              </h2>

              <div
                className="hero-urgency-mobile"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "12px 16px",
                  marginTop: 18,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--orange)" }}>
                    🚀 <strong id="spots-num">{spots}</strong> / <strong>50</strong> Beta spots left
                  </span>

                  <div className="flip-countdown" id="flip-countdown" style={{ marginLeft: "auto" }}>
                    <div>
                      <div className="flip-unit" id="days">
                        {countdown.days}
                      </div>
                      <span className="flip-label">Days</span>
                    </div>
                    <div>
                      <div className="flip-unit" id="hours">
                        {countdown.hours}
                      </div>
                      <span className="flip-label">Hrs</span>
                    </div>
                    <div>
                      <div className="flip-unit" id="minutes">
                        {countdown.minutes}
                      </div>
                      <span className="flip-label">Min</span>
                    </div>
                    <div>
                      <div className="flip-unit" id="seconds">
                        {countdown.seconds}
                      </div>
                      <span className="flip-label">Sec</span>
                    </div>
                  </div>
                </div>

                <div style={{ height: 8, background: "rgba(255,255,255,0.2)", borderRadius: 4, marginTop: 8, overflow: "hidden" }}>
                  <div
                    id="spots-progress"
                    style={{
                      height: "100%",
                      width: `${progressPercent}%`,
                      background: "var(--orange)",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg w-100 fw-bold"
                style={{
                  fontSize: "1.2rem",
                  background: "var(--orange)",
                  border: "none",
                  padding: 14,
                  marginTop: 16,
                  width: "100%",
                }}
                onClick={() => setShowPopup(true)}
                data-abtest="cta-primary"
              >
                ✅ Join the Waitlist Now
              </button>

              <div style={{ fontSize: "0.98rem", color: "#fff", opacity: 0.85, marginTop: 7, textAlign: "center" }}>
                Takes 30 seconds, no credit card required
              </div>

              <div className="mt-4" style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                <img
                  src="https://cdn.shopify.com/b/shopify-brochure2-assets/08b278c519512d187520e1fe10b4f5b7.svg"
                  alt="Shopify Integration"
                  style={{ background: "#fff", borderRadius: 8, padding: "4px 10px", height: 40 }}
                  loading="lazy"
                />
                <span style={{ fontSize: "0.85rem", color: "#bbb" }}>Trusted by 300+ ecommerce brands in Beta</span>
              </div>

              <div className="mini-testimonials">
                <div className="mini-testimonial">
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Rahul M." />
                  <span>“25% fewer returns in 1 month!” <b style={{ color: "var(--orange)" }}>Beauty Startup</b></span>
                </div>
                <div className="mini-testimonial">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Priya S." />
                  <span>“Validation is a game changer.” <b style={{ color: "var(--orange)" }}>D2C Apparel</b></span>
                </div>
                <div className="mini-testimonial">
                  <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="Meera T." />
                  <span>“Saved us thousands in fraud!” <b style={{ color: "var(--orange)" }}>Home Decor</b></span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ flex: "1 1 420px", textAlign: "center", minWidth: 280 }}>
              <img
                src={image1}
                alt="OrderzUp Dashboard"
                className="img-fluid rounded shadow"
                style={{ border: "4px solid rgba(255,255,255,0.15)", background: "#0a0a1a", maxWidth: "100%" }}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust & courier partners */}
      <section className="py-4" style={{ background: "rgba(255,255,255,0.03)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div className="text-center mb-2" style={{ fontWeight: 600 }}>
            Our Trusted Courier Partners
          </div>
          <div style={{ backgroundColor: "#000434", overflow: "hidden", whiteSpace: "nowrap", padding: "20px 0" }}>
            <div style={{ display: "inline-block", animation: "slide-left 10s linear infinite" }}>
              <span style={{ padding: "10px 20px", backgroundColor: "#F5891E", color: "#000434", borderRadius: 8, marginRight: 12, display: "inline-block" }}>
                Delhivery
              </span>
              <span style={{ padding: "10px 20px", backgroundColor: "#FFFFFF", color: "#000434", borderRadius: 8, marginRight: 12, display: "inline-block" }}>
                Blue Dart
              </span>
              <span style={{ padding: "10px 20px", backgroundColor: "#FCE4EC", color: "#000434", borderRadius: 8, marginRight: 12, display: "inline-block" }}>
                DTDC
              </span>
              <span style={{ padding: "10px 20px", backgroundColor: "#FFF3E0", color: "#000434", borderRadius: 8, marginRight: 12, display: "inline-block" }}>
                Ecom Express
              </span>
              <span style={{ padding: "10px 20px", backgroundColor: "#EDE7F6", color: "#000434", borderRadius: 8, marginRight: 12, display: "inline-block" }}>
                XpressBees
              </span>
              <span style={{ padding: "10px 20px", backgroundColor: "#E8F5E9", color: "#000434", borderRadius: 8, marginRight: 12, display: "inline-block" }}>
                Shadowfax
              </span>
              <span style={{ padding: "10px 20px", backgroundColor: "#F3E5F5", color: "#000434", borderRadius: 8, marginRight: 12, display: "inline-block" }}>
                Ekart Logistics
              </span>
              <span style={{ padding: "10px 20px", backgroundColor: "#FFF8E1", color: "#000434", borderRadius: 8, marginRight: 12, display: "inline-block" }}>
                Gati
              </span>
              <span style={{ padding: "10px 20px", backgroundColor: "#E1F5FE", color: "#000434", borderRadius: 8, marginRight: 12, display: "inline-block" }}>
                India Post
              </span>
              <span style={{ padding: "10px 20px", backgroundColor: "#F9FBE7", color: "#000434", borderRadius: 8, marginRight: 12, display: "inline-block" }}>
                Safexpress
              </span>
              <span style={{ padding: "10px 20px", backgroundColor: "#FBE9E7", color: "#000434", borderRadius: 8, marginRight: 12, display: "inline-block" }}>
                Wow Express
              </span>
              <span style={{ padding: "10px 20px", backgroundColor: "#E3F2FD", color: "#000434", borderRadius: 8, marginRight: 12, display: "inline-block" }}>
                Pickrr
              </span>
              <span style={{ padding: "10px 20px", backgroundColor: "#FFFFFF", color: "#000434", borderRadius: 8, marginRight: 12, display: "inline-block" }}>
                Shiprocket
              </span>
              <span style={{ padding: "10px 20px", backgroundColor: "#F1F8E9", color: "#000434", borderRadius: 8, marginRight: 12, display: "inline-block" }}>
                iThink Logistics
              </span>
              <span style={{ padding: "10px 20px", backgroundColor: "#FFECB3", color: "#000434", borderRadius: 8, marginRight: 12, display: "inline-block" }}>
                Trackon Courier
              </span>
              {/* repeat */}
              <span style={{ padding: "10px 20px", backgroundColor: "#F5891E", color: "#000434", borderRadius: 8, marginRight: 12, display: "inline-block" }}>
                Delhivery
              </span>
              <span style={{ padding: "10px 20px", backgroundColor: "#FFFFFF", color: "#000434", borderRadius: 8, marginRight: 12, display: "inline-block" }}>
                Blue Dart
              </span>
            </div>
          </div>
          <style>{`@keyframes slide-left{0%{transform:translateX(0%)}100%{transform:translateX(-50%)}}`}</style>
        </div>
      </section>

      {/* Problem → Solution section */}
      <section className="py-5 position-relative" id="problem-solution" style={{ padding: "48px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: "0 0 320px", textAlign: "center" }}>
              <img src={image2} alt="RTO Problem" className="img-fluid rounded shadow" loading="lazy" style={{ maxWidth: "100%" }} />
              <div style={{ fontSize: "1.2rem", color: "var(--orange)", marginTop: 12 }}>
                <b>22%+ of D2C revenue lost to RTOs</b>
              </div>
            </div>
            <div style={{ flex: "1 1 560px" }}>
              <h3 style={{ marginTop: 0, color: "var(--orange)", fontWeight: 700 }}>Are You Losing Revenue to Returns?</h3>
              <p style={{ fontSize: "1.12rem", color: "var(--white)" }}>
                If you run a D2C brand, you know the pain: <b>failed deliveries, fake orders, and rising shipping costs</b> eat into your profits every single day.
                <br />
                <span style={{ color: "var(--orange)", fontWeight: 600 }}>Does this sound familiar?</span>
              </p>
              <ul style={{ listStyle: "none", padding: 0, fontSize: "1.08rem" }}>
                <li style={{ marginBottom: 10 }}><span style={{ color: "var(--orange)", fontWeight: 700 }}>•</span> <b>Orders returned due to wrong addresses</b> – You pay for shipping, but never get paid.</li>
                <li style={{ marginBottom: 10 }}><span style={{ color: "var(--orange)", fontWeight: 700 }}>•</span> <b>Manual courier selection</b> – Wasting time comparing rates and reliability.</li>
                <li style={{ marginBottom: 10 }}><span style={{ color: "var(--orange)", fontWeight: 700 }}>•</span> <b>Fraud & duplicate orders</b> – Risky orders slip through, hurting your bottom line.</li>
                <li style={{ marginBottom: 10 }}><span style={{ color: "var(--orange)", fontWeight: 700 }}>•</span> <b>No real-time insights</b> – You’re left guessing why returns are rising.</li>
              </ul>

              <div style={{ margin: "18px 0 10px 0" }}>
                <span style={{ background: "var(--orange)", color: "var(--navy)", padding: "6px 18px", borderRadius: 8, fontWeight: 700 }}>
                  OrderzUp solves all of this — automatically.
                </span>
              </div>

              <ul style={{ listStyle: "none", padding: 0, fontSize: "1.08rem" }}>
                <li style={{ marginBottom: 8 }}><b>AI-powered address validation</b> <span style={{ color: "var(--orange)" }}>–</span> Catch errors before they cost you.</li>
                <li style={{ marginBottom: 8 }}><b>Automated carrier selection</b> <span style={{ color: "var(--orange)" }}>–</span> Always ship with the best rates and reliability.</li>
                <li style={{ marginBottom: 8 }}><b>Predictive fraud detection</b> <span style={{ color: "var(--orange)" }}>–</span> Block risky and duplicate orders automatically.</li>
                <li style={{ marginBottom: 8 }}><b>Real-time rate comparison</b> <span style={{ color: "var(--orange)" }}>–</span> Save on every shipment, every time.</li>
              </ul>

              <a
                href="#"
                className="btn btn-primary btn-lg"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPopup(true);
                }}
                data-abtest="cta-problem-waitlist"
                style={{ display: "inline-block", marginTop: 12 }}
              >
                Yes, I want to fix my RTO problem!
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features & Benefits (abridged but kept as in original) */}
      <section className="py-5" id="features" style={{ background: "linear-gradient(120deg, #F5891E 0%, #000434 100%)", boxShadow: "0 8px 32px rgba(0,4,52,0.18)", borderRadius: 32, margin: "48px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <h3 className="text-center mb-4" style={{ fontSize: "2.2rem", color: "var(--white)", letterSpacing: 1, textShadow: "0 2px 16px rgba(0,0,0,0.12)" }}>
            <span style={{ background: "rgba(0,4,52,0.12)", padding: "8px 24px", borderRadius: 16, display: "inline-block" }}>
              Why D2C Brands <span style={{ color: "var(--orange)" }}>Love</span> OrderzUp
            </span>
          </h3>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24, textAlign: "center" }}>
            <div style={{ width: 300, background: "transparent", padding: 16 }}>
              <div style={{ fontSize: "2.5rem" }}>⚡</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--orange)" }}>Slash Returns</div>
              <div style={{ color: "var(--white)", fontSize: "1.05rem" }}>Reduce RTOs by up to <b>30%</b> with AI-driven validation and fraud checks.</div>
            </div>

            <div style={{ width: 300, background: "transparent", padding: 16 }}>
              <div style={{ fontSize: "2.5rem" }}>🚀</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--orange)" }}>Scale Effortlessly</div>
              <div style={{ color: "var(--white)", fontSize: "1.05rem" }}>Automate fulfillment and shipping as your business grows.</div>
            </div>

            <div style={{ width: 300, background: "transparent", padding: 16 }}>
              <div style={{ fontSize: "2.5rem" }}>🔒</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--orange)" }}>Protect Revenue</div>
              <div style={{ color: "var(--white)", fontSize: "1.05rem" }}>Block fraud and duplicates before they impact your bottom line.</div>
            </div>

            <div style={{ width: 300, background: "transparent", padding: 16 }}>
              <div style={{ fontSize: "2.5rem" }}>📦</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--orange)" }}>Smart Shipping</div>
              <div style={{ color: "var(--white)", fontSize: "1.05rem" }}>Compare rates and automate courier selection for every order.</div>
            </div>

            <div style={{ width: 300, background: "transparent", padding: 16 }}>
              <div style={{ fontSize: "2.5rem" }}>📊</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--orange)" }}>Actionable Analytics</div>
              <div style={{ color: "var(--white)", fontSize: "1.05rem" }}>Track order volume, delivery performance, and RTO trends in real time.</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 24, alignItems: "center", marginTop: 32, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 320px", textAlign: "center" }}>
              <img src={image3} alt="OrderzUp UI" className="img-fluid rounded shadow-lg" loading="lazy" style={{ maxWidth: "100%", border: "4px solid var(--orange)", boxShadow: "0 8px 32px rgba(245,137,30,0.18)" }} />
            </div>
            <div style={{ flex: "1 1 420px", textAlign: "left" }}>
              <h4 style={{ color: "var(--orange)", fontSize: "1.4rem" }}>Feature Highlights</h4>
              <ul style={{ listStyle: "none", padding: 0, fontSize: "1.08rem" }}>
                <li style={{ marginBottom: 14 }}><span style={{ background: "var(--orange)", color: "var(--navy)", borderRadius: 6, padding: "2px 10px", marginRight: 8, fontWeight: 700 }}>1</span><b>1-Click Shopify Integration</b> – Connect and sync orders instantly.</li>
                <li style={{ marginBottom: 14 }}><span style={{ background: "var(--orange)", color: "var(--navy)", borderRadius: 6, padding: "2px 10px", marginRight: 8, fontWeight: 700 }}>2</span><b>Automated Dispatch</b> – Ship faster with zero manual effort.</li>
                <li style={{ marginBottom: 14 }}><span style={{ background: "var(--orange)", color: "var(--navy)", borderRadius: 6, padding: "2px 10px", marginRight: 8, fontWeight: 700 }}>3</span><b>Multi-Courier Support</b> – 20+ partners, always the best rate.</li>
                <li style={{ marginBottom: 14 }}><span style={{ background: "var(--orange)", color: "var(--navy)", borderRadius: 6, padding: "2px 10px", marginRight: 8, fontWeight: 700 }}>4</span><b>Real-Time Tracking</b> – Monitor every shipment from dashboard to doorstep.</li>
              </ul>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => setShowPopup(true)}
                style={{ marginTop: 12, fontSize: "1.15rem" }}
                data-abtest="cta-demo"
              >
                Join Waiting List
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Video / Demo */}
      <section className="py-5" id="video">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <h3 className="text-center mb-4" style={{ fontSize: "2rem" }}>
            <span style={{ background: "rgba(245,137,30,0.12)", padding: "8px 24px", borderRadius: 16, display: "inline-block" }}>
              See OrderzUp in Action
            </span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 900, position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.10)" }}>
              <iframe src="https://www.youtube.com/embed/TngWmsax8Rw" title="OrderzUp Explainer Video" allowFullScreen style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }} loading="lazy" />
            </div>
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <p style={{ color: "var(--orange)", fontSize: "1.15rem", fontWeight: 600 }}>
                Discover the secret sauce behind India's fastest-growing D2C brands.
                <br />
                <span style={{ color: "var(--white)", fontSize: "1rem", fontWeight: 400 }}>(Real dashboard walkthrough, no fluff!)</span>
              </p>
              <a href="#" className="btn btn-primary btn-lg" data-abtest="cta-download-pdf" style={{ fontSize: "1.08rem" }}>
                Download PDF Overview
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap / Timeline */}
      <section className="py-5" style={{ background: "rgba(255,255,255,0.03)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <h3 className="text-center mb-4" style={{ fontSize: "2rem" }}>
            <span style={{ background: "rgba(245,137,30,0.12)", padding: "8px 24px", borderRadius: 16, display: "inline-block" }}>
              Your Journey to Smarter Logistics
            </span>
          </h3>
          <div className="timeline-cards" style={{ paddingBottom: 8 }}>
            <div className="timeline-card">
              <div className="timeline-step">4 Weeks Out</div>
              <div className="timeline-title">Feature Sneak Peek</div>
              <div className="timeline-desc">
                <span style={{ display: "inline-block", background: "var(--orange)", color: "var(--navy)", padding: "2px 10px", borderRadius: 6, fontWeight: 600 }}>✨</span>
                Preview our dashboard, validation engine, and shipping automations.
              </div>
            </div>
            <div className="timeline-card">
              <div className="timeline-step">3 Weeks Out</div>
              <div className="timeline-title">Beta & Security Testing</div>
              <div className="timeline-desc">We’re stress-testing our platform and ensuring enterprise-grade security for your data.</div>
            </div>
            <div className="timeline-card">
              <div className="timeline-step">2 Weeks Out</div>
              <div className="timeline-title">Integrations & Onboarding</div>
              <div className="timeline-desc">
                See how easy it is to connect Shopify and set up your fulfillment rules.
                <div style={{ marginTop: 8 }}>
                  <a href="#features" className="btn btn-primary btn-sm" style={{ fontSize: "1rem", padding: "6px 18px", marginTop: 8 }} data-abtest="cta-timeline-integration">Learn Integration</a>
                </div>
              </div>
            </div>
            <div className="timeline-card">
              <div className="timeline-step">1 Week Out</div>
              <div className="timeline-title">Early Access Perks</div>
              <div className="timeline-desc">
                Waitlist members get exclusive early access, bonus features, and priority support.
                <div style={{ marginTop: 8 }}>
                  <a href="#" className="btn btn-success btn-sm" style={{ fontSize: "1rem", padding: "6px 18px", marginTop: 8 }} data-abtest="cta-timeline-earlyaccess">Claim Your Spot</a>
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <span style={{ color: "var(--orange)", fontWeight: 600, fontSize: "1.1rem" }}>
              Ready to start?
              <a onClick={(e) => { e.preventDefault(); setShowPopup(true); }} className="btn btn-primary btn-lg ml-2" style={{ fontSize: "1.1rem", marginLeft: 12 }} data-abtest="cta-timeline-bottom">Join the Waiting List</a>
            </span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section py-5">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <h3 className="text-center mb-4">Frequently Asked Questions</h3>
          <div className="faq-accordion" id="faqAccordion">
            {[
              { q: "How does OrderzUp reduce RTOs?", a: "OrderzUp uses AI to pre-validate addresses and phone numbers, flagging errors and risky orders before they ship." },
              { q: "Is Shopify integration really one-click?", a: "Yes! You can connect your Shopify store in seconds and start syncing orders instantly." },
              { q: "How many courier partners are supported?", a: "OrderzUp supports 20+ leading courier partners, always selecting the best rate for each order." },
              { q: "Is my data secure?", a: "Absolutely. We use SSL encryption and are GDPR compliant. Your data is protected at every step." },
              { q: "What happens after I join the waitlist?", a: "You'll get early access updates, onboarding support, and exclusive perks as we launch." },
              { q: "Can I cancel or leave the waitlist?", a: "Yes, you can opt out at any time—no commitment required." },
            ].map((item, idx) => (
              <div className="faq-item" key={idx}>
                <button className="faq-question">{item.q}</button>
                <div className="faq-answer">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="main-footer py-4 bg-dark text-white" style={{ background: "var(--navy)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 320px" }}>
              <img src={logoWide} width="200px" className="p-2" alt="OrderzUp logo" />
              <p>Your smart solution for D2C logistics. Reduce RTOs, automate shipping, and grow your brand.</p>
            </div>
            <div style={{ flex: "1 1 200px" }}>
              <h5>Contact</h5>
              <p>Email: <a href="mailto:hello@orderzup.com" className="text-white">hello@orderzup.com</a></p>
            </div>
            <div style={{ flex: "1 1 200px" }}>
              <h5>Connect</h5>
              <a href="https://www.linkedin.com/company/ordezup/" className="text-white mr-2" style={{ marginRight: 8 }}>LinkedIn</a>
              <a href="https://instagram.com/officialorderzup" className="text-white mr-2" style={{ marginRight: 8 }}>Instagram</a>
              <a href="https://facebook.com/officialorderzup" className="text-white">Facebook</a>
              <div style={{ marginTop: 8 }}>
                <a href="https://orderzup.com/terms-of-use" className="text-white mr-2" style={{ marginRight: 8 }}>Terms of Service</a>
                <a href="https://orderzup.com/privacy-policy-2/" className="text-white">Privacy Policy</a>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <small>Copyright © 2025 OrderzUp. All Rights Reserved.</small>
          </div>
        </div>
      </footer>

      {/* Sticky CTA for mobile */}
      <div className="sticky-cta d-block d-md-none" style={{ display: "block" }}>
        Slash RTOs by 30%: <a onClick={(e) => { e.preventDefault(); setShowPopup(true); }} data-abtest="cta-mobile">Join the Waitlist</a>
      </div>

      {/* Exit Intent Popup (hidden by default like original) */}
      <div id="exit-intent-popup" ref={exitIntentRef} style={{ display: "none", position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 99999, background: "rgba(0,4,52,0.85)", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "var(--white)", color: "var(--navy)", padding: 32, borderRadius: 18, maxWidth: 340, textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
          <h3 style={{ color: "var(--orange)", fontWeight: 700 }}>Wait! Don’t Miss Out</h3>
          <p style={{ margin: "18px 0" }}>Join the OrderzUp waitlist now and be first to access exclusive early-bird perks.</p>
          <a href="#" className="btn btn-primary btn-lg" data-abtest="popup-cta" onClick={(e) => e.preventDefault()}>Join the Waitlist</a>
        </div>
      </div>

      {/* Waitlist Popup (center) */}
      {showPopup && (
        <div
          id="waitlist-popup"
          ref={waitlistPopupRef}
          onClick={onOverlayClick}
          style={{
            display: "flex",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 100000,
            backdropFilter: "blur(3px)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ background: "#fff", color: "#000434", padding: "40px 32px 28px", borderRadius: 24, maxWidth: 600, width: "90vw", textAlign: "center", boxShadow: "0 12px 40px rgba(0,0,0,0.25)", position: "relative", fontFamily: "'Hiragino Maru Gothic ProN', sans-serif" }}>
            <button onClick={() => setShowPopup(false)} style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", fontSize: "1.8rem", color: "#F5891E", cursor: "pointer" }}>&times;</button>

            <h3 style={{ color: "#F5891E", fontWeight: 800, marginBottom: 12, fontSize: "1.5rem" }}>🚀 Be the First to Experience OrderzUp</h3>
            <p style={{ fontSize: "1.05rem", marginBottom: 22, color: "#333" }}>Join our waitlist and unlock early access + exclusive launch benefits.</p>

            <form id="waitlist-form" onSubmit={handleFormSubmit} style={{ display: formHidden ? "none" : "block" }}>
              <input type="text" name="name" placeholder="Your Name" required style={{ width: "100%", marginBottom: 12, padding: "12px 14px", borderRadius: 8, border: "1px solid #ccc", fontSize: "1rem" }} />
              <input type="email" name="email" placeholder="Email Address" required style={{ width: "100%", marginBottom: 12, padding: "12px 14px", borderRadius: 8, border: "1px solid #ccc", fontSize: "1rem" }} />
              <input type="number" name="phone" placeholder="Phone Number +91 XXXXXXXX" required style={{ width: "100%", marginBottom: 12, padding: "12px 14px", borderRadius: 8, border: "1px solid #ccc", fontSize: "1rem" }} />
              <select name="orders" required style={{ width: "100%", marginBottom: 18, padding: "12px 14px", borderRadius: 8, border: "1px solid #ccc", fontSize: "1rem" }}>
                <option value="">Number of Orders per Day</option>
                <option>0-10</option>
                <option>10-50</option>
                <option>50-250</option>
                <option>250-1000</option>
                <option>1000-2500</option>
                <option>2500-5000</option>
                <option>5000+</option>
              </select>
              <select name="platform" required style={{ width: "100%", marginBottom: 18, padding: "12px 14px", borderRadius: 8, border: "1px solid #ccc", fontSize: "1rem" }}>
                <option value="">Platform of Selling</option>
                <option>Shopify</option>
                <option>WooCommerce</option>
                <option>Amazon</option>
                <option>Flipkart</option>
                <option>Magento</option>
                <option>Other</option>
              </select>
              <button type="submit" style={{ width: "100%", padding: 12, fontSize: "1.1rem", fontWeight: 600, background: "linear-gradient(135deg,#F5891E,#ffb347)", color: "white", border: "none", borderRadius: 8, cursor: "pointer", transition: "all 0.3s ease" }}>
                Join Now
              </button>
            </form>
            <div
              id="waitlist-success"
              style={{
                display: showSuccess ? "block" : "none",
                marginTop: 20,
                color: "#000434",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              🎉 Thank you! You're on the list — we'll reach out soon.
              <div style={{ marginTop: 20 }}>
                <a
                  href="https://chat.whatsapp.com/KfXknYz3Zgg9MPu3l2WvTT"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "14px 22px",
                    background: "linear-gradient(90deg, #0f1668ff, #010317ff)",
                    color: "#fff!important",
                    borderRadius: "50px",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.3)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
                  }}
                >
                  🚀 Join Our WhatsApp Community Now!
                </a>
                <p style={{ marginTop: 10, fontSize: 14, color: "#555" }}>
                  👉 Get insider RTO hacks, updates & early access!
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default JoinWaitingList;
