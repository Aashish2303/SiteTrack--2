import React, { useState, useMemo, useEffect } from 'react';
import { useStore, lsS, lsG } from './store';
import { USERS, SD_PROJECTS, SD_BOQ, SD_DWR, SD_DPR, SD_MAT, SD_TXN, SD_INDENTS, SD_LABOUR, SD_ISSUES, SD_SUBCON, SD_VENDOR_LEDGER, SD_VENDOR_DB, SD_ORDERS, ROLE_META, canSeeFinance } from './constants';
import { Login } from './components/Login';
import { Today } from './components/Today';
import { ProjectsView } from './components/ProjectsView';
import { DWRView } from './components/DWRView';
import { DPRView } from './components/DPRView';
import { BOQView } from './components/BOQView';
import { MaterialsView } from './components/MaterialsView';
import { IndentsView } from './components/IndentsView';
import { LabourView } from './components/LabourView';
import { IssuesView } from './components/IssuesView';
import { SubconLedger } from './components/SubconLedger';
import { VendorLedger } from './components/VendorLedger';
import { VendorDirectory } from './components/VendorDirectory';
import { MaterialOrders } from './components/MaterialOrders';
import { QMSReports } from './components/QMSReports';
import { Badge } from './components/UI';
import { ToastProvider, useToast } from './components/Toast';
import { AdminPage } from './components/AdminPage';

export default function App() {
  return <ToastProvider><RouteApp /></ToastProvider>;
}

function RouteApp() {
  const [route, setRoute] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  if (route === '/admin') return <AdminPage />;
  return <AppContent />;
}

