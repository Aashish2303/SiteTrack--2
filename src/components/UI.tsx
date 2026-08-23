import React from 'react';

export function Btn({ children, onClick, variant, sm, full, disabled, icon }: any) {
  variant = variant || "primary";
  const S: any = {
    primary: { background: "var(--acc)", color: "#fff", border: "none", borderBottom: "4px solid var(--acc2)" },
    secondary: { background: "var(--s3)", color: "var(--t1)", border: "none", borderBottom: "4px solid var(--br2)" },
    ghost: { background: "transparent", color: "var(--t2)", border: "1px solid var(--br)" },
    success: { background: "#16a34a", color: "#fff", border: "none", borderBottom: "4px solid #15803d" },
    danger: { background: "#dc2626", color: "#fff", border: "none", borderBottom: "4px solid #991b1b" },
    info: { background: "#2563eb", color: "#fff", border: "none", borderBottom: "4px solid #1d4ed8" },
    warn: { background: "#eab308", color: "#1e1e2e", border: "none", borderBottom: "4px solid #a16207" },
    purple: { background: "#9333ea", color: "#fff", border: "none", borderBottom: "4px solid #7e22ce" }
  };
  return (
    <button disabled={disabled} onClick={onClick} style={{ ...S[variant], padding: sm ? "6px 13px" : "10px 18px", borderRadius: 6, fontWeight: 800, fontSize: sm ? 11 : 13, textTransform: "uppercase", letterSpacing: "-0.02em", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, width: full ? "100%" : "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, whiteSpace: "nowrap", transition: "all 0.1s" }}>
      {icon && <i className={"ti " + icon} style={{ fontSize: sm ? 13 : 15 }} />}{children}
    </button>
  );
}

export function Inp({ value, onChange, type, placeholder, icon, readOnly }: any) {
  type = type || "text";
  return (
    <div style={{ position: "relative" }}>
      {icon && <i className={"ti " + icon} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--t3)", fontSize: 14, pointerEvents: "none" }} />}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder || ""} readOnly={readOnly} style={{ background: "var(--s2)", border: "1px solid var(--br)", borderRadius: 8, padding: icon ? "10px 12px 10px 36px" : "10px 12px", fontSize: 13, width: "100%", color: "var(--t1)" }} />
    </div>
  );
}

export function Sel({ value, onChange, children }: any) {
  return (
    <select value={value} onChange={onChange} style={{ background: "var(--s2)", border: "1px solid var(--br)", borderRadius: 8, padding: "10px 12px", fontSize: 13, width: "100%", color: "var(--t1)", cursor: "pointer" }}>
      {children}
    </select>
  );
}

export function Lbl({ children }: any) {
  return <div style={{ fontSize: 10, fontWeight: 800, color: "var(--t4)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.1em" }}>{children}</div>;
}

export function Card({ children, style }: any) {
  return <div style={{ background: "var(--s2)", border: "1px solid var(--br)", borderRadius: 8, padding: "20px 22px", marginBottom: 16, ...style }}>{children}</div>;
}

export function Badge({ text, color, icon }: any) {
  color = color || "var(--t2)";
  return (
    <span style={{ background: color + "20", color, padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", display: "inline-flex", alignItems: "center", gap: 4, border: "1px solid " + color + "50" }}>
      {icon && <i className={"ti " + icon} style={{ fontSize: 11 }} />}{text}
    </span>
  );
}

export function PBar({ pct, h, color }: any) {
  h = h || 12;
  const c = color || (pct >= 100 ? "#22c55e" : pct >= 60 ? "#f59e0b" : pct >= 30 ? "#f97316" : "#ef4444");
  return (
    <div style={{ background: "var(--s1)", borderRadius: 6, height: h, overflow: "hidden", border: "1px solid var(--br2)" }}>
      <div style={{ width: Math.min(pct, 100) + "%", height: "100%", background: c, boxShadow: `0 0 15px ${c}80`, transition: "width 0.5s" }} />
    </div>
  );
}

export function TH({ c, ...props }: { c: React.ReactNode; [key: string]: any }) {
  return <th {...props} style={{ padding: "10px 13px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid var(--br)", background: "var(--s2)", whiteSpace: "nowrap" }}>{c}</th>;
}

export function TD({ children, bold, color, mono }: any) {
  return <td style={{ padding: "11px 13px", fontSize: 13, color: color || "var(--t1)", borderBottom: "1px solid var(--br)", fontWeight: bold ? 700 : 400, fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit" }}>{children}</td>;
}
