import React, { useState, useEffect } from 'react';

export function ConstructionScene() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 20px" }}>
      {/* Animated SVG Construction Scene */}
      <div style={{ position: "relative", marginBottom: 32 }}>
        <svg width="100%" viewBox="0 0 480 320" style={{ filter: "drop-shadow(0 0 40px rgba(251,146,60,0.2))" }}>
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0e1a" /><stop offset="100%" stopColor="#0f1525" /></linearGradient>
            <linearGradient id="bldg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#1d2742" /><stop offset="100%" stopColor="#161e34" /></linearGradient>
            <linearGradient id="bldg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#252f4d" /><stop offset="100%" stopColor="#1d2742" /></linearGradient>
            <linearGradient id="acc" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fb923c" /><stop offset="100%" stopColor="#f97316" /></linearGradient>
            <linearGradient id="acc2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fb923c" stopOpacity="0.9" /><stop offset="100%" stopColor="#fb923c" stopOpacity="0.3" /></linearGradient>
            <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>

          <rect width="480" height="320" fill="url(#sky)" />

          <g opacity="0.08">
            {[0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480].map(x => <line key={x} x1={x} y1="0" x2={x} y2="320" stroke="#3b82f6" strokeWidth="0.5" />)}
            {[0, 40, 80, 120, 160, 200, 240, 280, 320].map(y => <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="#3b82f6" strokeWidth="0.5" />)}
          </g>

          <circle cx="420" cy="50" r="22" fill="#1d2742" opacity="0.9" />
          <circle cx="410" cy="44" r="22" fill="#0a0e1a" />
          <circle cx="420" cy="50" r="2" fill="#fbbf24" opacity="0.8" />

          {[[30, 20], [80, 15], [150, 25], [280, 18], [360, 30], [400, 10], [50, 60], [180, 10], [320, 45]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1" fill="white" opacity={0.3 + Math.sin(tick * 0.5 + i) * 0.3} />
          ))}

          <rect x="0" y="200" width="60" height="120" fill="#0f1525" opacity="0.9" />
          <rect x="65" y="190" width="45" height="130" fill="#0f1525" opacity="0.9" />
          <rect x="380" y="210" width="50" height="110" fill="#0f1525" opacity="0.9" />
          <rect x="430" y="200" width="50" height="120" fill="#0f1525" opacity="0.9" />

          {[[10, 210], [10, 230], [25, 210], [25, 230], [75, 200], [75, 220], [90, 200], [90, 220], [385, 220], [400, 215], [435, 215], [450, 215]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="8" height="6" fill={i % 3 === 0 ? "#fbbf24" : i % 3 === 1 ? "#3b82f6" : "#fb923c"} opacity={0.3 + Math.sin(tick + i) * 0.2} rx="1" />
          ))}

          <rect x="160" y="290" width="160" height="10" fill="#252f4d" rx="2" />

          {[
            { y: 260, h: 30, w: 140, x: 170, delay: 0 },
            { y: 232, h: 28, w: 140, x: 170, delay: 0.3 },
            { y: 205, h: 27, w: 140, x: 170, delay: 0.6 },
            { y: 178, h: 27, w: 140, x: 170, delay: 0.9 },
            { y: 152, h: 26, w: 140, x: 170, delay: 1.2 },
            { y: 126, h: 26, w: 140, x: 170, delay: 1.5 },
            { y: 100, h: 26, w: 140, x: 170, delay: 1.8 },
          ].map((f, i) => (
            <g key={i} style={{ animation: `buildFloor 0.6s ease ${f.delay}s both` }}>
              <rect x={f.x} y={f.y} width={f.w} height={f.h} fill="url(#bldg1)" rx="1" />
              <rect x={f.x} y={f.y} width={f.w} height="2" fill="url(#acc)" opacity="0.6" />
              {[0, 1, 2, 3].map(w => (
                <rect key={w} x={f.x + 12 + w * 34} y={f.y + 8} width="20" height={f.h - 14} fill={Math.sin(tick * 0.7 + i + w) > 0 ? "#fbbf24" : "#3b82f6"} opacity={0.15 + Math.abs(Math.sin(tick * 0.5 + i + w)) * 0.25} rx="2" />
              ))}
            </g>
          ))}

          <g style={{ animation: "buildFloor 0.6s ease 2.1s both" }}>
            <rect x="170" y="78" width="140" height="22" fill="#1d2742" opacity="0.7" rx="1" />
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <line key={i} x1={173 + i * 21} y1="100" x2={173 + i * 21} y2="70" stroke="#fb923c" strokeWidth="1.5" opacity="0.5" />
            ))}
            <line x1="170" y1="85" x2="310" y2="85" stroke="#fb923c" strokeWidth="1" opacity="0.4" />
          </g>

          <g style={{ transformOrigin: "240px 60px" }}>
            <rect x="237" y="30" width="6" height="70" fill="#fb923c" opacity="0.9" />
            <g style={{ animation: "craneSwing 4s ease-in-out infinite", transformOrigin: "240px 40px" }}>
              <rect x="180" y="37" width="120" height="5" fill="#fb923c" opacity="0.9" rx="2" />
              <line x1="290" y1="42" x2="290" y2="72" stroke="#e5e7eb" strokeWidth="1.5" opacity="0.6" />
              <rect x="285" y="72" width="10" height="8" fill="#94a3b8" rx="2" opacity="0.8" />
              <line x1="240" y1="30" x2="290" y2="42" stroke="#fb923c" strokeWidth="1" opacity="0.5" />
            </g>
            <rect x="175" y="35" width="20" height="12" fill="#475569" rx="2" opacity="0.8" />
          </g>

          <g style={{ animation: "buildFloor 0.5s ease 0.5s both" }}>
            <rect x="80" y="160" width="75" height="140" fill="url(#bldg2)" rx="1" />
            <rect x="80" y="160" width="75" height="3" fill="#3b82f6" opacity="0.5" />
          </g>

          <g style={{ animation: "buildFloor 0.5s ease 0.8s both" }}>
            <rect x="325" y="140" width="75" height="160" fill="url(#bldg2)" rx="1" />
            <rect x="325" y="140" width="75" height="3" fill="#a78bfa" opacity="0.5" />
          </g>

          <rect x="0" y="298" width="480" height="22" fill="#0f1525" />
          <rect x="0" y="295" width="480" height="5" fill="#1d2742" />

          <g style={{ animation: "float 4s ease-in-out 1s infinite", transformOrigin: "110px 285px" }}>
            <rect x="95" y="278" width="35" height="18" fill="#fbbf24" rx="2" />
            <rect x="90" y="283" width="45" height="12" fill="#f59e0b" rx="2" />
            <rect x="87" y="290" width="51" height="6" fill="#d97706" rx="2" />
          </g>

          <rect x="160" y="310" width="160" height="4" fill="#252f4d" rx="2" />
          <rect x="160" y="310" width={`${120 + Math.sin(tick * 0.5) * 30}`} height="4" fill="url(#acc)" rx="2" style={{ transition: "width 1s ease" }} />
          <text x="240" y="320" textAnchor="middle" fill="#fb923c" fontSize="8" fontWeight="700" opacity="0.8">UNDER CONSTRUCTION</text>
        </svg>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ height: 2, background: "linear-gradient(90deg,#fb923c,transparent)", flex: 1 }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--acc)", letterSpacing: "0.2em" }}>CONSTRUCTION INTELLIGENCE</span>
          <div style={{ height: 2, background: "linear-gradient(270deg,#fb923c,transparent)", flex: 1 }} />
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 8 }}>
          Every site.<br />
          <span style={{ background: "linear-gradient(135deg,#fb923c,#f97316,#fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% auto", animation: "shimmer 3s linear infinite" }}>One command centre.</span>
        </h1>
        <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6 }}>DWR · DPR · BOQ · Materials · Indents · Labour · Issues · Subcon Ledger</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { icon: "ti-building-skyscraper", val: "3", lbl: "Active Projects", color: "#fb923c" },
          { icon: "ti-trending-up", val: "78%", lbl: "Avg Progress", color: "#10b981" },
          { icon: "ti-users", val: "54", lbl: "Workers Today", color: "#a78bfa" },
          { icon: "ti-package", val: "2", lbl: "Pending Approvals", color: "#fbbf24" },
        ].map((s, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--br)", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, backdropFilter: "blur(4px)", transition: "all 0.2s" }}
            onMouseEnter={(e: any) => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={(e: any) => { e.currentTarget.style.borderColor = "var(--br)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: s.color + "22", border: "1px solid " + s.color + "44", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className={"ti " + s.icon} style={{ fontSize: 16, color: s.color }} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "var(--t3)", fontWeight: 600 }}>{s.lbl}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 7 }}>
        {[
          { ic: "ti-cube", t: "Material master — Colour, HSN Code & Steel Diameters" },
          { ic: "ti-package", t: "Multi-item Indents with Note for Approval & PO/WO" },
          { ic: "ti-shield-check", t: "MD decision visible to all — full transparency" },
          { ic: "ti-address-book", t: "Subcon Ledger — WO tracking & payment balances" },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: 0, animation: `fadeIn 0.4s ease ${0.3 + i * 0.1}s forwards` }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className={"ti " + f.ic} style={{ fontSize: 12, color: "#fb923c" }} />
            </div>
            <span style={{ fontSize: 12, color: "var(--t2)" }}>{f.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
