import React from "react";

type Props = {
  score: number;
  label?: boolean;
  width?: number;
  validTill?: string | null;
};

const polarToCartesian = (
  cx: number,
  cy: number,
  r: number,
  angleInDegrees: number
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
};

const describeArc = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    r,
    r,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
};

const CreditScoreMeter: React.FC<Props> = ({
  score,
  label = false,
  width = 120,
  validTill = null,
}) => {
  const raw = Number(score) || 0;
  const size = Math.max(width, 100);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.42; // leave room for ticks
  const needleLen = radius * 0.95;

  // Semicircle gauge: -90deg (left) to +90deg (right)
  const startAngle = -90;
  const endAngle = 90;

  // Visible range: 300 -> 900
  const minVisible = 300;
  const maxVisible = 900;
  const displayScore = Math.max(minVisible, Math.min(raw, maxVisible));
  const angle =
    startAngle +
    ((displayScore - minVisible) / (maxVisible - minVisible)) *
      (endAngle - startAngle);

  // Zones: neutral gray from 300-450, then colors start after 450
  const zones = [
    { from: minVisible, to: 450, color: "#ff1744" }, // neutral
    { from: 450, to: 650, color: "#ff9100" }, // bright orange
    { from: 650, to: maxVisible, color: "#00e676" }, // bright green
  ];

  const tooltip = `${raw}/900 — ${
    raw < 450 ? "High Risk" : raw < 650 ? "Moderate" : "Low Risk"
  }\nValid Until ${validTill || "N/A"}`;

  return (
    <div
      role="img"
      aria-label={`Ecom credit score ${score} out of 900`}
      title={tooltip}
      style={{
        width: size,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        // gap: 6,
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <svg
        width={size}
        height={size * 0.75}
        viewBox={`0 0 ${size} ${size * 0.75} `}
      >
        <defs>
          <linearGradient id="gloom" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop
              offset="0%"
              stopColor="rgba(255,255,255,0.6)"
              stopOpacity="0.6"
            />
            <stop
              offset="100%"
              stopColor="rgba(0,0,0,0.02)"
              stopOpacity="0.02"
            />
          </linearGradient>
        </defs>

        {/* Outer subtle ring */}
        {/* <circle cx={cx} cy={cy} r={radius + 18} fill="none" stroke="#f0f0f0" strokeWidth={6} /> */}

        {/* Draw color zones as arcs (mapped to visible range) */}
        {zones.map((z, idx) => {
          const fromAngle =
            startAngle +
            ((z.from - minVisible) / (maxVisible - minVisible)) *
              (endAngle - startAngle);
          const toAngle =
            startAngle +
            ((z.to - minVisible) / (maxVisible - minVisible)) *
              (endAngle - startAngle);
          return (
            <path
              key={idx}
              d={describeArc(cx, cy, radius, fromAngle, toAngle)}
              stroke={z.color}
              strokeWidth={14}
              fill="none"
              strokeLinecap="round"
              opacity={1}
            />
          );
        })}

        {/* ticks and numeric labels removed as requested */}

        {/* Needle pivot background */}
        <circle cx={cx} cy={cy} r={radius * 0.12} fill="#222" opacity={0.95} />

        {/* Needle (animated via CSS transform to ensure smooth transitions) */}
        <g
          style={{
            transform: `translate(${cx}px, ${cy}px) rotate(${angle}deg) translate(${-cx}px, ${-cy}px)`,
            transition: "transform 600ms cubic-bezier(.2,.9,.2,1)",
            willChange: "transform",
          }}
        >
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - needleLen}
            stroke="#222"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <rect
            x={cx - 1}
            y={cy - needleLen}
            width={2}
            height={needleLen}
            fill="#222"
            opacity={0.95}
          />
          <circle
            cx={cx}
            cy={cy - needleLen + 8}
            r={6}
            fill="#fff"
            opacity={0.06}
          />
        </g>

        {/* center cap */}
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#fff"
          stroke="#0b1226"
          strokeWidth={1}
        />

        {/* subtle center label */}
        <text
          x={cx}
          y={cy + radius * 0.55}
          textAnchor="middle"
          fontSize={16}
          fill="#000434"
          fontWeight={800}
        >
          {raw}
        </text>
        {/* {validTill && <text x={cx} y={cy + radius * 0.75} textAnchor="middle" fontSize={8} fill="#666">Validity: {validTill}</text>} */}
      </svg>
      {label && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "#111", fontWeight: 800 }}>
            Ecom Credit Score
          </div>
          <div
            style={{
              fontSize: 12,
              marginTop: 6,
              display: "flex",
              gap: 12,
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#00e676", fontWeight: 800 }}>Low</span>
            <span style={{ color: "#ff9100", fontWeight: 800 }}>Moderate</span>
            <span style={{ color: "#ff1744", fontWeight: 800 }}>High</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditScoreMeter;