function AppContent() {
  const { showToast } = useToast();
  const [user, setUser] = useState(() => lsG("user", null));
  const [users, setUsers] = useState(() => lsG("users", USERS));
  const [mod, setMod] = useState("today");
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigateModule = (nextMod: string) => {
    if (nextMod === mod) return;
    window.history.pushState({ module: nextMod }, '', `/?module=${nextMod}`);
    setMod(nextMod);
    setSidebarOpen(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialModule = params.get('module');
    if (initialModule) setMod(initialModule);
    const onPopState = () => setMod(new URLSearchParams(window.location.search).get('module') || 'today');
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  
  const [projects, setProjects] = useStore("projects", SD_PROJECTS);
  const [boq, setBoq] = useStore("boq", SD_BOQ);
  const [dwr, setDwr] = useStore("dwr", SD_DWR);
  const [dpr, setDpr] = useStore("dpr", SD_DPR);
  const [mat, setMat] = useStore("mat", SD_MAT);
  const [txn, setTxn] = useStore("txn", SD_TXN);
  const [indents, setIndents] = useStore("indents", SD_INDENTS);
  const [labour, setLabour] = useStore("labour", SD_LABOUR);
  const [issues, setIssues] = useStore("issues", SD_ISSUES);
  const [subconLedger, setSubconLedger] = useStore("subconLedger", SD_SUBCON);
  const [vendorLedger, setVendorLedger] = useStore("vendorLedger", SD_VENDOR_LEDGER);
  const [vendorDB, setVendorDB] = useStore("vendorDB", SD_VENDOR_DB);
  const [orders, setOrders] = useStore("orders", SD_ORDERS);

  const stockMap = useMemo(() => {
    const m: Record<string, number> = {};
    mat.forEach((mt: any) => {
      const ins = txn.filter((t: any) => t.material === mt.id && t.type === "IN").reduce((s: any, t: any) => s + t.qty, 0);
      const outs = txn.filter((t: any) => t.material === mt.id && t.type === "OUT").reduce((s: any, t: any) => s + t.qty, 0);
      m[mt.id] = mt.opening + ins - outs;
    });
    return m;
  }, [mat, txn]);

  const notifs = useMemo(() => {
    if (!user) return [];
    const n: any[] = [];
    mat.forEach((m: any) => { if ((stockMap[m.id] || 0) <= m.minStock) n.push({ text: `${m.name} low (${stockMap[m.id] || 0} ${m.unit})`, goto: "materials", icon: "ti-alert-triangle", color: "#ef4444" }); });
    if (user.role === "sales") indents.filter((i: any) => i.status === "Pending Quotation").forEach((i: any) => n.push({ text: `Quotation needed: ${(i.items || [{ item: i.item }])[0]?.item || "—"}`, goto: "indents", icon: "ti-file-invoice", color: "#a78bfa" }));
    if (user.role === "md") indents.filter((i: any) => i.status === "MD Review").forEach((i: any) => n.push({ text: `Approval needed: ${(i.items || [{ item: i.item }])[0]?.item || "—"}`, goto: "indents", icon: "ti-bell-ringing", color: "#fb923c" }));
    issues.filter((i: any) => i.priority === "Critical" && i.status === "Open").forEach((i: any) => n.push({ text: `Critical: ${i.title}`, goto: "issues", icon: "ti-alert-octagon", color: "#ef4444" }));
    return n;
  }, [mat, stockMap, indents, issues, user]);

  if (!user) return <Login users={users} onLogin={(u: any) => { lsS("user", u); setUser(u); showToast(`Welcome, ${u.name}!`); }} onSignUp={(u: any) => { const next = [...users, u]; setUsers(next); lsS("users", next); lsS("user", u); setUser(u); showToast(`Welcome to SiteTrack, ${u.name}!`); }} showToast={showToast} />;

  const GLOBAL_NAV = [
    { id: "today", icon: "ti-bolt", label: "Dashboard" },
    { id: "projects", icon: "ti-building-skyscraper", label: "Projects Directory" },
    ...(canSeeFinance(user.role) ? [
      { id: "subcon", icon: "ti-address-book", label: "Subcon Ledger" },
      { id: "vendorledger", icon: "ti-businessplan", label: "Vendor Ledger" },
    ] : []),
    ...(["md", "sales", "admin"].includes(user.role) ? [
      { id: "vendordb", icon: "ti-id-badge-2", label: "Vendor Directory" },
    ] : []),
  ];

  const PROJECT_NAV = [
    { id: "dwr", icon: "ti-clipboard", label: "Daily Works (DWR)" },
    { id: "dpr", icon: "ti-trending-up", label: "Progress (DPR)" },
    { id: "boq", icon: "ti-list-numbers", label: "BOQ Tracker" },
    { id: "materials", icon: "ti-cube", label: "Materials & Stock" },
    { id: "orders", icon: "ti-truck-delivery", label: "Material Orders" },
    { id: "indents", icon: "ti-package", label: "Indents & Quotes" },
    { id: "labour", icon: "ti-users", label: "Labour Tracker" },
    { id: "issues", icon: "ti-alert-triangle", label: "Issues/Incidents" },
    ...(user.role !== "engineer" ? [{ id: "reports", icon: "ti-file-report", label: "QMS Reports" }] : []),
  ];

  const common = { user, projects, showToast, activeProjectId, setActiveProjectId, setMod: navigateModule };

  const renderMod = () => {
    if (mod === "reports" && user.role === "engineer") return <Today {...common} dwr={dwr} dpr={dpr} boq={boq} indents={indents} mat={mat} labour={labour} issues={issues} stockMap={stockMap} setMod={navigateModule} />;
    // If activeProjectId is set, only pass filtered data to components
    const filteredProps = {
      ...common,
      dwr: activeProjectId ? dwr.filter((d:any) => d.projectId === activeProjectId) : dwr,
      dpr: activeProjectId ? dpr.filter((d:any) => d.projectId === activeProjectId) : dpr,
      boq: activeProjectId ? boq.filter((b:any) => b.projectId === activeProjectId) : boq,
      indents: activeProjectId ? indents.filter((i:any) => i.projectId === activeProjectId) : indents,
      labour: activeProjectId ? labour.filter((l:any) => l.projectId === activeProjectId) : labour,
      issues: activeProjectId ? issues.filter((i:any) => i.projectId === activeProjectId) : issues,
      orders: activeProjectId ? orders.filter((o:any) => o.projectId === activeProjectId) : orders,
      txn: activeProjectId ? txn.filter((t:any) => t.projectId === activeProjectId) : txn,
    };

    if (mod === "today") return <Today {...common} dwr={dwr} dpr={dpr} boq={boq} indents={indents} mat={mat} labour={labour} issues={issues} stockMap={stockMap} setMod={navigateModule} />;
    if (mod === "projects") return <ProjectsView {...common} setProjects={setProjects} boq={boq} setBoq={setBoq} />;
    if (mod === "dwr") return <DWRView {...filteredProps} setDwr={setDwr} />;
    if (mod === "dpr") return <DPRView {...filteredProps} setDpr={setDpr} setBoq={setBoq} />;
    if (mod === "boq") return <BOQView {...filteredProps} setBoq={setBoq} />;
    if (mod === "materials") return <MaterialsView {...filteredProps} mat={mat} setMat={setMat} setTxn={setTxn} stockMap={stockMap} />;
    if (mod === "indents") return <IndentsView {...filteredProps} setIndents={setIndents} />;
    if (mod === "labour") return <LabourView {...filteredProps} setLabour={setLabour} />;
    if (mod === "issues") return <IssuesView {...filteredProps} setIssues={setIssues} />;
    if (mod === "subcon") return <SubconLedger {...common} subconLedger={subconLedger} setSubconLedger={setSubconLedger} />;
    if (mod === "vendorledger") return <VendorLedger {...common} vendorLedger={vendorLedger} setVendorLedger={setVendorLedger} vendorDB={vendorDB} />;
    if (mod === "vendordb") return <VendorDirectory {...common} vendorDB={vendorDB} setVendorDB={setVendorDB} />;
    if (mod === "orders") return <MaterialOrders {...filteredProps} setOrders={setOrders} vendorDB={vendorDB} />;
    if (mod === "reports") return <QMSReports {...filteredProps} mat={mat} />;
    return null;
  };

  const pendingCount = activeProjectId 
    ? indents.filter((i: any) => i.projectId === activeProjectId && i.status !== "Approved" && i.status !== "Rejected").length 
    : indents.filter((i: any) => i.status !== "Approved" && i.status !== "Rejected").length;
  const openIssueCount = activeProjectId
    ? issues.filter((i: any) => i.projectId === activeProjectId && i.status === "Open").length
    : issues.filter((i: any) => i.status === "Open").length;

  const navItem = (n: any) => {
    const active = mod === n.id;
    const badge = n.id === "indents" ? pendingCount : n.id === "issues" ? openIssueCount : 0;
    return (
      <div key={n.id} onClick={() => navigateModule(n.id)} className={active ? "nav-active" : ""} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", cursor: "pointer", background: active ? "var(--acc-dim)" : "transparent", color: active ? "var(--acc)" : "var(--t3)", fontSize: 13, fontWeight: active ? 800 : 600, userSelect: "none", transition: "all 0.1s" }}
        onMouseEnter={(e: any) => { if (!active) e.currentTarget.style.background = "var(--s2)"; }}
        onMouseLeave={(e: any) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
        <i className={"ti " + n.icon} style={{ fontSize: 15, color: active ? "#fb923c" : "var(--t3)", flexShrink: 0 }} /><span style={{ flex: 1 }}>{n.label}</span>
        {badge > 0 && <span style={{ background: "#ef4444", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{badge}</span>}
      </div>
    );
  };

  const activeProjectName = projects.find((p:any) => p.id === activeProjectId)?.name;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div className={`mobile-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar app-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ width: 240, background: "var(--s1)", minHeight: "100vh", display: "flex", flexDirection: "column", position: "fixed", left: 0, top: 0, zIndex: 100, borderRight: "1px solid var(--br)" }}>
        <div style={{ padding: "18px 15px 14px", borderBottom: "1px solid var(--br)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 6, background: "var(--acc)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 15px -3px rgba(249,115,22,0.2)" }}><span style={{ fontSize: 24, fontWeight: 900, color: "#020617" }}>ST</span></div>
            <div><div style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em", textTransform: "uppercase" }}>SiteTrack <span style={{ color: "var(--acc)" }}>Pro</span></div></div>
          </div>
          <button className="hamburger-btn" style={{ color: "var(--t3)", fontSize: 20 }} onClick={() => setSidebarOpen(false)}>
            <i className="ti ti-x" />
          </button>
        </div>
        <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
          {!activeProjectId ? (
            <>
              <div style={{ padding: "8px 15px 4px", fontSize: 9, fontWeight: 700, color: "var(--t3)", letterSpacing: "0.12em" }}>GLOBAL OVERVIEW</div>
              {GLOBAL_NAV.map(navItem)}
            </>
          ) : (
            <>
              <div style={{ padding: "12px 15px", display: "flex", flexDirection: "column", gap: 8, borderBottom: "1px solid var(--br)", marginBottom: 8 }}>
                  <button onClick={() => { setActiveProjectId(null); navigateModule("projects"); }} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "var(--t3)", fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", padding: 0 }}>
                  <i className="ti ti-arrow-left" /> Back to Directory
                </button>
                <div style={{ fontSize: 15, fontWeight: 900, color: "var(--t1)", lineHeight: 1.2 }}>{activeProjectName}</div>
              </div>
              <div style={{ padding: "8px 15px 4px", fontSize: 9, fontWeight: 700, color: "var(--t3)", letterSpacing: "0.12em" }}>PROJECT MODULES</div>
              {PROJECT_NAV.map(navItem)}
            </>
          )}
        </nav>
        <div style={{ padding: 12, borderTop: "1px solid var(--br)" }}>
          <div style={{ background: "var(--s2)", padding: "12px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, textAlign: "right" }}><div style={{ fontSize: 13, fontWeight: 800 }}>{user.name}</div><div style={{ fontSize: 10, color: "var(--acc)", fontWeight: 800, textTransform: "uppercase" }}>{ROLE_META[user.role].label}</div></div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--br2)", border: "2px solid var(--acc)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "var(--t1)" }}>{user.avatar}</div>
            <button onClick={() => showToast("Are you sure you want to sign out?", "warning", { duration: 0, action: { label: "Sign out", onClick: () => { lsS("user", null); setUser(null); showToast("You have been signed out.", "info"); } } })} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--t3)" }}><i className="ti ti-logout" style={{ fontSize: 16 }} /></button>
          </div>
        </div>
      </aside>

      <main className={`main-content ${sidebarOpen ? "" : "sidebar-closed"}`} style={{ marginLeft: sidebarOpen ? 220 : 0, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <header className="app-header" style={{ background: "var(--s1)", borderBottom: "1px solid var(--br)", height: 64, padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <button className="hamburger-btn" aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"} onClick={() => setSidebarOpen(!sidebarOpen)}>
              <i className={`ti ${sidebarOpen ? "ti-layout-sidebar-left-collapse" : "ti-menu-2"}`} />
            </button>
            <div className="header-sys-status" style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 10, color: "var(--t4)", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em" }}>System Status</span>
              <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: "#10b981", fontWeight: 700 }}>ENCRYPTED & ONLINE</span>
            </div>
            <div className="header-sys-status" style={{ width: 1, height: 32, background: "var(--br)" }} />
            <div className="header-sys-status" style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 10, color: "var(--t4)", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em" }}>Server Time</span>
              <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: "var(--t1)" }}>{new Date().toISOString().replace('T', ' ').substring(0, 19)}</span>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <button onClick={() => setNotifOpen(!notifOpen)} style={{ background: "var(--s2)", border: "1px solid var(--br)", borderRadius: 9, padding: "8px 13px", cursor: "pointer", fontSize: 13, color: "var(--t1)", display: "flex", alignItems: "center", gap: 7 }}>
              <i className="ti ti-bell" style={{ fontSize: 15 }} />Notifications
              {notifs.length > 0 && <span style={{ background: "#ef4444", color: "#fff", borderRadius: 10, padding: "2px 7px", fontSize: 10, fontWeight: 700 }}>{notifs.length}</span>}
            </button>
            {notifOpen && (
              <div style={{ position: "absolute", right: 0, top: 46, background: "var(--s1)", border: "1px solid var(--br)", borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,0.5)", width: 340, zIndex: 200, overflow: "hidden" }}>
                <div style={{ padding: "13px 17px", borderBottom: "1px solid var(--br)", fontWeight: 700, fontSize: 13 }}>Notifications ({notifs.length})</div>
                <div style={{ maxHeight: 400, overflowY: "auto" }}>
                  {notifs.length === 0 && <div style={{ padding: "28px 17px", color: "var(--t3)", fontSize: 13, textAlign: "center" }}><i className="ti ti-check" style={{ fontSize: 22, display: "block", marginBottom: 6, color: "#10b981" }} />All clear!</div>}
                  {notifs.map((n: any, i: number) => (
                    <div key={i} onClick={() => { navigateModule(n.goto); setNotifOpen(false); }} style={{ padding: "11px 17px", borderBottom: "1px solid var(--br)", cursor: "pointer", display: "flex", gap: 11, alignItems: "flex-start" }}>
                      <i className={"ti " + n.icon} style={{ fontSize: 15, color: n.color, marginTop: 2 }} /><span style={{ fontSize: 13, lineHeight: 1.4 }}>{n.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>
        <div style={{ flex: 1, padding: "22px 24px 60px" }} className="app-page fadeIn">{renderMod()}</div>
      </main>

    </div>
  );
}
