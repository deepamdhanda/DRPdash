import React, { useState, useCallback, useEffect, useMemo } from "react";

// ─── Replace with your actual API base URL ───────────────────────────────────
const API_BASE = "http://localhost:5000/checkout-customizer";// adjust to your Express route

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Figtree:wght@400;500;600;700&family=Nunito+Sans:wght@400;500;600;700&family=Barlow:wght@400;500;600;700&family=Rubik:wght@400;500;600;700&family=Geist:wght@400;500;600;700&display=swap";

function useFonts() {
  useEffect(() => {
    if (document.getElementById("checkout-google-fonts")) return;
    const link = document.createElement("link");
    link.id = "checkout-google-fonts";
    link.rel = "stylesheet";
    link.href = GOOGLE_FONTS_URL;
    document.head.appendChild(link);
  }, []);
}

function useGlobalFontInherit() {
  useEffect(() => {
    if (document.getElementById("checkout-font-inherit")) return;
    const style = document.createElement("style");
    style.id = "checkout-font-inherit";
    style.textContent = `
      button, input, select, textarea, optgroup, option {
        font-family: inherit;
      }
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }

      @media (max-width: 768px) {
        .customizer-layout {
          grid-template-columns: 1fr !important;
          padding: 12px !important;
          gap: 16px !important;
        }
        .settings-sidebar {
          height: auto !important;
          max-height: none !important;
        }
        .settings-scroll {
          max-height: 60vh;
          overflow-y: auto;
        }
        .sticky-action-bar {
          position: sticky !important;
          bottom: 0;
        }
        .preview-panel {
          display: flex;
          justify-content: center;
          padding-bottom: 24px;
        }
      }
    `;
    document.head.appendChild(style);
  }, []);
}

import {
  ArrowLeft,
  ShieldCheck,
  ShoppingBag,
  Package,
  RotateCcw,
  Lock,
  Smartphone,
  User,
  Wallet,
  ArrowRight,
  Zap,
  Banknote,
  CreditCard,
  CheckCircle2,
  Save,
  Eye,
  EyeOff,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";

type LucideIcon = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
type ButtonVariant = "solid" | "outline" | "ghost" | "gradient";
type ButtonRadius = "none" | "sm" | "md" | "lg" | "full";
type ButtonSize = "sm" | "md" | "lg";
type GradientDirection = "to right" | "to left" | "to bottom" | "135deg" | "45deg";

interface StyleType {
  gradientEnabled: boolean;
  gradientColor1: string;
  gradientColor2: string;
  gradientDirection: GradientDirection;
  buttonVariant: ButtonVariant;
  buttonRadius: ButtonRadius;
  buttonSize: ButtonSize;
  buttonBg: string;
  buttonText: string;
  buttonShadow: boolean;
  pageBg: string;
  surfaceBg: string;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
  accentColor: string;
  headerBg: string;
  showSocialProof: boolean;
  showTrustBadges: boolean;
  fontFamily: string;
  bodySize: string;
  headingSize: string;
  fontWeight: number;
  textTransform: "none" | "uppercase" | "capitalize" | "lowercase";
  letterSpacing: string;
  lineHeight: number;
  logoText: string;
  trustBadgeText: string;
  socialProofText: string;
}

// ─── Map backend doc → StyleType ────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function backendToStyle(doc: any): StyleType {
  return {
    gradientEnabled: doc.theme?.gradient?.on ?? true,
    gradientColor1: doc.theme?.gradient?.from ?? "#0f172a",
    gradientColor2: doc.theme?.gradient?.to ?? "#ec4899",
    gradientDirection: (doc.theme?.gradient?.dir ?? "to right") as GradientDirection,
    pageBg: doc.theme?.page ?? "#f8fafc",
    surfaceBg: doc.theme?.surface ?? "#ffffff",
    borderColor: doc.theme?.border ?? "#e2e8f0",
    textPrimary: doc.theme?.textPrimary ?? "#0f172a",
    textSecondary: doc.theme?.textSecondary ?? "#64748b",
    accentColor: doc.theme?.accent ?? "#0f172a",
    headerBg: doc.theme?.header ?? "#ffffff",
    fontFamily: doc.type?.font ?? "'Inter', sans-serif",
    headingSize: doc.type?.h ?? "1.375rem",
    bodySize: doc.type?.body ?? "0.9rem",
    fontWeight: doc.type?.weight ?? 600,
    textTransform: (doc.type?.transform ?? "none") as StyleType["textTransform"],
    letterSpacing: doc.type?.spacing ?? "0px",
    lineHeight: doc.type?.lineHeight ?? 1.5,
    buttonVariant: (doc.btn?.variant ?? "solid") as ButtonVariant,
    buttonRadius: (doc.btn?.radius ?? "md") as ButtonRadius,
    buttonSize: (doc.btn?.size ?? "md") as ButtonSize,
    buttonShadow: doc.btn?.shadow ?? true,
    buttonBg: "#0f172a",   // not stored in backend schema — keep local
    buttonText: "#ffffff", // not stored in backend schema — keep local
    logoText: doc.content?.top ?? "OrderzUp",
    trustBadgeText: doc.content?.badge ?? "Trusted by 10k+",
    socialProofText: doc.content?.proof ?? "127 people purchased in the last 24 hours · 4.8★ from 2,450+ customers",
    showTrustBadges: doc.toggles?.trust ?? true,
    showSocialProof: doc.toggles?.proof ?? true,
  };
}

