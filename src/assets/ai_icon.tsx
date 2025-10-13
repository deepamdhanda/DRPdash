export default function AIIcon(props: React.SVGProps<SVGSVGElement>) {
    // Extract style and other props
    const { style, ...rest } = props;

    // Default styles for the wrapper div
    const defaultDivStyle: React.CSSProperties = {
        display: "inline-block",
        animation: "pulse 2s ease-in-out infinite",
        transformOrigin: "50% 50%",
        ...(style as React.CSSProperties), // Merge incoming style
    };

    // Default styles for the SVG
    const defaultSvgStyle: React.CSSProperties = {
        display: "block",
        width: style?.width || 50,
        height: style?.height ? style?.height : undefined,
    };

    return (
        <div style={defaultDivStyle}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={style?.width || 50}
                height={style?.height ? style?.height : undefined}
                viewBox="0 0 48 48"
                style={defaultSvgStyle}
                {...rest}
            >
                <defs>
                    {/* Gradient for stroke */}
                    <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#090d75ff" />
                        <stop offset="20%" stopColor="#efb326ff" />
                        <stop offset="50%" stopColor="#f5891e" />
                        <stop offset="80%" stopColor="#efb326ff" />
                        <stop offset="100%" stopColor="#090d75ff" />
                    </linearGradient>

                    {/* Animate gradient for shine effect */}
                    <animate
                        xlinkHref="#strokeGradient"
                        attributeName="x1"
                        values="-100%;100%"
                        dur="3s"
                        repeatCount="indefinite"
                    />
                    <animate
                        xlinkHref="#strokeGradient"
                        attributeName="x2"
                        values="0%;200%"
                        dur="3s"
                        repeatCount="indefinite"
                    />
                </defs>

                {/* Main fill path */}
                <path
                    fill="#000434"
                    d="M23.426,31.911l-1.719,3.936c-0.661,1.513-2.754,1.513-3.415,0l-1.719-3.936
      c-1.529-3.503-4.282-6.291-7.716-7.815l-4.73-2.1c-1.504-0.668-1.504-2.855,0-3.523l4.583-2.034
      c3.522-1.563,6.324-4.455,7.827-8.077l1.741-4.195c0.646-1.557,2.797-1.557,3.443,0l1.741,4.195
      c1.503,3.622,4.305,6.514,7.827,8.077l4.583,2.034c1.504,0.668,1.504,2.855,0,3.523l-4.73,2.1
      C27.708,25.62,24.955,28.409,23.426,31.911z"
                />

                {/* Inner stroke path (scaled down to stay inside) */}
                <path
                    fill="none"
                    stroke="url(#strokeGradient)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="200"
                    strokeDashoffset="200"
                    transform="scale(0.95) translate(1.2 1.2)" // keeps stroke inside fill
                    d="M23.426,31.911l-1.719,3.936c-0.661,1.513-2.754,1.513-3.415,0l-1.719-3.936
      c-1.529-3.503-4.282-6.291-7.716-7.815l-4.73-2.1c-1.504-0.668-1.504-2.855,0-3.523l4.583-2.034
      c3.522-1.563,6.324-4.455,7.827-8.077l1.741-4.195c0.646-1.557,2.797-1.557,3.443,0l1.741,4.195
      c1.503,3.622,4.305,6.514,7.827,8.077l4.583,2.034c1.504,0.668,1.504,2.855,0,3.523l-4.73,2.1
      C27.708,25.62,24.955,28.409,23.426,31.911z"
                >
                    <animate
                        attributeName="stroke-dashoffset"
                        from="200"
                        to="0"
                        dur="3s"
                        repeatCount="indefinite"
                    />
                </path>

                {/* Additional fill path (orange) */}
                <path
                    fill="#f5891e"
                    d="M38.423,43.248l-0.493,1.131c-0.361,0.828-1.507,0.828-1.868,0l-0.493-1.131
      c-0.879-2.016-2.464-3.621-4.44-4.5l-1.52-0.675c-0.822-0.365-0.822-1.56,0-1.925l1.435-0.638
      c2.027-0.901,3.64-2.565,4.504-4.65l0.507-1.222c0.353-0.852,1.531-0.852,1.884,0l0.507,1.222
      c0.864,2.085,2.477,3.749,4.504,4.65l1.435,0.638c0.822,0.365,0.822,1.56,0,1.925l-1.52,0.675
      C40.887,39.627,39.303,41.232,38.423,43.248z"
                />
            </svg>

            <style>
                {`
      /* Pulse animation */
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); } /* subtle grow */
      }
    `}
            </style>
        </div>
    );
}