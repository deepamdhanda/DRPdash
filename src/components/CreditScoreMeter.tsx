import DecorativeSvg from "../screens/user/Orders";

const CreditScoreMeter = ({ score, label = false, width = 120 }: { score: number, label?: boolean, width?: number }) => {
  const normalized = Math.max(0, Math.min(score, 900));

  return (
    <div
      style={{
        width: width,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <DecorativeSvg width={width} score={normalized} />
      <div style={{ fontSize: 13, fontWeight: 700, marginTop: -10 }}>
        {normalized}
        <span style={{ fontSize: 9 }}>/900</span>
      </div>
      {label && <div
        style={{
          fontSize: 9,
          color: "#666",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Ecom Credit Score
      </div>}
    </div>
  );
};

export default CreditScoreMeter;