// ─── Map StyleType → backend PATCH body ─────────────────────────────────────
function styleToPatch(s: StyleType) {
  return {
    "theme.page": s.pageBg,
    "theme.surface": s.surfaceBg,
    "theme.border": s.borderColor,
    "theme.textPrimary": s.textPrimary,
    "theme.textSecondary": s.textSecondary,
    "theme.accent": s.accentColor,
    "theme.header": s.headerBg,
    "theme.gradient.on": s.gradientEnabled,
    "theme.gradient.from": s.gradientColor1,
    "theme.gradient.to": s.gradientColor2,
    "theme.gradient.dir": s.gradientDirection,
    "type.font": s.fontFamily,
    "type.h": s.headingSize,
    "type.body": s.bodySize,
    "type.weight": s.fontWeight,
    "type.transform": s.textTransform,
    "type.spacing": s.letterSpacing,
    "type.lineHeight": s.lineHeight,
    "btn.variant": s.buttonVariant,
    "btn.radius": s.buttonRadius,
    "btn.size": s.buttonSize,
    "btn.shadow": s.buttonShadow,
    "content.top": s.logoText,
    "content.badge": s.trustBadgeText,
    "content.proof": s.socialProofText,
    "toggles.trust": s.showTrustBadges,
    "toggles.proof": s.showSocialProof,
  };
}

const GRADIENT_PRESETS = [
  { name: "OrderzUp", color1: "#0f172a", color2: "#074333" },
  { name: "Royal Blue", color1: "#141e30", color2: "#243b55" },
  { name: "Cosmic", color1: "#8e2de2", color2: "#4a00e0" },
  { name: "Forest", color1: "#134e5e", color2: "#71b280" },
  { name: "Candy", color1: "#ff6fd8", color2: "#3813c2" },
  { name: "Royal", color1: "#312e81", color2: "#6366f1" },
  { name: "Dark Gold", color1: "#111827", color2: "#f59e0b" },
  { name: "Rose", color1: "#e11d48", color2: "#fb7185" },
];

const DEFAULT: StyleType = {
  gradientEnabled: true,
  gradientColor1: "#0f172a",
  gradientColor2: "#074333",
  gradientDirection: "to right",
  fontFamily: "'Inter', sans-serif",
  headingSize: "1.375rem",
  bodySize: "0.9rem",
  fontWeight: 600,
  buttonVariant: "solid",
  buttonRadius: "md",
  buttonSize: "md",
  buttonBg: "#0f172a",
  buttonText: "#ffffff",
  buttonShadow: true,
  pageBg: "#f8fafc",
  surfaceBg: "#ffffff",
  borderColor: "#e2e8f0",
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  accentColor: "#0f172a",
  headerBg: "#ffffff",
  showSocialProof: true,
  showTrustBadges: true,
  textTransform: "none",
  letterSpacing: "0px",
  lineHeight: 1.5,
  logoText: "OrderzUp",
  trustBadgeText: "Trusted by 10k+",
  socialProofText: "127 people purchased in the last 24 hours · 4.8★ from 2,450+ customers",
};

const RADIUS_MAP: Record<ButtonRadius, string> = {
  none: "0px",
  sm: "4px",
  md: "10px",
  lg: "14px",
  full: "9999px",
};

const SIZE_PAD: Record<ButtonSize, string> = {
  sm: "10px 14px",
  md: "13px 18px",
  lg: "16px 22px",
};

function typo(s: StyleType): React.CSSProperties {
  return {
    fontFamily: s.fontFamily,
    fontWeight: s.fontWeight,
    fontSize: s.bodySize,
    letterSpacing: s.letterSpacing,
    lineHeight: s.lineHeight,
    textTransform: s.textTransform,
  };
}

function getButtonStyle(s: StyleType): React.CSSProperties {
  const radius = RADIUS_MAP[s.buttonRadius];
  const pad = SIZE_PAD[s.buttonSize];
  const bg =
    s.buttonVariant === "gradient"
      ? `linear-gradient(${s.gradientDirection}, ${s.gradientColor1}, ${s.gradientColor2})`
      : s.buttonVariant === "outline" || s.buttonVariant === "ghost"
        ? "transparent"
        : s.buttonBg;
  return {
    background: bg,
    color: s.buttonText,
    border: s.buttonVariant === "outline" ? `2px solid ${s.buttonBg}` : "none",
    borderRadius: radius,
    padding: pad,
    boxShadow: s.buttonShadow ? "0 4px 12px rgba(0,0,0,0.10)" : "none",
    ...typo(s),
    cursor: "pointer",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "opacity 0.2s",
    letterSpacing: "-0.01em",
  };
}

function getHeadingStyle(s: StyleType): React.CSSProperties {
  return {
    fontFamily: s.fontFamily,
    fontSize: s.headingSize,
    fontWeight: s.fontWeight,
    lineHeight: s.lineHeight,
    letterSpacing: s.letterSpacing,
    textTransform: s.textTransform,
    ...(s.gradientEnabled
      ? {
          background: getGradient(s),
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }
      : { color: s.textPrimary }),
  };
}

