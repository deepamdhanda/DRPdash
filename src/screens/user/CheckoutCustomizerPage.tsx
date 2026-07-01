import React, { useState, useCallback } from "react";
import { Save, RotateCcw, Eye, EyeOff, Check } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CheckoutStyle {
  // Gradient
  gradientEnabled: boolean;
  gradientColor1: string;
  gradientColor2: string;
  gradientDirection: string;
  // Typography
  fontFamily: string;
  headingSize: string;
  bodySize: string;
  fontWeight: number;
  // Button
  buttonVariant: "solid" | "outline" | "ghost" | "gradient";
  buttonRadius: "none" | "sm" | "md" | "lg" | "full";
  buttonSize: "sm" | "md" | "lg";
  buttonBg: string;
  buttonText: string;
  buttonShadow: boolean;
  buttonHoverScale: boolean;
  // Theme
  pageBg: string;
  surfaceBg: string;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
  accentColor: string;
}

const DEFAULT: CheckoutStyle = {
  gradientEnabled: true,
  gradientColor1: "#6366f1",
  gradientColor2: "#ec4899",
  gradientDirection: "to right",
  fontFamily: "'Inter', sans-serif",
  headingSize: "1.875rem",
  bodySize: "1rem",
  fontWeight: 600,
  buttonVariant: "solid",
  buttonRadius: "md",
  buttonSize: "md",
  buttonBg: "#6366f1",
  buttonText: "#ffffff",
  buttonShadow: true,
  buttonHoverScale: true,
  pageBg: "#ffffff",
  surfaceBg: "#f8fafc",
  borderColor: "#e2e8f0",
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  accentColor: "#6366f1",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const RADIUS_MAP = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "16px",
  full: "9999px",
};
const SIZE_MAP = { sm: "0.5rem 1rem", md: "0.75rem 1.5rem", lg: "1rem 2rem" };

function getButtonStyle(s: CheckoutStyle): React.CSSProperties {
  let bg = s.buttonBg;
  if (s.buttonVariant === "gradient") {
    bg = `linear-gradient(${s.gradientDirection}, ${s.gradientColor1}, ${s.gradientColor2})`;
  }
  return {
    background:
      s.buttonVariant === "outline" || s.buttonVariant === "ghost"
        ? "transparent"
        : bg,
    color: s.buttonText,
    border: s.buttonVariant === "outline" ? `2px solid ${s.buttonBg}` : "none",
    borderRadius: RADIUS_MAP[s.buttonRadius],
    padding: SIZE_MAP[s.buttonSize],
    boxShadow: s.buttonShadow ? "0 4px 14px rgba(0,0,0,0.15)" : "none",
    fontWeight: s.fontWeight,
    fontFamily: s.fontFamily,
    fontSize: s.bodySize,
    cursor: "pointer",
    width: "100%",
    transition: "transform 0.15s ease",
  };
}

function getHeadingStyle(s: CheckoutStyle): React.CSSProperties {
  if (s.gradientEnabled) {
    return {
      background: `linear-gradient(${s.gradientDirection}, ${s.gradientColor1}, ${s.gradientColor2})`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      fontSize: s.headingSize,
      fontFamily: s.fontFamily,
      fontWeight: s.fontWeight,
      margin: "0 0 6px",
    };
  }
  return {
    color: s.textPrimary,
    fontSize: s.headingSize,
    fontFamily: s.fontFamily,
    fontWeight: s.fontWeight,
    margin: "0 0 6px",
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

const Row = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="mb-4">
    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
      {label}
    </p>
    {children}
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl border border-neutral-200 p-5 mb-4">
    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-4">
      {title}
    </p>
    {children}
  </div>
);

const Toggle = ({
  value,
  onChange,
}: {
  value: boolean;
  onChange: () => void;
}) => (
  <div
    onClick={onChange}
    className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${
      value ? "bg-[#F5891E]" : "bg-neutral-200"
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
        value ? "translate-x-5" : ""
      }`}
    />
  </div>
);

const Swatch = ({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex items-center gap-3 py-1.5">
    <div className="relative">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
      />
      <span
        className="block w-7 h-7 rounded-md border border-neutral-200 shadow-sm"
        style={{ background: value }}
      />
    </div>
    <span className="text-[13px] text-neutral-600 flex-1">{label}</span>
    <code className="text-[11px] text-neutral-400">{value}</code>
  </div>
);

const Chips = ({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex gap-2 flex-wrap">
    {options.map((o) => (
      <button
        key={o}
        onClick={() => onChange(o)}
        className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all border ${
          value === o
            ? "bg-[#F5891E] text-white border-[#F5891E]"
            : "bg-white text-neutral-500 border-neutral-200 hover:border-[#F5891E] hover:text-[#F5891E]"
        }`}
      >
        {o}
      </button>
    ))}
  </div>
);

