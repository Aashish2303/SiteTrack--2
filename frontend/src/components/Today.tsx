import React from 'react';
import { ROLE_META, scol, ucol, colDot } from '../constants';
import { Card, Badge, PBar } from './UI';
import { today, fmtD } from '../utils';

export function Today({ user, projects, dwr, dpr, boq, indents, mat, labour, issues, stockMap, setMod, setActiveProjectId }: any) {
  const td = today();
  const hr = new Date().getHours();
  const todayDWR = dwr.filter((d: any) => d.date === td);
  const todayLabour = labour.filter((l: any) => l.date === td);
  const totalLabour = todayLabour.reduce((s: any, l: any) => s + l.count, 0);
  const pending = indents.filter((i: any) => i.status !== "Approved" && i.status !== "Rejected");
  const lowStock = mat.filter((m: any) => (stockMap[m.id] || 0) <= m.minStock);
  const openIssues = issues.filter((i: any) => i.status === "Open");
  const ovPct = boq.length ? Math.round(boq.reduce((s: any, i: any) => s + i.cumDone, 0) / boq.reduce((s: any, i: any) => s + i.boqQty, 0) * 100) : 0;
  
  const stats = [
    { lbl: "Active Sites", val: projects.filter((p: any) => p.status === "Active").length, color: "#fb923c", icon: "ti-building-skyscraper", tab: "projects" },
    { lbl: "Today's Work", val: todayDWR.length, color: "#3b82f6", icon: "ti-clipboard", tab: "dwr" },
    { lbl: "Workers Today", val: totalLabour, color: "#a78bfa", icon: "ti-users", tab: "labour" },
    { lbl: "Pending Approvals", val: pending.length, color: "#fbbf24", icon: "ti-bell-ringing", tab: "indents" },
    { lbl: "Open Issues", val: openIssues.length, color: "#ef4444", icon: "ti-alert-triangle", tab: "issues" },
    { lbl: "Stock Alerts", val: lowStock.length, color: "#ef4444", icon: "ti-package", tab: "materials" },
  ];

  return (
    <div className="dashboard fadeIn">
      <div className="dashboard-hero" style={{ padding: "22px 26px", borderRadius: 14, background: "linear-gradient(135deg, rgba(251,146,60,0.08), rgba(59,130,246,0.04))", border: "1px solid var(--br)", marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "var(--t3)", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 4 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>Good {hr < 12 ? "Morning" : hr < 17 ? "Afternoon" : "Evening"}, {user.name.split(" ")[0]} 👋</div>
        <div style={{ color: "var(--t2)", fontSize: 13, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} className="pulse" />Overall progress: <strong style={{ color: "#10b981" }}>{ovPct}%</strong></span>
          <span style={{ color: ROLE_META[user.role].color, fontWeight: 700 }}><i className={"ti " + ROLE_META[user.role].icon} style={{ marginRight: 4 }} />{ROLE_META[user.role].label}</span>
        </div>
      </div>
      
      <div className="dash-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 20 }}>
        {stats.map(s => (
          <div className="dashboard-stat" key={s.lbl} onClick={() => setMod(s.tab)} style={{ background: "var(--s1)", border: "1px solid var(--br)", borderRadius: 13, padding: "16px 14px", cursor: "pointer", position: "relative", overflow: "hidden", transition: "all 0.2s" }}
            onMouseEnter={(e: any) => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e: any) => { e.currentTarget.style.borderColor = "var(--br)"; e.currentTarget.style.transform = "translateY(0)"; }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, background: s.color }} />
            <i className={"ti " + s.icon} style={{ fontSize: 20, color: s.color, marginBottom: 7, display: "block" }} />
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 10, color: "var(--t3)", fontWeight: 700, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1.3 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="dash-grid-2 dashboard-panels" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Project Progress</span>
            <button onClick={() => setMod("boq")} style={{ background: "none", border: "none", color: "var(--t3)", cursor: "pointer", fontSize: 12 }}><i className="ti ti-arrow-right" /> Full BOQ</button>
          </div>
          {projects.map((p: any) => {
            const items = boq.filter((b: any) => b.projectId === p.id && !b.isExtra);
            const pct = items.length ? Math.round(items.reduce((s: any, i: any) => s + i.cumDone, 0) / items.reduce((s: any, i: any) => s + i.boqQty, 0) * 100) : 0;
            const c = pct >= 80 ? "#10b981" : pct >= 50 ? "#fbbf24" : "#fb923c";
            return (
              <button key={p.id} onClick={() => { setActiveProjectId?.(p.id); setMod("dwr"); }} style={{ width: "100%", textAlign: "left", marginBottom: 12, padding: "10px 0 12px", border: 0, borderBottom: "1px solid var(--br)", background: "transparent", color: "inherit", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <div><div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div><div style={{ fontSize: 11, color: "var(--t3)" }}>{p.location} · {p.client}</div></div>
                  <span style={{ fontWeight: 900, fontSize: 18, color: c }}>{pct}%</span>
                </div>
                <PBar pct={pct} color={c} />
              </button>
            );
          })}
        </Card>
        
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}><i className="ti ti-bell-ringing" style={{ color: "#fbbf24", marginRight: 6 }} />Pending Actions</span>
            <button onClick={() => setMod("indents")} style={{ background: "none", border: "none", color: "var(--t3)", cursor: "pointer", fontSize: 12 }}><i className="ti ti-arrow-right" /> All Indents</button>
          </div>
          {pending.length === 0 ? <div style={{ color: "#10b981", fontSize: 13, textAlign: "center", padding: 20 }}><i className="ti ti-check" /> All clear!</div>
            : pending.slice(0, 4).map((i: any) => {
              const items = i.items || [{ item: i.item }];
              return (
                <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--br)" }}>
                  <div><div style={{ fontWeight: 600, fontSize: 13 }}>{items[0]?.item}{items.length > 1 ? <span style={{ marginLeft: 6, color: "var(--t3)", fontSize: 11 }}>+{items.length - 1} more</span> : ""}</div><div style={{ fontSize: 11, color: "var(--t3)" }}>{projects.find((x: any) => x.id === i.projectId)?.name?.split(" - ")[0] || "-"}</div></div>
                  <Badge text={i.status} color={scol[i.status]} />
                </div>
              );
            })}
        </Card>
      </div>

      <div className="dash-grid-2 dashboard-panels" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}><i className="ti ti-alert-triangle" style={{ color: "#ef4444", marginRight: 6 }} />Stock Alerts</div>
          {lowStock.length === 0 ? <div style={{ color: "#10b981", fontSize: 13, textAlign: "center", padding: 20 }}><i className="ti ti-check" /> All stocks OK!</div>
            : lowStock.map((m: any) => (
              <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--br)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {m.colour && m.colour !== "—" && <div style={{ width: 8, height: 8, borderRadius: "50%", background: colDot(m.colour), border: "1px solid var(--br2)" }} />}
                  <div><div style={{ fontWeight: 600, fontSize: 13, color: "#fca5a5" }}>{m.name}</div><div style={{ fontSize: 11, color: "var(--t3)" }}>{stockMap[m.id] || 0} {m.unit} · Min: {m.minStock}</div></div>
                </div>
                <Badge text="REORDER" color="#ef4444" />
              </div>
            ))}
        </Card>
        
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}><i className="ti ti-alert-circle" style={{ color: "#ef4444", marginRight: 6 }} />Open Issues</div>
          {openIssues.length === 0 ? <div style={{ color: "#10b981", fontSize: 13, textAlign: "center", padding: 20 }}><i className="ti ti-check" /> No open issues!</div>
            : openIssues.slice(0, 4).map((i: any) => (
              <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--br)" }}>
                <div><div style={{ fontWeight: 600, fontSize: 13 }}>{i.title}</div><div style={{ fontSize: 11, color: "var(--t3)" }}>{projects.find((x: any) => x.id === i.projectId)?.name?.split(" - ")[0] || "-"} · {i.category}</div></div>
                <Badge text={i.priority} color={ucol[i.priority]} />
              </div>
            ))}
        </Card>
      </div>
    </div>
  );
}