function getGradient(s: StyleType): string {
  return `linear-gradient(${s.gradientDirection}, ${s.gradientColor1}, ${s.gradientColor2})`;
}

const MOCK_ITEMS = [
  { title: "Premium Wireless Headphones", price: 299900, quantity: 1 },
  { title: "USB-C Charging Cable (2m)", price: 99900, quantity: 2 },
];

// ─── Preview Components (unchanged from original) ───────────────────────────

function PreviewHeader({ s }: { s: StyleType }) {
  return (
    <header
      style={{
        height: 52,
        background: s.headerBg,
        borderBottom: `1px solid ${s.borderColor}`,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ArrowLeft size={15} color={s.textSecondary} strokeWidth={2.25} />
        <div style={{ width: 1, height: 14, background: s.borderColor }} />
        <span style={{ ...typo(s), fontSize: 20, color: s.textPrimary }}>{s.logoText}</span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "4px 10px",
          borderRadius: 7,
          background: getGradient(s),
        }}>
        <ShieldCheck size={12} color="#fff" strokeWidth={2} />
        <span style={{ fontSize: 11, color: "#fff", ...typo(s) }}>{s.trustBadgeText}</span>
      </div>
    </header>
  );
}

function PreviewBanner({ s }: { s: StyleType }) {
  if (!s.showSocialProof) return null;
  return (
    <div
      style={{
        background: getGradient(s),
        padding: "9px 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        overflow: "hidden",
        flexShrink: 0,
      }}>
      <ShoppingBag size={12} color="#10b981" strokeWidth={2.25} />
      <span style={{ ...typo(s), fontSize: 11, color: "#f8fafc", fontWeight: 500, whiteSpace: "nowrap" }}>
        {s.socialProofText}
      </span>
    </div>
  );
}

