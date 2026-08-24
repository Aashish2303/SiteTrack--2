import React, { useState } from 'react';
import { USERS, ROLE_META } from '../constants';
import { ConstructionScene } from './ConstructionScene';

export function Login({ onLogin, onSignUp, users = [], showToast }: any) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [signup, setSignup] = useState(false);

  const submit = async () => {
    setLoading(true);
    setErr("");
    await new Promise(r => setTimeout(r, 600));
    const usr = users.find((x: any) => x.username === u.trim() && x.password === p && x.role !== "admin");
    if (!usr) {
      setErr("Wrong username or password");
      showToast?.("Wrong username or password", "error");
      setLoading(false);
      return;
    }
    onLogin(usr);
  };

  if (signup) return <SignupForm users={users} onBack={() => setSignup(false)} onSignUp={onSignUp} showToast={showToast} />;

  return (
    <div className="blueprint-bg login-container" style={{ minHeight: "100vh", display: "flex", alignItems: "stretch", position: "relative", overflow: "hidden" }}>
      {/* Ambient glow orbs */}
      <div style={{ position: "absolute", top: -200, left: -100, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -200, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(251,146,60,0.08), transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "30%", left: "35%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.04), transparent 70%)", pointerEvents: "none" }} />

      {/* Scan line */}
      <div className="scan-line" style={{ zIndex: 1, pointerEvents: "none" }} />

      {/* LEFT SIDE - Construction Scene */}
      <div className="login-left" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px", maxWidth: "55%", position: "relative", zIndex: 2 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 40 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #fb923c, #f97316)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(251,146,60,0.5)" }} className="glow-acc">
            <i className="ti ti-building-skyscraper" style={{ fontSize: 26, color: "#fff" }} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em" }}>SiteTrack <span style={{ color: "#fb923c" }}>Pro</span></div>
            <div style={{ fontSize: 8, color: "var(--t3)", letterSpacing: "0.18em", fontWeight: 700 }}>CONSTRUCTION INTELLIGENCE PLATFORM</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 20, padding: "4px 10px" }}>
            <div className="live-dot" />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981" }}>LIVE</span>
          </div>
        </div>

        <ConstructionScene />

        {/* Bottom tape stripe */}
        <div className="tape-stripe" style={{ marginTop: 24, borderRadius: 4, opacity: 0.4 }} />
      </div>

      {/* Divider */}
      <div className="login-divider" style={{ width: 1, background: "linear-gradient(180deg, transparent, var(--br), var(--acc), var(--br), transparent)", opacity: 0.6, alignSelf: "stretch" }} />

      {/* RIGHT SIDE - Login Form */}
      <div className="login-right" style={{ width: "45%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 48px", position: "relative", zIndex: 2 }}>
        <div style={{ opacity: 0, animation: "slideInRight 0.6s ease 0.2s forwards" }}>
          {/* Form header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 3, height: 24, background: "linear-gradient(180deg, #fb923c, #f97316)", borderRadius: 2 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--t3)", letterSpacing: "0.1em" }}>SECURE ACCESS</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }}>Welcome back</div>
            <div style={{ fontSize: 13, color: "var(--t2)" }}>Sign in to your company account</div>
          </div>

          {/* Username */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--t3)", marginBottom: 7, letterSpacing: "0.08em", textTransform: "uppercase" }}>Username</div>
            <div style={{ position: "relative" }}>
              <i className="ti ti-user" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--t3)", fontSize: 15, zIndex: 1 }} />
              <input type="text" value={u} onChange={e => { setU(e.target.value); setErr(""); }} placeholder="Enter username"
                onKeyDown={e => e.key === "Enter" && submit()}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--br)", borderRadius: 10, padding: "13px 14px 13px 42px", fontSize: 14, width: "100%", color: "var(--t1)", transition: "all 0.2s" }}
                onFocus={(e: any) => { e.target.style.borderColor = "#fb923c"; e.target.style.background = "rgba(251,146,60,0.05)"; e.target.style.boxShadow = "0 0 0 3px rgba(251,146,60,0.15)"; }}
                onBlur={(e: any) => { e.target.style.borderColor = "var(--br)"; e.target.style.background = "rgba(255,255,255,0.04)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--t3)", marginBottom: 7, letterSpacing: "0.08em", textTransform: "uppercase" }}>Password</div>
            <div style={{ position: "relative" }}>
              <i className="ti ti-lock" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--t3)", fontSize: 15, zIndex: 1 }} />
              <input type="password" value={p} onChange={e => { setP(e.target.value); setErr(""); }} placeholder="Enter password"
                onKeyDown={e => e.key === "Enter" && submit()}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--br)", borderRadius: 10, padding: "13px 14px 13px 42px", fontSize: 14, width: "100%", color: "var(--t1)", transition: "all 0.2s" }}
                onFocus={(e: any) => { e.target.style.borderColor = "#fb923c"; e.target.style.background = "rgba(251,146,60,0.05)"; e.target.style.boxShadow = "0 0 0 3px rgba(251,146,60,0.15)"; }}
                onBlur={(e: any) => { e.target.style.borderColor = "var(--br)"; e.target.style.background = "rgba(255,255,255,0.04)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* Error */}
          {err && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", padding: "10px 14px", borderRadius: 10, fontSize: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-alert-circle" style={{ fontSize: 16 }} />{err}
          </div>}

          {/* Sign In Button */}
          <button onClick={submit} disabled={loading} style={{ width: "100%", height: 52, background: loading ? "rgba(251,146,60,0.5)" : "linear-gradient(135deg, #fb923c, #f97316)", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, color: "#fff", cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 4px 24px rgba(251,146,60,0.4)", transition: "all 0.2s", backgroundSize: "200% auto", animation: loading ? "none" : "shimmer 3s linear infinite", marginBottom: 24 }}
            onMouseEnter={(e: any) => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(251,146,60,0.5)"; e.currentTarget.style.background = "linear-gradient(135deg, #f97316, #fb923c)"; } }}
            onMouseLeave={(e: any) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(251,146,60,0.4)"; e.currentTarget.style.background = "linear-gradient(135deg, #fb923c, #f97316)"; }}>
            {loading
              ? <><div style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTop: "2.5px solid white", borderRadius: "50%" }} className="spin" />Signing in...</>
              : <><i className="ti ti-login-2" style={{ fontSize: 18 }} />Sign In to SiteTrack Pro</>
            }
          </button>

          <button onClick={() => setSignup(true)} style={{ width: "100%", background: "transparent", border: "1px solid var(--br)", color: "var(--t2)", borderRadius: 10, padding: "11px 14px", cursor: "pointer", fontWeight: 700, fontSize: 12, marginBottom: 24 }}><i className="ti ti-user-plus" style={{ marginRight: 7 }} />Create a new account</button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "var(--br)" }} />
            <span style={{ fontSize: 10, color: "var(--t3)", fontWeight: 600, letterSpacing: "0.1em" }}>TEAM MEMBERS</span>
            <div style={{ flex: 1, height: 1, background: "var(--br)" }} />
          </div>

          {/* Demo users */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {users.filter((usr: any) => usr.role !== "admin").map((usr: any, i: number) => {
              const color = ROLE_META[usr.role].color;
              return <div key={usr.username} onClick={() => onLogin(usr)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--br)", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s", cursor: "pointer", opacity: 0, animation: `fadeIn 0.4s ease ${0.5 + i * 0.08}s forwards` }}
                onMouseEnter={(e: any) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = color + "11"; }}
                onMouseLeave={(e: any) => { e.currentTarget.style.borderColor = "var(--br)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: color + "22", border: "1px solid " + color + "44", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className={"ti " + ROLE_META[usr.role].icon} style={{ fontSize: 14, color }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{usr.name}</div>
                  <div style={{ fontSize: 10, color: "var(--t3)" }}>{usr.username}</div>
                </div>
              </div>;
            })}
          </div>

          {/* Footer note */}
          <div style={{ marginTop: 20, padding: "10px 14px", background: "rgba(251,146,60,0.05)", border: "1px solid rgba(251,146,60,0.15)", borderRadius: 8, fontSize: 11, color: "var(--t3)", display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-shield-lock" style={{ fontSize: 14, color: "#fb923c" }} />
            All data auto-saved locally and synced
          </div>
        </div>
      </div>
    </div>
  );
}

function SignupForm({ users, onBack, onSignUp, showToast }: any) {
  const [form, setForm] = useState({ name: "", username: "", password: "", role: "engineer" });
  const submit = () => {
    const username = form.username.trim().toLowerCase();
    if (!form.name.trim() || !username || form.password.length < 6) return showToast("Enter a name, username, and password of 6+ characters", "error");
    if (users.some((user: any) => user.username === username)) return showToast("Username already exists", "error");
    const name = form.name.trim();
    onSignUp({ name, username, password: form.password, role: form.role, avatar: name.split(/\s+/).map((part: string) => part[0]).join("").slice(0, 2).toUpperCase() });
  };
  return <div className="blueprint-bg signup-page"><div className="signup-card">
    <button className="signup-back" onClick={onBack}><i className="ti ti-arrow-left" /> Back to sign in</button>
    <div className="signup-heading"><div className="signup-icon"><i className="ti ti-user-plus" /></div><div><div className="signup-eyebrow">TEAM ACCESS</div><h1>Create account</h1><p>Join your SiteTrack project team.</p></div></div>
    <div className="signup-form">{[["name", "Full name", "text", "ti-id", "e.g. Priya Mehta"], ["username", "Username", "text", "ti-at", "Choose a username"], ["password", "Password", "password", "ti-lock", "At least 6 characters"]].map(([key, label, type, icon, placeholder]) => <label key={key}><span>{label}</span><div className="signup-input-wrap"><i className={`ti ${icon}`} /><input type={type} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} /></div></label>)}</div>
    <label className="signup-role"><span>Team role</span><div className="signup-select-wrap"><i className="ti ti-briefcase" /><select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>{Object.entries(ROLE_META).filter(([role]) => !["admin", "md"].includes(role)).map(([role, meta]) => <option key={role} value={role}>{meta.label}</option>)}</select><i className="ti ti-chevron-down signup-select-arrow" /></div></label>
    <div className="signup-note"><i className="ti ti-shield-check" /><span>Accounts are saved for your project team.</span></div><button className="signup-submit" onClick={submit}><i className="ti ti-user-plus" /> Create account</button>
  </div></div>;
}
