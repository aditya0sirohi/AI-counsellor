export default function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: 120 }}>
      <h1 style={{ fontSize: 48 }}>AI Study Abroad Counsellor</h1>
      <p style={{ opacity: 0.7, marginTop: 10 }}>
        Stage-based AI guidance from profile → universities → applications
      </p>

      <a
        href="/demo"
        style={{
          display: "inline-block",
          marginTop: 40,
          background: "#6366f1",
          padding: "14px 28px",
          borderRadius: 10,
          color: "white",
          textDecoration: "none",
          fontSize: 18
        }}
      >
        Start Demo →
      </a>
    </div>
  );
}
