import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Card, Badge, Btn, Lbl, Inp, Sel } from './UI';
import { today, uid, fmtD } from '../utils';
import { ISSUE_CATS, INCHARGES, ENGINEERS, icol, ucol } from '../constants';

export function IssuesView({ user, projects, issues, setIssues, showToast }: any) {
  const PRIS = ["Low", "Medium", "High", "Critical"];
  const STATS = ["Open", "In Progress", "Resolved", "Closed"];
  const em = { date: today(), projectId: projects[0]?.id || "", title: "", description: "", category: ISSUE_CATS[0], priority: "High", status: "Open", assignedTo: INCHARGES[0], resolvedDate: "", remarks: "" };
  const [form, setForm] = useState(em);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("Open");
  const [editId, setEditId] = useState<number | null>(null);

  const s = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const canAdd = ["engineer", "qms", "md", "admin"].includes(user.role);

  const save = () => {
    if (!form.title) return showToast("Enter issue title", "error");
    if (editId) {
      setIssues((d: any) => d.map((i: any) => i.id === editId ? { ...i, ...form, projectId: +form.projectId } : i));
      showToast("Issue updated!");
    } else {
      setIssues((d: any) => [{ ...form, id: uid(), projectId: +form.projectId, createdAt: Date.now() }, ...d]);
      showToast("Issue logged!");
    }
    setForm(em);
    setOpen(false);
    setEditId(null);
  };

  const filtered = filter === "All" ? issues : issues.filter((i: any) => i.status === filter);
  const statusCounts: Record<string, number> = {};
  STATS.forEach(s => { statusCounts[s] = issues.filter((i: any) => i.status === s).length; });

  const exportXLS = () => {
    const ws = XLSX.utils.json_to_sheet(issues.map((i: any, n: number) => ({ "#": n + 1, Date: i.date, Project: projects.find((p: any) => p.id === i.projectId)?.name || "-", Title: i.title, Description: i.description, Category: i.category, Priority: i.priority, Status: i.status, "Assigned To": i.assignedTo, "Resolved Date": i.resolvedDate || "-", Remarks: i.remarks })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Issues");
    XLSX.writeFile(wb, "Issues_Report.xlsx");
  };

  return (
    <div className="fadeIn">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div><div style={{ fontSize: 26, fontWeight: 800 }}>Issues & Snag Tracker</div><div style={{ color: "var(--t2)", fontSize: 13, marginTop: 3 }}>Log · Track · Resolve site issues</div></div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" sm icon="ti-file-spreadsheet" onClick={exportXLS}>Export</Btn>
          {canAdd && <Btn onClick={() => { setEditId(null); setForm(em); setOpen(!open); }} icon={open ? "ti-x" : "ti-plus"}>{open ? "Close" : "Log Issue"}</Btn>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {STATS.map(st => (
          <div key={st} onClick={() => setFilter(st)} style={{ background: "var(--s1)", border: "1px solid " + (filter === st ? icol[st] : "var(--br)"), borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "all 0.15s" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: icol[st] }}>{statusCounts[st] || 0}</div>
            <div style={{ fontSize: 11, color: "var(--t3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{st}</div>
          </div>
        ))}
      </div>

      {open && canAdd && (
        <Card style={{ borderColor: "var(--acc)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><Lbl>Date</Lbl><Inp type="date" value={form.date} onChange={(e: any) => s("date", e.target.value)} /></div>
            <div><Lbl>Project</Lbl><Sel value={form.projectId} onChange={(e: any) => s("projectId", +e.target.value)}>{projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</Sel></div>
            <div style={{ gridColumn: "1/-1" }}><Lbl>Issue Title</Lbl><Inp value={form.title} onChange={(e: any) => s("title", e.target.value)} placeholder="Brief title of the issue" /></div>
            <div style={{ gridColumn: "1/-1" }}><Lbl>Description</Lbl><textarea value={form.description} onChange={e => s("description", e.target.value)} placeholder="Detailed description..." style={{ background: "var(--s2)", border: "1px solid var(--br)", borderRadius: 8, padding: "10px 12px", fontSize: 13, width: "100%", color: "var(--t1)", minHeight: 70, resize: "vertical" }} /></div>
            <div><Lbl>Category</Lbl><Sel value={form.category} onChange={(e: any) => s("category", e.target.value)}>{ISSUE_CATS.map(c => <option key={c}>{c}</option>)}</Sel></div>
            <div><Lbl>Priority</Lbl><Sel value={form.priority} onChange={(e: any) => s("priority", e.target.value)}>{PRIS.map(p => <option key={p}>{p}</option>)}</Sel></div>
            <div><Lbl>Status</Lbl><Sel value={form.status} onChange={(e: any) => s("status", e.target.value)}>{STATS.map(st => <option key={st}>{st}</option>)}</Sel></div>
            <div><Lbl>Assigned To</Lbl><Sel value={form.assignedTo} onChange={(e: any) => s("assignedTo", e.target.value)}>{[...INCHARGES, ...ENGINEERS].map(x => <option key={x}>{x}</option>)}</Sel></div>
            {(form.status === "Resolved" || form.status === "Closed") && <div><Lbl>Resolved Date</Lbl><Inp type="date" value={form.resolvedDate} onChange={(e: any) => s("resolvedDate", e.target.value)} /></div>}
            <div style={{ gridColumn: "1/-1" }}><Lbl>Remarks / Action Taken</Lbl><Inp value={form.remarks} onChange={(e: any) => s("remarks", e.target.value)} placeholder="Action taken or next steps" /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn onClick={save} icon="ti-device-floppy">{editId ? "Update" : "Log Issue"}</Btn>
            <Btn variant="ghost" onClick={() => { setOpen(false); setEditId(null); setForm(em); }}>Cancel</Btn>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <button onClick={() => setFilter("All")} style={{ background: filter === "All" ? "var(--acc)" : "var(--s2)", color: filter === "All" ? "#fff" : "var(--t2)", border: "1px solid " + (filter === "All" ? "var(--acc)" : "var(--br)"), borderRadius: 20, padding: "7px 16px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>All ({issues.length})</button>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {filtered.map((iss: any) => {
          const proj = projects.find((p: any) => p.id === iss.projectId);
          const sc = icol[iss.status];
          const pc = ucol[iss.priority];
          return (
            <div key={iss.id} style={{ background: "var(--s1)", border: "1px solid var(--br)", borderLeft: "4px solid " + sc, borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>{iss.title}</span>
                    <Badge text={iss.priority} color={pc} icon="ti-flag" />
                    <Badge text={iss.status} color={sc} />
                    <Badge text={iss.category} color="var(--t3)" />
                  </div>
                  {iss.description && <div style={{ color: "var(--t2)", fontSize: 13, marginBottom: 6 }}>{iss.description}</div>}
                  <div style={{ color: "var(--t3)", fontSize: 12, display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <span><i className="ti ti-building" style={{ fontSize: 11 }} /> {proj?.name || "-"}</span>
                    <span><i className="ti ti-user" style={{ fontSize: 11 }} /> {iss.assignedTo}</span>
                    <span><i className="ti ti-calendar" style={{ fontSize: 11 }} /> {fmtD(iss.date)}</span>
                    {iss.resolvedDate && <span style={{ color: "#10b981" }}><i className="ti ti-check" style={{ fontSize: 11 }} /> Resolved: {fmtD(iss.resolvedDate)}</span>}
                  </div>
                  {iss.remarks && <div style={{ marginTop: 8, fontSize: 12, color: "var(--t2)", padding: "6px 10px", background: "var(--s2)", borderRadius: 7, display: "inline-block", fontStyle: "italic" }}><i className="ti ti-message-circle" style={{ fontSize: 11, marginRight: 4 }} />{iss.remarks}</div>}
                </div>
                {canAdd && iss.status !== "Closed" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn sm variant="ghost" icon="ti-edit" onClick={() => { setForm({ ...iss, projectId: iss.projectId }); setEditId(iss.id); setOpen(true); }}>Edit</Btn>
                    {iss.status !== "Resolved" && <Btn sm variant="success" icon="ti-check" onClick={() => { setIssues((d: any) => d.map((i: any) => i.id === iss.id ? { ...i, status: "Resolved", resolvedDate: today() } : i)); showToast("Marked resolved!"); }}>Resolve</Btn>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--t3)" }}><i className="ti ti-check" style={{ fontSize: 40, display: "block", marginBottom: 10, color: "#10b981" }} />No {filter !== "All" ? filter.toLowerCase() : ""} issues</div>}
      </div>
    </div>
  );
}
