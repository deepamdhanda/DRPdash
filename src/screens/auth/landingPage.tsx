import React, { useEffect, useState } from "react";

const brandColors = {
  navy: "#000434",
  orange: "#F5891E",
  white: "#FFFFFF",
  darkBg: "#0A0B24",
  lightOrange: "rgba(245, 137, 30, 0.15)",
};

// const fadeIn = {
//   opacity: 1,
//   transform: "translateY(0)",
//   transition: "opacity 0.7s ease, transform 0.7s ease",
// };
// const fadeOut = {
//   opacity: 0,
//   transform: "translateY(20px)",
// };

const LandingPage: React.FC = () => {
  // Animation states for sections to fade in sequentially
  const [visibleSections, setVisibleSections] = useState({
    intro: false,
    values: false,
    features: false,
    steps: false,
    testimonials: false,
    finalCTA: false,
    faqs: false,
  });

  useEffect(() => {
    // Animate sections sequentially on mount
    const timers = [
      setTimeout(() => setVisibleSections((v) => ({ ...v, intro: true })), 300),
      setTimeout(() => setVisibleSections((v) => ({ ...v, values: true })), 900),
      setTimeout(() => setVisibleSections((v) => ({ ...v, features: true })), 1500),
      setTimeout(() => setVisibleSections((v) => ({ ...v, steps: true })), 2100),
      setTimeout(() => setVisibleSections((v) => ({ ...v, testimonials: true })), 2700),
      setTimeout(() => setVisibleSections((v) => ({ ...v, finalCTA: true })), 3300),
      setTimeout(() => setVisibleSections((v) => ({ ...v, faqs: true })), 3900),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Hover animation for CTA button to add urgency & FOMO
  const [ctaHover, setCtaHover] = useState(false);

  const commonContainerStyle: React.CSSProperties = {
    maxWidth: 1080,
    margin: "0 auto",
    padding: "50px 20px 80px",
    fontFamily: "'Hiragino Maru Gothic ProN W4', 'Poppins', sans-serif",
    color: brandColors.white,
    lineHeight: 1.6,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: "0.12em",
    marginBottom: 32,
    textTransform: "uppercase",
    textAlign: "center",
    background: `linear-gradient(90deg, ${brandColors.orange}, #8e2de2)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  const cardStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${brandColors.lightOrange}, rgba(142, 45, 226, 0.15))`,
    borderRadius: 24,
    padding: 28,
    boxShadow: `inset 0 0 22px ${brandColors.orange}44, inset 0 0 28px #8e2de244`,
    flex: "1 1 260px",
    color: brandColors.white,
    fontWeight: 700,
    userSelect: "none",
    cursor: "default",
    transition: "transform 0.35s ease",
  };

  const iconStyle: React.CSSProperties = {
    fontSize: 44,
    marginBottom: 20,
    textShadow: `0 0 16px ${brandColors.orange}, 0 0 26px #8e2de2`,
    userSelect: "none",
  };

  const ctaButtonStyle: React.CSSProperties = {
    background: ctaHover
      ? `linear-gradient(135deg, #F5891E 0%, #FF7B00 60%, #F54E00 100%)`
      : `linear-gradient(135deg, ${brandColors.orange} 0%, #8e2de2 100%)`,
    color: brandColors.navy,
    fontWeight: "900",
    fontSize: 24,
    padding: "20px 72px",
    borderRadius: 40,
    border: "none",
    cursor: "pointer",
    boxShadow: ctaHover
      ? `0 0 36px #F54E00, 0 0 48px #FF7B00`
      : `0 0 18px ${brandColors.orange}, 0 0 32px #8e2de2`,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    userSelect: "none",
    transition: "all 0.4s ease",
    marginTop: 24,
  };

  return (
    <div
      style={{
        background: `radial-gradient(circle at top left, ${brandColors.navy}, ${brandColors.darkBg})`,
        minHeight: "100vh",
      }}
    >
      <div style={commonContainerStyle}>
        {/* RTO Question with urgency */}
        <section
          style={{
            textAlign: "center",
            marginBottom: 60,
            color: brandColors.orange,
            fontWeight: "900",
            fontSize: 28,
            letterSpacing: "0.1em",
            textShadow: `0 0 12px ${brandColors.orange}, 0 0 24px #ff6200`,
            userSelect: "none",
            opacity: visibleSections.intro ? 1 : 0,
            transform: visibleSections.intro ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
          aria-label="Reduce your RTO losses now"
        >
          <p>
            🚨 <strong>Is your business losing thousands to RTOs every month?</strong> Don't let
            returns kill your growth.
          </p>
        </section>

        {/* Intro of OrderzUp */}
        <section
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 100,
            opacity: visibleSections.intro ? 1 : 0,
            transform: visibleSections.intro ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 1s ease 0.3s, transform 1s ease 0.3s",
          }}
          aria-label="Introduction to OrderzUp"
        >
          <div
            style={{
              flex: "1 1 460px",
              maxWidth: 460,
              color: brandColors.white,
              paddingRight: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 18,
                userSelect: "none",
              }}
            >
              {/* Brand logo placeholder */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: brandColors.orange,
                  borderRadius: 12,
                  marginRight: 14,
                  boxShadow: `0 0 18px ${brandColors.orange}`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: "900",
                  fontSize: 28,
                  color: brandColors.navy,
                  fontFamily: "'Hiragino Maru Gothic ProN W4', sans-serif",
                }}
              >
                O
              </div>
              <h1
                style={{
                  fontSize: 44,
                  fontWeight: "900",
                  color: brandColors.orange,
                  letterSpacing: "0.12em",
                  margin: 0,
                }}
              >
                OrderzUp
              </h1>
            </div>

            <h2
              style={{
                fontSize: 26,
                fontWeight: "700",
                marginBottom: 24,
                color: "#eee",
                letterSpacing: "0.08em",
              }}
            >
              Your AI-powered logistics partner to slash RTOs & boost delivery success.
            </h2>

            <p
              style={{
                fontSize: 18,
                fontWeight: 500,
                marginBottom: 30,
                color: "#ccc",
                lineHeight: 1.5,
              }}
            >
              Ship smarter with data-backed courier recommendations, risk detection, and real-time tracking. Start growing without worrying about costly returns.
            </p>

            <button
              style={ctaButtonStyle}
              onMouseEnter={() => setCtaHover(true)}
              onMouseLeave={() => setCtaHover(false)}
              onClick={() => alert("Redirecting to signup / demo request")}
              aria-label="Start your free trial with OrderzUp"
            >
              Start Free Trial — Limited Spots!
            </button>

            <p
              style={{
                marginTop: 14,
                fontSize: 12,
                color: "#aaa",
                fontStyle: "italic",
                maxWidth: 320,
                userSelect: "none",
              }}
            >
              *No credit card required. Cancel anytime.
            </p>
          </div>

          {/* Hero image placeholder */}
          <div
            aria-hidden="true"
            style={{
              flex: "1 1 460px",
              maxWidth: 460,
              marginTop: 20,
              borderRadius: 24,
              boxShadow: `0 0 48px ${brandColors.orange}88, 0 0 72px #8e2de288`,
              background:
                "url('https://images.unsplash.com/photo-1605902711622-cfb43c443f9f?auto=format&fit=crop&w=800&q=80') no-repeat center/cover",
              height: 360,
            }}
          />
        </section>

        {/* 5 Values */}
        <section
          aria-label="5 Values OrderzUp adds to your business"
          style={{
            marginBottom: 80,
            opacity: visibleSections.values ? 1 : 0,
            transform: visibleSections.values ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <h2 style={sectionTitleStyle}>5 Values We Add To Your Business</h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              justifyContent: "center",
            }}
          >
            {[
              ["⚡️", "Lightning-fast Delivery", "Your shipments reach customers quicker than ever."],
              ["🔒", "Risk Reduction", "Our AI spots risky orders to prevent costly returns."],
              ["📈", "Business Growth", "Focus on sales while we optimize your logistics."],
              ["🤖", "Smart Automation", "Let AI handle courier selection and tracking."],
              ["💼", "Reliable Partnership", "Count on us to protect your brand reputation."],
            ].map(([icon, title, desc]) => (
              <div
                key={title}
                style={{ ...cardStyle, minWidth: 260 }}
                tabIndex={0}
                aria-label={`${title} - ${title} : ${desc}`}
              >
                <div style={iconStyle}>{icon}</div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: "900",
                    marginBottom: 12,
                    color: brandColors.orange,
                  }}
                >
                  {title}
                </h3>
                <p style={{ color: "#ddd", fontWeight: 600 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4 Features */}
        <section
          aria-label="4 Features of OrderzUp"
          style={{
            marginBottom: 80,
            opacity: visibleSections.features ? 1 : 0,
            transform: visibleSections.features ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <h2 style={sectionTitleStyle}>4 Features Making Your Life Easier</h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              justifyContent: "center",
            }}
          >
            {[
              [
                "📦",
                "Courier Recommendation",
                "AI-powered suggestions pick the best courier based on cost, speed & success rate.",
              ],
              [
                "🛡️",
                "RTO Shield",
                "Identify high-risk orders early to drastically reduce returns and losses.",
              ],
              [
                "📲",
                "Real-time Tracking",
                "Keep your customers happy with live shipment updates and notifications.",
              ],
              [
                "🔗",
                "Seamless Integrations",
                "Plug directly into Shopify, WooCommerce & more in minutes.",
              ],
            ].map(([icon, title, desc]) => (
              <div
                key={title}
                style={{ ...cardStyle, minWidth: 260 }}
                tabIndex={0}
                aria-label={`${title} - ${title} : ${desc}`}
              >
                <div style={iconStyle}>{icon}</div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: "900",
                    marginBottom: 12,
                    color: brandColors.orange,
                  }}
                >
                  {title}
                </h3>
                <p style={{ color: "#ddd", fontWeight: 600 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3 Steps */}
        <section
          aria-label="How OrderzUp Works in 3 Steps"
          style={{
            marginBottom: 80,
            opacity: visibleSections.steps ? 1 : 0,
            transform: visibleSections.steps ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <h2 style={sectionTitleStyle}>How It Works in 3 Easy Steps</h2>
          <ol
            style={{
              maxWidth: 720,
              margin: "0 auto",
              fontSize: 18,
              fontWeight: 600,
              color: "#eee",
              paddingLeft: 24,
              userSelect: "none",
              lineHeight: 1.8,
            }}
          >
            <li style={{ marginBottom: 18 }}>
              <strong>Connect Your Store:</strong> Link your Shopify or WooCommerce in minutes.
            </li>
            <li style={{ marginBottom: 18 }}>
              <strong>Let AI Analyze Orders:</strong> We identify risks & recommend optimal couriers
              automatically.
            </li>
            <li style={{ marginBottom: 18 }}>
              <strong>Ship Confidently:</strong> Focus on your business while we minimize returns and
              keep customers happy.
            </li>
          </ol>
        </section>

        {/* 2 Testimonials */}
        <section
          aria-label="Customer testimonials"
          style={{
            marginBottom: 80,
            opacity: visibleSections.testimonials ? 1 : 0,
            transform: visibleSections.testimonials ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <h2 style={sectionTitleStyle}>What Our Clients Say</h2>
          <div
            style={{
              display: "flex",
              gap: 32,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {[
              {
                name: "Rhea M.",
                role: "E-commerce Owner",
                quote:
                  "OrderzUp cut my RTO rate by over 35% in the first 2 months — the AI courier recommendations are next level!",
              },
              {
                name: "Sahil K.",
                role: "Logistics Manager",
                quote:
                  "The real-time tracking and risk detection gave us peace of mind and boosted customer satisfaction dramatically.",
              },
            ].map(({ name, role, quote }) => (
              <blockquote
                key={name}
                style={{
                  background: brandColors.navy,
                  borderRadius: 24,
                  padding: 28,
                  maxWidth: 420,
                  color: "#ccc",
                  fontStyle: "italic",
                  boxShadow: `0 0 24px ${brandColors.orange}99`,
                  userSelect: "none",
                }}
                tabIndex={0}
                aria-label={`Testimonial from ${name}, ${role}: ${quote}`}
              >
                <p style={{ fontSize: 18, marginBottom: 14 }}>"{quote}"</p>
                <footer
                  style={{
                    fontWeight: "900",
                    fontSize: 16,
                    color: brandColors.orange,
                  }}
                >
                  — {name}, <span style={{ fontWeight: "600" }}>{role}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* 1 Final CTA */}
        <section
          style={{
            textAlign: "center",
            marginBottom: 100,
            opacity: visibleSections.finalCTA ? 1 : 0,
            transform: visibleSections.finalCTA ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
            userSelect: "none",
          }}
          aria-label="Final call to action"
        >
          <h2
            style={{
              fontSize: 32,
              fontWeight: "900",
              marginBottom: 20,
              color: brandColors.orange,
              letterSpacing: "0.12em",
              textShadow: `0 0 18px ${brandColors.orange}, 0 0 26px #ff7b00`,
            }}
          >
            Ready to Slash Your RTOs Today?
          </h2>
          <button
            style={ctaButtonStyle}
            onMouseEnter={() => setCtaHover(true)}
            onMouseLeave={() => setCtaHover(false)}
            onClick={() => alert("Redirecting to signup / demo request")}
            aria-label="Get started with OrderzUp now"
          >
            Get Started Now — Limited Time Offer!
          </button>
          <p
            style={{
              marginTop: 14,
              fontSize: 12,
              color: "#aaa",
              fontStyle: "italic",
              maxWidth: 320,
              margin: "auto",
            }}
          >
            *No credit card required. Offer valid for first 100 signups.
          </p>
        </section>

        {/* FAQs */}
        <section
          aria-label="Frequently asked questions about OrderzUp"
          style={{
            maxWidth: 720,
            margin: "0 auto 80px",
            opacity: visibleSections.faqs ? 1 : 0,
            transform: visibleSections.faqs ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
            color: "#ddd",
          }}
        >
          <h2 style={sectionTitleStyle}>Frequently Asked Questions</h2>
          <details style={{ marginBottom: 14, cursor: "pointer" }}>
            <summary style={{ fontWeight: 700, fontSize: 18, color: brandColors.orange }}>
              How quickly can I integrate OrderzUp with my store?
            </summary>
            <p style={{ marginTop: 6, fontWeight: 500 }}>
              Integration is seamless — connect your Shopify or WooCommerce store in under 5 minutes
              with no coding required.
            </p>
          </details>
          <details style={{ marginBottom: 14, cursor: "pointer" }}>
            <summary style={{ fontWeight: 700, fontSize: 18, color: brandColors.orange }}>
              Does OrderzUp guarantee reduced RTOs?
            </summary>
            <p style={{ marginTop: 6, fontWeight: 500 }}>
              While no system can guarantee 100%, our AI-driven recommendations have helped clients
              reduce RTO rates by up to 40% consistently.
            </p>
          </details>
          <details style={{ marginBottom: 14, cursor: "pointer" }}>
            <summary style={{ fontWeight: 700, fontSize: 18, color: brandColors.orange }}>
              Is there a free trial available?
            </summary>
            <p style={{ marginTop: 6, fontWeight: 500 }}>
              Yes! You can start a free trial with no credit card required and cancel anytime.
            </p>
          </details>
          <details style={{ marginBottom: 14, cursor: "pointer" }}>
            <summary style={{ fontWeight: 700, fontSize: 18, color: brandColors.orange }}>
              What kind of support do you provide?
            </summary>
            <p style={{ marginTop: 6, fontWeight: 500 }}>
              Our dedicated support team is available 24/7 via chat and email to help you get the
              most out of OrderzUp.
            </p>
          </details>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