function PreviewOrderSummary({ s }: { s: StyleType }) {
  const total = MOCK_ITEMS.reduce((sum, i) => sum + i.price * i.quantity, 0) / 100;
  const trustItems: [LucideIcon, string][] = [
    [ShieldCheck, "100% Safe"],
    [RotateCcw, "Easy Returns"],
    [Lock, "SSL Secured"],
  ];
  return (
    <div style={{ background: s.surfaceBg, borderRadius: 14, border: `1px solid ${s.borderColor}`, overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          background: "#f8fafc",
          borderBottom: `1px solid ${s.borderColor}`,
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ShoppingBag size={15} color={s.textPrimary} strokeWidth={2} />
          <span style={{ fontSize: 13, ...typo(s), color: s.textPrimary }}>Order summary</span>
          <div style={{ background: s.textPrimary, padding: "2px 7px", borderRadius: 5 }}>
            <span style={{ fontSize: 10, fontWeight: 700, ...typo(s), color: "#fff" }}>{MOCK_ITEMS.length} ITEMS</span>
          </div>
        </div>
        <span style={{ fontSize: 14, ...typo(s), color: s.textPrimary }}>₹{total.toFixed(2)}</span>
      </div>
      <div style={{ padding: "8px 16px 14px" }}>
        {MOCK_ITEMS.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "10px 0",
              borderBottom: i < MOCK_ITEMS.length - 1 ? "1px solid #f1f5f9" : "none",
            }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "#f1f5f9",
                border: `1px solid ${s.borderColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
              <Package size={16} color="#94a3b8" strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500, ...typo(s), color: s.textPrimary }}>{item.title}</div>
              <div style={{ fontSize: 11, ...typo(s), color: s.textSecondary, marginTop: 2 }}>Qty: {item.quantity}</div>
            </div>
            <span style={{ fontSize: 12, ...typo(s), color: s.textPrimary }}>
              ₹{((item.price * item.quantity) / 100).toFixed(2)}
            </span>
          </div>
        ))}
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          {(
            [
              ["Subtotal", `₹${total.toFixed(2)}`, false],
              ["Shipping", "FREE", true],
              ["Tax (GST)", "₹0.00", false],
            ] as [string, string, boolean][]
          ).map(([label, val, green]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, ...typo(s), color: s.textSecondary }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 500, ...typo(s), color: green ? "#10b981" : s.textPrimary }}>{val}</span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: getGradient(s),
              borderRadius: 10,
              padding: "12px 14px",
              marginTop: 4,
            }}>
            <span style={{ fontSize: 12, fontWeight: 500, ...typo(s), color: "#c4d8f5" }}>Total amount</span>
            <span style={{ fontSize: 18, fontWeight: 700, ...typo(s), color: "#fff" }}>₹{total.toFixed(2)}</span>
          </div>
        </div>
        {s.showTrustBadges && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              background: "#f8fafc",
              border: `1px solid ${s.borderColor}`,
              borderRadius: 9,
              padding: "10px 4px",
              marginTop: 10,
            }}>
            {trustItems.map(([Icon, label], i) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  borderLeft: i > 0 ? `1px solid ${s.borderColor}` : "none",
                }}>
                <Icon size={12} color="#047857" strokeWidth={2} />
                <span style={{ fontSize: 10, ...typo(s), color: "#334155" }}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewStepBar({ step, s }: { step: number; s: StyleType }) {
  const steps: { num: number; Icon: LucideIcon; label: string }[] = [
    { num: 1, Icon: Smartphone, label: "Phone" },
    { num: 2, Icon: User, label: "Details" },
    { num: 3, Icon: Wallet, label: "Payment" },
  ];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        marginBottom: 24,
        padding: "0 8px",
      }}>
      <div style={{ position: "absolute", top: 17, left: 32, right: 32, height: 2, background: s.borderColor, zIndex: 1 }} />
      {steps.map(({ num, Icon, label }) => {
        const isActive = step >= num;
        const isCurrent = step === num;
        return (
          <div key={num} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, width: 60 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: isCurrent ? s.accentColor : isActive ? s.textPrimary : "#f1f5f9",
                border: "2px solid #fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <Icon size={14} color={isActive ? "#fff" : "#94a3b8"} strokeWidth={2} />
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: isCurrent ? s.fontWeight : 500,
                ...typo(s),
                color: isCurrent ? s.textPrimary : "#94a3b8",
                marginTop: 8,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PreviewPhoneStep({ s }: { s: StyleType }) {
  const btnStyle = getButtonStyle(s);
  const trustItems: [LucideIcon, string][] = [
    [ShieldCheck, "Secure Checkout"],
    [Zap, "Auto-fill Details"],
  ];
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <h2 style={getHeadingStyle(s)}>Express Checkout</h2>
        <p style={{ ...typo(s), color: s.textSecondary, margin: 0 }}>
          Enter your phone number for a faster experience
        </p>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            border: `1px solid ${s.borderColor}`,
            borderRadius: RADIUS_MAP[s.buttonRadius],
            overflow: "hidden",
            background: s.surfaceBg,
          }}>
          <div
            style={{
              padding: "0 14px",
              background: "#f8fafc",
              borderRight: `1px solid ${s.borderColor}`,
              display: "flex",
              alignItems: "center",
              ...typo(s),
              color: "#475569",
            }}>
            +91
          </div>
          <div style={{ flex: 1, padding: "12px 14px", ...typo(s), color: "#94a3b8" }}>9876543210</div>
        </div>
      </div>
      <button style={btnStyle}>
        <span>Continue</span>
        <ArrowRight size={14} strokeWidth={2.25} />
      </button>
      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 16 }}>
        {trustItems.map(([Icon, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, ...typo(s), fontSize: 11, color: s.textSecondary }}>
            <Icon size={12} color="#10b981" strokeWidth={2} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewDetailsStep({ s }: { s: StyleType }) {
  const btnStyle = getButtonStyle(s);
  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: `1px solid ${s.borderColor}`,
    borderRadius: RADIUS_MAP[s.buttonRadius],
    padding: "10px 12px",
    ...typo(s),
    color: s.textPrimary,
    outline: "none",
    background: s.surfaceBg,
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 10,
    ...typo(s),
    color: s.textSecondary,
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };
  const fields: [string, string][] = [
    ["Full Name", "Rahul Sharma"],
    ["Email", "rahul@example.com"],
    ["Address Line 1", "123, MG Road, Bandra West"],
  ];
  const cityState: [string, string][] = [["City", "Mumbai"], ["State", "Maharashtra"]];
  return (
    <div>
      <h2 style={{ ...getHeadingStyle(s), marginBottom: 4, fontSize: s.bodySize, color: s.textSecondary }}>
        Delivery Details
      </h2>
      <p style={{ ...typo(s), color: s.textSecondary, margin: "0 0 16px" }}>Where should we deliver your order?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {fields.map(([label, ph]) => (
          <div key={label}>
            <label style={labelStyle}>{label}</label>
            <input readOnly placeholder={ph} style={inputStyle} />
          </div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {cityState.map(([label, ph]) => (
            <div key={label}>
              <label style={labelStyle}>{label}</label>
              <input readOnly placeholder={ph} style={inputStyle} />
            </div>
          ))}
        </div>
        <div>
          <label style={labelStyle}>PIN Code</label>
          <input readOnly placeholder="400050" style={{ ...inputStyle, maxWidth: 160 }} />
        </div>
      </div>
      <button style={{ ...btnStyle, marginTop: 16 }}>
        <span>Continue to Payment</span>
        <ArrowRight size={14} strokeWidth={2.25} />
      </button>
    </div>
  );
}

function PreviewPaymentStep({ s }: { s: StyleType }) {
  const btnStyle = getButtonStyle(s);
  const total = MOCK_ITEMS.reduce((sum, i) => sum + i.price * i.quantity, 0) / 100;
  interface PaymentMethod {
    id: string;
    Icon: LucideIcon;
    name: string;
    desc: string;
    badge?: string;
    selected?: boolean;
  }
  const methods: PaymentMethod[] = [
    { id: "prepaid", Icon: CreditCard, name: "Pay Online", desc: "Cards, UPI, Wallets", badge: "Extra 5% Off", selected: true },
    { id: "upi", Icon: Smartphone, name: "UPI / QR Code", desc: "PhonePe, GPay, Paytm", badge: "Most Popular" },
    { id: "wallet", Icon: Wallet, name: "Digital Wallets", desc: "Paytm, Amazon Pay" },
    { id: "cod", Icon: Banknote, name: "Cash on Delivery", desc: "COD Available" },
  ];
  return (
    <div>
      <h2 style={{ ...getHeadingStyle(s), marginBottom: 4 }}>Choose Payment</h2>
      <p style={{ ...typo(s), color: s.textSecondary, margin: "0 0 16px" }}>Select how you'd like to pay</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {methods.map(({ id, Icon, name, desc, badge, selected }) => (
          <div
            key={id}
            style={{
              border: selected ? `1.5px solid ${s.accentColor}` : `1px solid ${s.borderColor}`,
              borderRadius: RADIUS_MAP[s.buttonRadius],
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: selected ? "#f8fafc" : s.surfaceBg,
            }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
              <Icon size={16} color={s.textPrimary} strokeWidth={1.75} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, ...typo(s), color: s.textPrimary }}>{name}</div>
              <div style={{ fontSize: 11, ...typo(s), color: s.textSecondary }}>{desc}</div>
            </div>
            {badge && (
              <span
                style={{
                  background: selected ? s.accentColor : "#f1f5f9",
                  color: selected ? "#fff" : "#475569",
                  fontSize: 10,
                  ...typo(s),
                  padding: "3px 7px",
                  borderRadius: 5,
                  whiteSpace: "nowrap",
                }}>
                {badge}
              </span>
            )}
            {selected && <CheckCircle2 size={14} color="#10b981" strokeWidth={2} />}
          </div>
        ))}
      </div>
      <div
        style={{
          padding: "10px 12px",
          border: `1px solid ${s.borderColor}`,
          borderRadius: RADIUS_MAP[s.buttonRadius],
          background: "#f8fafc",
          marginBottom: 10,
        }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, ...typo(s), color: s.textSecondary }}>Order Total</span>
          <span style={{ fontSize: 12, ...typo(s), color: s.textPrimary }}>₹{total.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, ...typo(s), color: "#16a34a" }}>Extra Discount (5%)</span>
          <span style={{ fontSize: 11, fontWeight: s.fontWeight, ...typo(s), color: "#16a34a" }}>
            − ₹{(total * 0.05).toFixed(2)}
          </span>
        </div>
        <div style={{ borderTop: `1px solid ${s.borderColor}`, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, ...typo(s), color: s.textPrimary }}>You Pay</span>
          <span style={{ fontSize: 16, fontWeight: 700, ...typo(s), color: s.textPrimary }}>
            ₹{(total * 0.95).toFixed(2)}
          </span>
        </div>
      </div>
      <button style={btnStyle}>
        <span>Place Order</span>
        <ArrowRight size={14} strokeWidth={2.25} />
      </button>
    </div>
  );
}

function CheckoutPreview({ s }: { s: StyleType }) {
  const [step, setStep] = useState(1);
  return (
    <div
      style={{
        width: 400,
        margin: "0 auto",
        padding: 7,
        background: "#111827",
        borderRadius: 46,
        boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        position: "relative",
        ...typo(s),
        flexShrink: 0,
      }}>
      <div
        style={{
          position: "absolute",
          top: 14,
          left: "50%",
          transform: "translateX(-50%)",
          width: 126,
          height: 30,
          background: "#000",
          borderRadius: 999,
          zIndex: 100,
        }}
      />
      <div
        style={{
          borderRadius: 38,
          overflow: "hidden",
          background: s.pageBg,
          height: 750,
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}>
        <div
          style={{
            height: 52,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 22px",
            fontSize: 12,
            fontWeight: 600,
            color: "#111827",
            flexShrink: 0,
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 14, height: 10, border: "2px solid #111", borderRadius: 2 }} />
            <div style={{ width: 18, height: 10, background: "#111", borderRadius: 2 }} />
          </div>
        </div>
        <div
          style={{
            background: "#f8fafc",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: "1px solid #e2e8f0",
            flexShrink: 0,
          }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setStep(n)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "none",
                  background: step === n ? s.accentColor : "#e2e8f0",
                  color: step === n ? "#fff" : "#64748b",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <PreviewHeader s={s} />
        <PreviewBanner s={s} />
        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          <div
            className="hide-scrollbar"
            style={{
              position: "absolute",
              inset: 0,
              overflowY: "scroll",
              overflowX: "hidden",
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background: s.pageBg,
            }}>
            <PreviewOrderSummary s={s} />
            <div
              style={{
                background: s.surfaceBg,
                borderRadius: 14,
                border: `1px solid ${s.borderColor}`,
                padding: "20px 18px",
              }}>
              <PreviewStepBar step={step} s={s} />
              {step === 1 && <PreviewPhoneStep s={s} />}
              {step === 2 && <PreviewDetailsStep s={s} />}
              {step === 3 && <PreviewPaymentStep s={s} />}
            </div>
            <div style={{ height: 16, flexShrink: 0 }} />
          </div>
        </div>
      </div>
      <div style={{ width: 150, height: 5, borderRadius: 999, background: "#4b5563", margin: "8px auto 0" }} />
    </div>
  );
}

// ─── Sidebar UI Components ────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "16px 18px", marginBottom: 12 }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", margin: "0 0 6px" }}>{label}</p>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      style={{
        position: "relative",
        width: 38,
        height: 20,
        borderRadius: 10,
        background: value ? "#F5891E" : "#d1d5db",
        cursor: "pointer",
        transition: "background 0.2s",
        flexShrink: 0,
      }}>
      <span
        style={{
          position: "absolute",
          top: 2,
          left: value ? 20 : 2,
          width: 16,
          height: 16,
          background: "#fff",
          borderRadius: "50%",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transition: "left 0.2s",
        }}
      />
    </div>
  );
}

function Swatch({ value, label, onChange }: { value: string; label: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ opacity: 0, position: "absolute", inset: 0, width: "100%", height: "100%", cursor: "pointer" }}
        />
        <span style={{ display: "block", width: 24, height: 24, borderRadius: 6, border: "1px solid #e5e7eb", background: value }} />
      </div>
      <span style={{ fontSize: 13, color: "#374151", flex: 1 }}>{label}</span>
      <code style={{ fontSize: 10, color: "#9ca3af" }}>{value}</code>
    </div>
  );
}

function Chips({ options, value, onChange, labels }: { options: string[]; value: string; onChange: (v: string) => void; labels?: string[] }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map((o, i) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          style={{
            padding: "5px 10px",
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s",
            background: value === o ? "#F5891E" : "#f9fafb",
            color: value === o ? "#fff" : "#6b7280",
            border: value === o ? "1px solid #F5891E" : "1px solid #e5e7eb",
          }}>
          {labels ? labels[i] : o}
        </button>
      ))}
    </div>
  );
}

function Sel({ value, options, onChange, labels }: { value: string; options: string[]; onChange: (v: string) => void; labels?: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        fontSize: 13,
        color: "#374151",
        background: "#fff",
        outline: "none",
      }}>
      {options.map((o, i) => (
        <option key={o} value={o}>{labels ? labels[i] : o}</option>
      ))}
    </select>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        fontSize: 13,
        color: "#374151",
        background: "#fff",
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  );
}

function countUnsavedChanges(current: StyleType, saved: StyleType): number {
  let count = 0;
  const keys = Object.keys(saved) as (keyof StyleType)[];
  for (const key of keys) {
    if (current[key] !== saved[key]) count++;
  }
  return count;
}

// ─── Status Banner ────────────────────────────────────────────────────────────
type BannerState = "idle" | "loading" | "saving" | "saved" | "error";

function StatusBanner({ state, error }: { state: BannerState; error?: string }) {
  if (state === "idle") return null;
  const configs: Record<Exclude<BannerState, "idle">, { bg: string; icon: React.ReactNode; text: string }> = {
    loading: { bg: "#f0f9ff", icon: <Loader2 size={13} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />, text: "Loading saved settings…" },
    saving: { bg: "#fff7ed", icon: <Loader2 size={13} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />, text: "Saving to server…" },
    saved: { bg: "#f0fdf4", icon: <Check size={13} strokeWidth={2.5} color="#16a34a" />, text: "Settings saved successfully!" },
    error: { bg: "#fef2f2", icon: <AlertCircle size={13} color="#dc2626" strokeWidth={2} />, text: error ?? "Something went wrong." },
  };
  const cfg = configs[state];
  return (
    <div style={{
      background: cfg.bg,
      border: `1px solid ${state === "error" ? "#fecaca" : state === "saved" ? "#bbf7d0" : "#e0f2fe"}`,
      borderRadius: 8,
      padding: "8px 12px",
      display: "flex",
      alignItems: "center",
      gap: 7,
      fontSize: 12,
      color: "#374151",
      margin: "0 0 12px",
    }}>
      {cfg.icon}
      {cfg.text}
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function CheckoutCustomizerPage() {
  useFonts();
  useGlobalFontInherit();

  const [style, setStyle] = useState<StyleType>(DEFAULT);
  const [savedStyle, setSavedStyle] = useState<StyleType>(DEFAULT); // tracks what's persisted
  const [showPreview, setShowPreview] = useState(true);
  const [bannerState, setBannerState] = useState<BannerState>("loading");
  const [bannerError, setBannerError] = useState<string>();

  const unsavedCount = useMemo(() => countUnsavedChanges(style, savedStyle), [style, savedStyle]);

  // ── LOAD config on mount ──────────────────────────────────────────────────
  useEffect(() => {
    setBannerState("loading");
    fetch(API_BASE)
      .then((r) => {
        if (!r.ok) throw new Error(`Server returned ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (json.success && json.data) {
          const loaded = backendToStyle(json.data);
          setStyle(loaded);
          setSavedStyle(loaded);
        }
        setBannerState("idle");
      })
      .catch((err) => {
        console.error("Failed to load config:", err);
        setBannerError("Could not load settings from server — showing defaults.");
        setBannerState("error");
        setTimeout(() => setBannerState("idle"), 4000);
      });
  }, []);

  const set = useCallback(<K extends keyof StyleType>(key: K, val: StyleType[K]) => {
    setStyle((prev) => ({ ...prev, [key]: val }));
  }, []);

  // ── SAVE config ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    setBannerState("saving");
    try {
      const body = styleToPatch(style);
      const res = await fetch(API_BASE, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server error ${res.status}`);
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.message ?? "Save failed");
      // Update savedStyle to reflect what's now on the server
      setSavedStyle(style);
      setBannerState("saved");
      setTimeout(() => setBannerState("idle"), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setBannerError(msg);
      setBannerState("error");
      setTimeout(() => setBannerState("idle"), 4000);
    }
  };

  const handleReset = () => {
    setStyle(DEFAULT);
    // Note: reset is local-only — only saved on next "Save & Sync"
  };

  const applyGradientPreset = (color1: string, color2: string) => {
    setStyle((prev) => ({ ...prev, gradientColor1: color1, gradientColor2: color2 }));
  };

  const isSaving = bannerState === "saving";
  const isSaved = bannerState === "saved";

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: style.fontFamily }}>
      <div
        className="customizer-layout"
        style={{
          padding: "20px 24px",
          display: "grid",
          gridTemplateColumns: showPreview ? "360px 1fr" : "400px",
          gap: 24,
          maxWidth: 1140,
          margin: "0 auto",
          alignItems: "start",
        }}>

        {/* ── LEFT: Settings Sidebar ── */}
        <div
          className="settings-sidebar"
          style={{ position: "relative", height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>

          <div
            className="hide-scrollbar settings-scroll"
            style={{ flex: 1, overflowY: "auto", paddingRight: 2, paddingBottom: 8 }}>

            {/* Status banner sits at top of scroll area */}
            <div style={{ paddingTop: 4 }}>
              <StatusBanner state={bannerState} error={bannerError} />
            </div>

            <Section title="Branding & Content">
              <Row label="Store / Logo Text">
                <TextInput value={style.logoText} onChange={(v) => set("logoText", v)} placeholder="e.g. My Store" />
              </Row>
              <Row label="Trust Badge Text">
                <TextInput value={style.trustBadgeText} onChange={(v) => set("trustBadgeText", v)} placeholder="e.g. Trusted by 50,000+" />
              </Row>
              <Row label="Social Proof Banner Text">
                <TextInput value={style.socialProofText} onChange={(v) => set("socialProofText", v)} placeholder="e.g. 1,200 orders today" />
              </Row>
            </Section>

            <Section title="Brand Colors">
              <Row label="Presets">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyGradientPreset(preset.color1, preset.color2)}
                      style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 8, background: "#fff", cursor: "pointer" }}>
                      <div
                        style={{
                          height: 28,
                          borderRadius: 6,
                          background: `linear-gradient(${style.gradientDirection}, ${preset.color1}, ${preset.color2})`,
                          marginBottom: 6,
                        }}
                      />
                      <div style={{ fontSize: 11, fontWeight: 600, fontFamily: style.fontFamily, color: "#374151" }}>
                        {preset.name}
                      </div>
                    </button>
                  ))}
                </div>
              </Row>
              <Row label="Direction">
                <Sel
                  value={style.gradientDirection}
                  options={["to right", "to left", "to bottom", "135deg", "45deg"]}
                  onChange={(v) => set("gradientDirection", v as GradientDirection)}
                />
              </Row>
              <Row label="Colors">
                <Swatch value={style.gradientColor1} label="Color 1" onChange={(v) => set("gradientColor1", v)} />
                <Swatch value={style.gradientColor2} label="Color 2" onChange={(v) => set("gradientColor2", v)} />
                <div
                  style={{
                    height: 8,
                    borderRadius: 4,
                    marginTop: 10,
                    background: `linear-gradient(${style.gradientDirection}, ${style.gradientColor1}, ${style.gradientColor2})`,
                  }}
                />
              </Row>
            </Section>

            <Section title="Typography">
              <Row label="Font Family">
                <Sel
                  value={style.fontFamily}
                  options={[
                    "'Inter', sans-serif",
                    "'Plus Jakarta Sans', sans-serif",
                    "'Outfit', sans-serif",
                    "'Space Grotesk', sans-serif",
                    "'Figtree', sans-serif",
                    "'Nunito Sans', sans-serif",
                    "'Barlow', sans-serif",
                    "'Rubik', sans-serif",
                    "'Geist', sans-serif",
                  ]}
                  labels={["Inter", "Plus Jakarta Sans", "Outfit", "Space Grotesk", "Figtree", "Nunito Sans", "Barlow", "Rubik", "Geist"]}
                  onChange={(v) => set("fontFamily", v)}
                />
              </Row>
              <Row label="Font Weight">
                <Chips
                  options={["400", "500", "600", "700"]}
                  value={String(style.fontWeight)}
                  onChange={(v) => set("fontWeight", Number(v))}
                  labels={["Regular", "Medium", "Semibold", "Bold"]}
                />
              </Row>
              <Row label="Body Size">
                <Chips
                  options={["0.8rem", "0.875rem", "0.9rem", "1rem"]}
                  value={style.bodySize}
                  onChange={(v) => set("bodySize", v)}
                  labels={["XS", "SM", "MD", "LG"]}
                />
              </Row>
              <Row label="Text Transform">
                <Chips
                  options={["none", "capitalize", "uppercase"]}
                  value={style.textTransform}
                  onChange={(v) => set("textTransform", v as StyleType["textTransform"])}
                  labels={["None", "Capitalize", "Uppercase"]}
                />
              </Row>
            </Section>

            <Section title="Buttons">
              <Row label="Variant">
                <Chips
                  options={["solid", "outline", "gradient"]}
                  value={style.buttonVariant}
                  onChange={(v) => set("buttonVariant", v as ButtonVariant)}
                  labels={["Solid", "Outline", "Gradient"]}
                />
              </Row>
              <Row label="Radius">
                <Chips
                  options={["none", "sm", "md", "lg", "full"]}
                  value={style.buttonRadius}
                  onChange={(v) => set("buttonRadius", v as ButtonRadius)}
                  labels={["None", "SM", "MD", "LG", "Pill"]}
                />
              </Row>
              <Row label="Size">
                <Chips
                  options={["sm", "md", "lg"]}
                  value={style.buttonSize}
                  onChange={(v) => set("buttonSize", v as ButtonSize)}
                  labels={["Small", "Medium", "Large"]}
                />
              </Row>
              <Row label="Colors">
                <Swatch value={style.buttonBg} label="Background" onChange={(v) => set("buttonBg", v)} />
                <Swatch value={style.buttonText} label="Text" onChange={(v) => set("buttonText", v)} />
              </Row>
              <Row label="Shadow">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#374151" }}>Drop shadow</span>
                  <Toggle value={style.buttonShadow} onChange={() => set("buttonShadow", !style.buttonShadow)} />
                </div>
              </Row>
            </Section>

            <Section title="Page Colors">
              <Swatch value={style.pageBg} label="Page Background" onChange={(v) => set("pageBg", v)} />
              <Swatch value={style.surfaceBg} label="Card Background" onChange={(v) => set("surfaceBg", v)} />
              <Swatch value={style.borderColor} label="Border Color" onChange={(v) => set("borderColor", v)} />
              <Swatch value={style.textPrimary} label="Primary Text" onChange={(v) => set("textPrimary", v)} />
              <Swatch value={style.textSecondary} label="Secondary Text" onChange={(v) => set("textSecondary", v)} />
              <Swatch value={style.accentColor} label="Accent / Active" onChange={(v) => set("accentColor", v)} />
              <Swatch value={style.headerBg} label="Header Background" onChange={(v) => set("headerBg", v)} />
            </Section>

            <Section title="Widgets">
              <Row label="Trust Badges">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#374151" }}>Show trust badges</span>
                  <Toggle value={style.showTrustBadges} onChange={() => set("showTrustBadges", !style.showTrustBadges)} />
                </div>
              </Row>
              <Row label="Social Proof Banner">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#374151" }}>Show social proof</span>
                  <Toggle value={style.showSocialProof} onChange={() => set("showSocialProof", !style.showSocialProof)} />
                </div>
              </Row>
            </Section>

            <div style={{ height: 88 }} />
          </div>

          {/* ── STICKY BOTTOM ACTION BAR ── */}
          <div
            className="sticky-action-bar"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "#fff",
              borderTop: "1px solid #e5e7eb",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              zIndex: 10,
            }}>
            <button
              onClick={() => setShowPreview((v) => !v)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#fff",
                color: "#374151",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}>
              {showPreview ? <EyeOff size={13} strokeWidth={2} /> : <Eye size={13} strokeWidth={2} />}
              {showPreview ? "Hide" : "Show"}
            </button>

            <button
              onClick={handleReset}
              disabled={isSaving}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
                color: "#6b7280",
                fontSize: 12,
                fontWeight: 500,
                cursor: isSaving ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                flexShrink: 0,
                opacity: isSaving ? 0.5 : 1,
              }}>
              <RotateCcw size={13} strokeWidth={2} />
              Reset
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving || isSaved}
              style={{
                flex: 1,
                padding: "9px 14px",
                borderRadius: 8,
                border: "none",
                background: isSaved ? "#10b981" : isSaving ? "#fb923c" : "#F5891E",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                cursor: isSaving || isSaved ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "background 0.2s",
                position: "relative",
                opacity: isSaving ? 0.85 : 1,
              }}>
              {isSaved ? (
                <><Check size={13} strokeWidth={2.5} />Saved!</>
              ) : isSaving ? (
                <><Loader2 size={13} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />Saving…</>
              ) : (
                <>
                  <Save size={13} strokeWidth={2} />
                  Save &amp; Sync
                  {unsavedCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -7,
                        right: -7,
                        background: "#ef4444",
                        color: "#fff",
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "2px 5px",
                        borderRadius: 999,
                        whiteSpace: "nowrap",
                        lineHeight: 1.4,
                        letterSpacing: "0.01em",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                      }}>
                      {unsavedCount} change{unsavedCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── RIGHT: Phone Preview ── */}
        {showPreview && (
          <div
            className="preview-panel"
            style={{ position: "sticky", top: 20, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
            <CheckoutPreview s={style} />
          </div>
        )}
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