const Sel = ({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#F5891E]/40 focus:border-[#F5891E] transition-all"
  >
    {options.map((o) => (
      <option key={o} value={o}>
        {o}
      </option>
    ))}
  </select>
);

// ── Main ──────────────────────────────────────────────────────────────────────

const CheckoutCustomizerPage: React.FC = () => {
  const [style, setStyle] = useState<CheckoutStyle>(() => {
    try {
      const raw = localStorage.getItem("checkout-style");
      return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
    } catch {
      return DEFAULT;
    }
  });

  const [showPreview, setShowPreview] = useState(true);
  const [saved, setSaved] = useState(false);
  const [hovering, setHovering] = useState(false);

  const set = useCallback(
    <K extends keyof CheckoutStyle>(key: K, val: CheckoutStyle[K]) => {
      setStyle((prev) => ({ ...prev, [key]: val }));
      setSaved(false);
    },
    []
  );

  const handleSave = () => {
    localStorage.setItem("checkout-style", JSON.stringify(style));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setStyle(DEFAULT);
    setSaved(false);
  };

  const btnStyle = getButtonStyle(style);
  const h1Style = getHeadingStyle(style);

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">
            Checkout Style
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            Customise how your checkout page looks to customers
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-neutral-500 bg-white border border-neutral-200 hover:border-[#F5891E] hover:text-[#F5891E] transition-all"
          >
            {showPreview ? (
              <EyeOff size={16} strokeWidth={2.5} />
            ) : (
              <Eye size={16} strokeWidth={2.5} />
            )}
            {showPreview ? "Hide preview" : "Show preview"}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-neutral-500 bg-white border border-neutral-200 hover:text-red-500 hover:border-red-300 transition-all"
          >
            <RotateCcw size={16} strokeWidth={2.5} />
            Reset
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
              saved
                ? "bg-green-500 text-white"
                : "bg-[#F5891E] text-white hover:bg-orange-500"
            }`}
          >
            {saved ? (
              <Check size={16} strokeWidth={2.5} />
            ) : (
              <Save size={16} strokeWidth={2.5} />
            )}
            {saved ? "Saved!" : "Save & Sync"}
          </button>
        </div>
      </div>

      <div
        className={`grid gap-6 ${
          showPreview ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1 max-w-xl"
        }`}
      >
        {/* ── Controls ── */}
        <div>
          {/* Gradient */}
          <Section title="Text Gradient">
            <Row label="Enabled">
              <div className="flex items-center gap-3">
                <Toggle
                  value={style.gradientEnabled}
                  onChange={() =>
                    set("gradientEnabled", !style.gradientEnabled)
                  }
                />
                <span className="text-sm text-neutral-500">
                  {style.gradientEnabled ? "On" : "Off"}
                </span>
              </div>
            </Row>
            <Row label="Direction">
              <Sel
                value={style.gradientDirection}
                options={[
                  "to right",
                  "to left",
                  "to bottom",
                  "to top",
                  "to bottom right",
                  "135deg",
                  "45deg",
                ]}
                onChange={(v) => set("gradientDirection", v)}
              />
            </Row>
            <Row label="Colors">
              <Swatch
                value={style.gradientColor1}
                label="Color 1"
                onChange={(v) => set("gradientColor1", v)}
              />
              <Swatch
                value={style.gradientColor2}
                label="Color 2"
                onChange={(v) => set("gradientColor2", v)}
              />
              {/* Preview strip */}
              <div
                className="mt-3 h-5 rounded-full"
                style={{
                  background: `linear-gradient(${style.gradientDirection}, ${style.gradientColor1}, ${style.gradientColor2})`,
                }}
              />
            </Row>
          </Section>

          {/* Typography */}
          <Section title="Typography">
            <Row label="Font Family">
              <Sel
                value={style.fontFamily}
                options={[
                  "'Inter', sans-serif",
                  "'Poppins', sans-serif",
                  "'DM Sans', sans-serif",
                  "'Sora', sans-serif",
                  "'Manrope', sans-serif",
                  "'Plus Jakarta Sans', sans-serif",
                ]}
                onChange={(v) => set("fontFamily", v)}
              />
            </Row>
            <div className="grid grid-cols-2 gap-3">
              <Row label="Heading Size">
                <Sel
                  value={style.headingSize}
                  options={["1.25rem", "1.5rem", "1.875rem", "2.25rem", "3rem"]}
                  onChange={(v) => set("headingSize", v)}
                />
              </Row>
              <Row label="Body Size">
                <Sel
                  value={style.bodySize}
                  options={["0.875rem", "1rem", "1.125rem"]}
                  onChange={(v) => set("bodySize", v)}
                />
              </Row>
            </div>
            <Row label="Font Weight">
              <Chips
                options={["400", "500", "600", "700", "800"]}
                value={String(style.fontWeight)}
                onChange={(v) => set("fontWeight", Number(v))}
              />
            </Row>
          </Section>

          {/* Button */}
          <Section title="Button Style">
            <Row label="Variant">
              <Chips
                options={["solid", "outline", "ghost", "gradient"]}
                value={style.buttonVariant}
                onChange={(v) => set("buttonVariant", v as any)}
              />
            </Row>
            <div className="grid grid-cols-2 gap-3">
              <Row label="Size">
                <Chips
                  options={["sm", "md", "lg"]}
                  value={style.buttonSize}
                  onChange={(v) => set("buttonSize", v as any)}
                />
              </Row>
              <Row label="Radius">
                <Chips
                  options={["none", "sm", "md", "lg", "full"]}
                  value={style.buttonRadius}
                  onChange={(v) => set("buttonRadius", v as any)}
                />
              </Row>
            </div>
            <Row label="Colors">
              <Swatch
                value={style.buttonBg}
                label="Background"
                onChange={(v) => set("buttonBg", v)}
              />
              <Swatch
                value={style.buttonText}
                label="Text"
                onChange={(v) => set("buttonText", v)}
              />
            </Row>
            <Row label="Options">
              <div className="flex flex-col gap-2">
                {(
                  [
                    ["buttonShadow", "Drop shadow"],
                    ["buttonHoverScale", "Scale on hover"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-3">
                    <Toggle
                      value={style[key] as boolean}
                      onChange={() => set(key, !style[key] as any)}
                    />
                    <span className="text-sm text-neutral-500">{label}</span>
                  </div>
                ))}
              </div>
            </Row>
          </Section>

          {/* Theme */}
          <Section title="Color Theme">
            <Swatch
              value={style.pageBg}
              label="Page background"
              onChange={(v) => set("pageBg", v)}
            />
            <Swatch
              value={style.surfaceBg}
              label="Surface / input background"
              onChange={(v) => set("surfaceBg", v)}
            />
            <Swatch
              value={style.borderColor}
              label="Border color"
              onChange={(v) => set("borderColor", v)}
            />
            <Swatch
              value={style.textPrimary}
              label="Text primary"
              onChange={(v) => set("textPrimary", v)}
            />
            <Swatch
              value={style.textSecondary}
              label="Text secondary"
              onChange={(v) => set("textSecondary", v)}
            />
            <Swatch
              value={style.accentColor}
              label="Accent color"
              onChange={(v) => set("accentColor", v)}
            />
          </Section>
        </div>

        {/* ── Preview ── */}
        {showPreview && (
          <div className="xl:sticky xl:top-6 xl:self-start">
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
              {/* Browser chrome */}
              <div className="px-5 py-3 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-neutral-400 font-medium">
                  checkout preview
                </span>
              </div>

              {/* Mock checkout */}
              <div
                className="p-8"
                style={{
                  background: style.pageBg,
                  fontFamily: style.fontFamily,
                }}
              >
                <h2 style={h1Style}>Complete your order</h2>
                <p
                  style={{
                    color: style.textSecondary,
                    fontSize: style.bodySize,
                    marginBottom: "1.5rem",
                  }}
                >
                  Secure checkout · All fields required
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginBottom: "1.5rem",
                  }}
                >
                  {["Email address", "Card number", "Expiry / CVC"].map((p) => (
                    <input
                      key={p}
                      placeholder={p}
                      readOnly
                      style={{
                        padding: "0.75rem 1rem",
                        borderRadius: RADIUS_MAP[style.buttonRadius],
                        border: `1px solid ${style.borderColor}`,
                        background: style.surfaceBg,
                        color: style.textPrimary,
                        fontFamily: style.fontFamily,
                        fontSize: style.bodySize,
                        outline: "none",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    />
                  ))}
                </div>

                <button
                  style={{
                    ...btnStyle,
                    transform:
                      hovering && style.buttonHoverScale
                        ? "scale(1.03)"
                        : "scale(1)",
                  }}
                  onMouseEnter={() => setHovering(true)}
                  onMouseLeave={() => setHovering(false)}
                >
                  Pay Now
                </button>

                <p
                  style={{
                    textAlign: "center",
                    fontSize: "0.75rem",
                    color: style.textSecondary,
                    marginTop: "1rem",
                  }}
                >
                  🔒 Payments are encrypted and secure
                </p>
              </div>
            </div>
            <p className="text-xs text-neutral-400 text-center mt-3">
              Live preview · changes sync on save
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutCustomizerPage;
